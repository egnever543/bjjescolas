import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { DAY_FULL_LABELS, MODALITY_LABELS } from "@/types";
import type { DayOfWeek, Modality } from "@/types";
import { Clock, User } from "lucide-react";

const DAYS_ORDER: DayOfWeek[] = [
  "SEGUNDA",
  "TERCA",
  "QUARTA",
  "QUINTA",
  "SEXTA",
  "SABADO",
  "DOMINGO",
];

const MODALITY_COLORS: Record<Modality, string> = {
  BJJ: "border-l-blue-500 bg-blue-900/10",
  MUAY_THAI: "border-l-red-500 bg-red-900/10",
  JUDO: "border-l-yellow-500 bg-yellow-900/10",
  WRESTLING: "border-l-orange-500 bg-orange-900/10",
  BOXE: "border-l-purple-500 bg-purple-900/10",
  MMA: "border-l-green-500 bg-green-900/10",
  KARATE: "border-l-pink-500 bg-pink-900/10",
  OUTRO: "border-l-gray-500 bg-gray-900/10",
};

async function getClasses(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: {
        include: {
          branches: { select: { id: true } },
        },
      },
    },
  });

  const branchIds = user?.ownedAcademy?.branches.map((b) => b.id) ?? [];

  return prisma.class.findMany({
    where: { branchId: { in: branchIds } },
    include: {
      professor: { include: { user: true } },
      branch: true,
    },
    orderBy: { startTime: "asc" },
  });
}

export default async function AulasPage() {
  const session = await auth();
  const classes = session?.user?.id ? await getClasses(session.user.id) : [];

  const byDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = classes.filter((c) => c.dayOfWeek === day);
      return acc;
    },
    {} as Record<DayOfWeek, typeof classes>
  );

  const activeDays = DAYS_ORDER.filter((day) => byDay[day].length > 0);

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Grade de Aulas</h1>
        <span className="text-gray-400 text-sm">{classes.length} aulas</span>
      </div>

      {activeDays.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Nenhuma aula cadastrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeDays.map((day) => (
            <div key={day}>
              <h2 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">
                {DAY_FULL_LABELS[day]}
              </h2>
              <div className="space-y-2">
                {byDay[day].map((cls) => (
                  <Card
                    key={cls.id}
                    className={`bg-gray-900 border-gray-800 border-l-4 ${MODALITY_COLORS[cls.modality as Modality]}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm">{cls.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <Clock className="w-3 h-3" />
                              {cls.startTime} - {cls.endTime}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400 text-xs">
                              <User className="w-3 h-3" />
                              {cls.professor.user.name.split(" ")[0]}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full flex-shrink-0">
                          {MODALITY_LABELS[cls.modality as Modality]}
                        </span>
                      </div>
                      {cls.maxStudents && (
                        <p className="text-gray-500 text-xs mt-1">
                          Máx. {cls.maxStudents} alunos
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
