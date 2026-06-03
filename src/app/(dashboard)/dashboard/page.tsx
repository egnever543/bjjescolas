import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, CheckSquare, TrendingUp } from "lucide-react";
import { DAY_LABELS, MODALITY_LABELS } from "@/types";
import type { DayOfWeek, Modality } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

async function getStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: {
        include: {
          branches: {
            include: {
              students: true,
              classes: {
                include: { professor: { include: { user: true } } },
              },
            },
          },
        },
      },
    },
  });

  const academy = user?.ownedAcademy;
  if (!academy) return null;

  const allStudents = academy.branches.flatMap((b) => b.students);
  const allClasses = academy.branches.flatMap((b) => b.classes);

  const today = new Date();
  const dayMap: Record<number, string> = {
    0: "DOMINGO",
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  };
  const todayDay = dayMap[today.getDay()];

  const todayClasses = allClasses.filter((c) => c.dayOfWeek === todayDay);
  const checkInsToday = await prisma.checkIn.count({
    where: {
      date: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      },
    },
  });

  const nextClass = todayClasses
    .filter((c) => {
      const [h, m] = c.startTime.split(":").map(Number);
      const classTime = new Date();
      classTime.setHours(h, m, 0, 0);
      return classTime > today;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  return {
    totalStudents: allStudents.length,
    totalClasses: allClasses.length,
    todayClasses: todayClasses.length,
    checkInsToday,
    nextClass,
    academyName: academy.name,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = session?.user?.id ? await getStats(session.user.id) : null;

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">
          Olá, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-400 text-sm capitalize">{today}</p>
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              title="Total de Alunos"
              value={stats.totalStudents.toString()}
              icon={<Users className="w-5 h-5 text-blue-400" />}
              color="bg-blue-900/20 border-blue-800/30"
            />
            <StatCard
              title="Aulas Hoje"
              value={stats.todayClasses.toString()}
              icon={<Calendar className="w-5 h-5 text-green-400" />}
              color="bg-green-900/20 border-green-800/30"
            />
            <StatCard
              title="Check-ins Hoje"
              value={stats.checkInsToday.toString()}
              icon={<CheckSquare className="w-5 h-5 text-yellow-400" />}
              color="bg-yellow-900/20 border-yellow-800/30"
            />
            <StatCard
              title="Total de Aulas"
              value={stats.totalClasses.toString()}
              icon={<TrendingUp className="w-5 h-5 text-red-400" />}
              color="bg-red-900/20 border-red-800/30"
            />
          </div>

          {stats.nextClass && (
            <Card className="bg-gradient-to-r from-red-900/40 to-red-800/20 border-red-700/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm font-semibold uppercase tracking-wider">
                  Próxima Aula
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white text-xl font-bold">{stats.nextClass.name}</p>
                <div className="flex items-center gap-3 mt-1 text-gray-300 text-sm">
                  <span className="font-semibold text-red-400">
                    {stats.nextClass.startTime} - {stats.nextClass.endTime}
                  </span>
                  <span>•</span>
                  <span>{MODALITY_LABELS[stats.nextClass.modality as Modality]}</span>
                  <span>•</span>
                  <span>{DAY_LABELS[stats.nextClass.dayOfWeek as DayOfWeek]}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="bg-gray-900 border-gray-800 p-6">
          <p className="text-gray-400 text-center">
            Configure sua academia para ver estatísticas.
          </p>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              { label: "Novo Aluno", href: "/alunos" },
              { label: "Check-in", href: "/checkin" },
              { label: "Grade", href: "/aulas" },
              { label: "Professores", href: "/professores" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {action.label}
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card className={`${color} border`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {icon}
        </div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{title}</p>
      </CardContent>
    </Card>
  );
}
