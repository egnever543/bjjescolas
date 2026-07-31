import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckInButton } from "@/components/alunos/checkin-button";
import { MODALITY_LABELS } from "@/types";
import type { DayOfWeek, Modality } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getTodayClassesForStudent(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: {
      user: true,
      branch: {
        include: {
          classes: {
            include: {
              professor: { include: { user: true } },
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
          },
        },
      },
    },
  });

  if (!student) return { student: null, todayClasses: [] };

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

  return { student, todayClasses };
}

export default async function StudentCheckinPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { student, todayClasses } = await getTodayClassesForStudent(session.user.id);

  if (!student) {
    return (
      <div className="p-4 text-center py-16">
        <p className="text-gray-400">Perfil não encontrado.</p>
      </div>
    );
  }

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <Link href="/minha-area" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4">
        <ArrowLeft className="w-4 h-4" />
        Minha Área
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Check-in</h1>
        <p className="text-gray-400 text-sm capitalize">{today}</p>
      </div>

      {todayClasses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Nenhuma aula hoje</p>
        </div>
      ) : (
        <div className="space-y-4">
          {todayClasses.map((cls) => {
            const myCheckIn = cls.checkIns.find((ci) => ci.studentId === student.id);
            const isCheckedIn = !!myCheckIn;

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
                        <span className="text-gray-400 text-xs">{cls.professor.user.name.split(" ")[0]}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                      {MODALITY_LABELS[cls.modality as Modality]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CheckInButton
                    studentId={student.id}
                    studentName={student.user.name}
                    classId={cls.id}
                    isCheckedIn={isCheckedIn}
                    confirmed={myCheckIn?.confirmed ?? false}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
