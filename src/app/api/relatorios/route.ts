import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { subDays, startOfDay, format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedAcademy: {
        include: {
          branches: {
            include: {
              students: {
                include: {
                  payments: { orderBy: { dueDate: "desc" }, take: 1 },
                  checkIns: true,
                },
              },
              classes: {
                include: { checkIns: true },
              },
            },
          },
        },
      },
    },
  });

  const academy = user?.ownedAcademy;
  if (!academy) {
    return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 });
  }

  const allStudents = academy.branches.flatMap((b) => b.students);
  const allClasses = academy.branches.flatMap((b) => b.classes);
  const allBranchIds = academy.branches.map((b) => b.id);

  // Belt distribution
  const beltCount: Record<string, number> = {};
  for (const student of allStudents) {
    beltCount[student.belt] = (beltCount[student.belt] || 0) + 1;
  }
  const alunosPorFaixa = Object.entries(beltCount).map(([belt, count]) => ({ belt, count }));

  // Average frequency (check-ins per student last 30 days)
  const totalCheckIns = allStudents.reduce((sum, s) => sum + s.checkIns.length, 0);
  const frequenciaMedia = allStudents.length > 0
    ? Math.round((totalCheckIns / allStudents.length) * 10) / 10
    : 0;

  // Inadimplentes: students with OVERDUE or PENDING payments
  const inadimplentes = allStudents.filter((s) => {
    const latestPayment = s.payments[0];
    if (!latestPayment) return false;
    return latestPayment.status === "OVERDUE" || latestPayment.status === "PENDING";
  }).length;

  // Check-ins by day (last 7 days)
  const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
  const recentCheckIns = await prisma.checkIn.findMany({
    where: {
      student: { branchId: { in: allBranchIds } },
      date: { gte: sevenDaysAgo },
    },
  });

  const checkinsPorDia: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "dd/MM");
    checkinsPorDia[day] = 0;
  }
  for (const ci of recentCheckIns) {
    const day = format(ci.date, "dd/MM");
    if (day in checkinsPorDia) {
      checkinsPorDia[day]++;
    }
  }

  // Top 3 classes by check-ins
  const classCheckinCount = allClasses.map((cls) => ({
    name: cls.name,
    count: cls.checkIns.length,
  }));
  classCheckinCount.sort((a, b) => b.count - a.count);
  const topAulas = classCheckinCount.slice(0, 3);

  return NextResponse.json({
    totalAlunos: allStudents.length,
    alunosPorFaixa,
    frequenciaMedia,
    inadimplentes,
    checkinsPorDia: Object.entries(checkinsPorDia).map(([dia, count]) => ({ dia, count })),
    topAulas,
  });
}
