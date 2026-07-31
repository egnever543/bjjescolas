import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BELT_COLORS, BELT_LABELS, MODALITY_LABELS, DAY_FULL_LABELS } from "@/types";
import type { Belt, Modality, DayOfWeek } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckSquare, Clock, Bell } from "lucide-react";
import Link from "next/link";

async function getStudentData(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: true,
      branch: {
        include: {
          classes: {
            include: { professor: { include: { user: true } } },
            orderBy: { startTime: "asc" },
          },
          academy: {
            include: {
              announcements: {
                where: { OR: [{ branchId: null }] },
                include: { createdBy: { select: { name: true } } },
                orderBy: { createdAt: "desc" },
                take: 3,
              },
            },
          },
        },
      },
      checkIns: {
        where: { confirmed: true },
        include: { class: true },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });
  return student;
}

export default async function MinhaAreaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await getStudentData(session.user.id);
  if (!student) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-gray-400">Perfil de aluno não encontrado.</p>
      </div>
    );
  }

  const dayMap: Record<number, DayOfWeek> = {
    0: "DOMINGO",
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  };
  const todayDay = dayMap[new Date().getDay()];
  const todayClasses = student.branch.classes.filter((c) => c.dayOfWeek === todayDay);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-black text-white">
          {student.user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-black text-white">{student.user.name}</h1>
          <p className="text-gray-400 text-sm">{student.branch.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${BELT_COLORS[student.belt as Belt]}`}>
              {BELT_LABELS[student.belt as Belt]}
            </span>
            {student.degree > 0 && (
              <div className="flex gap-0.5">
                {Array.from({ length: student.degree }).map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-yellow-400" />
                ))}
              </div>
            )}
            <span className="text-gray-500 text-xs">{MODALITY_LABELS[student.modality as Modality]}</span>
          </div>
        </div>
      </div>

      {/* Today's classes */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Aulas Hoje
            </CardTitle>
            <Link href="/minha-area/checkin" className="text-red-400 text-xs font-medium hover:text-red-300">
              Fazer Check-in
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todayClasses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-3">Nenhuma aula hoje</p>
          ) : (
            <div className="space-y-2">
              {todayClasses.map((cls) => (
                <div key={cls.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-white text-sm font-medium">{cls.name}</p>
                    <p className="text-gray-500 text-xs">{cls.professor.user.name.split(" ")[0]}</p>
                  </div>
                  <span className="flex items-center gap-1 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {cls.startTime}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Announcements */}
      {student.branch.academy.announcements.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Avisos
              </CardTitle>
              <Link href="/minha-area/avisos" className="text-red-400 text-xs font-medium hover:text-red-300">
                Ver todos
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.branch.academy.announcements.map((a) => (
              <div key={a.id} className="border-b border-gray-800 last:border-0 pb-3 last:pb-0">
                <p className="text-white text-sm font-medium">{a.title}</p>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{a.content}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {a.createdBy.name.split(" ")[0]} · {format(a.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent check-ins */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Últimos Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {student.checkIns.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-3">Nenhum check-in ainda</p>
          ) : (
            <div className="space-y-2">
              {student.checkIns.map((ci) => (
                <div key={ci.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-white text-sm">{ci.class.name}</p>
                    <p className="text-gray-500 text-xs">{ci.class.startTime}</p>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {format(ci.date, "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
