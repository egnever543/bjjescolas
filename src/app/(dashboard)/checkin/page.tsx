import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAccessibleBranchIds } from "@/lib/access";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckinManageRow } from "@/components/alunos/checkin-manage-row";
import { MODALITY_LABELS } from "@/types";
import type { Modality } from "@/types";
import { Clock, Users } from "lucide-react";

async function getTodayClasses(userId: string) {
  // Filiais acessíveis conforme o papel (professor -> a própria; dono -> as dele).
  const branchIds = await getAccessibleBranchIds(userId);

  const dayMap: Record<number, string> = {
    0: "DOMINGO",
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  };
  const todayDay = dayMap[new Date().getDay()];

  const classes = await prisma.class.findMany({
    where: {
      branchId: { in: branchIds },
      dayOfWeek: todayDay as never,
    },
    include: {
      professor: { include: { user: true } },
      branch: {
        include: {
          students: { include: { user: true } },
        },
      },
      checkIns: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return classes;
}

export default async function CheckInPage() {
  const session = await auth();
  const classes = session?.user?.id ? await getTodayClasses(session.user.id) : [];

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Check-in</h1>
        <p className="text-gray-400 text-sm capitalize">{today}</p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Nenhuma aula hoje</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => {
            const checkInByStudent = new Map(cls.checkIns.map((ci) => [ci.studentId, ci]));
            const students = cls.branch.students;
            const confirmedCount = cls.checkIns.filter((ci) => ci.confirmed).length;
            const pendingCount = cls.checkIns.filter((ci) => !ci.confirmed).length;

            return (
              <Card key={cls.id} className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-white text-base">{cls.name}</CardTitle>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {cls.startTime} - {cls.endTime}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Users className="w-3 h-3" />
                          {confirmedCount}/{students.length} presentes
                        </span>
                        {pendingCount > 0 && (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Clock className="w-3 h-3" />
                            {pendingCount} aguardando
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                      {MODALITY_LABELS[cls.modality as Modality]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-2">
                      Nenhum aluno nesta filial
                    </p>
                  ) : (
                    students.map((student) => {
                      const ci = checkInByStudent.get(student.id);
                      const status = ci ? (ci.confirmed ? "confirmed" : "pending") : "none";
                      return (
                        <CheckinManageRow
                          key={student.id}
                          studentId={student.id}
                          studentName={student.user.name}
                          classId={cls.id}
                          checkInId={ci?.id ?? null}
                          status={status}
                        />
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
