import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import { BELT_LABELS } from "@/types";
import type { Belt } from "@/types";
import { subDays, startOfDay, format } from "date-fns";

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-black text-white mb-6">Relatórios</h1>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Configure sua academia para ver relatórios.</p>
          </CardContent>
        </Card>
      </div>
    );
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

  // Average frequency
  const totalCheckIns = allStudents.reduce((sum, s) => sum + s.checkIns.length, 0);
  const frequenciaMedia = allStudents.length > 0
    ? Math.round((totalCheckIns / allStudents.length) * 10) / 10
    : 0;

  // Inadimplentes
  const inadimplentes = allStudents.filter((s) => {
    const latest = s.payments[0];
    if (!latest) return false;
    return latest.status === "OVERDUE" || latest.status === "PENDING";
  }).length;

  // Check-ins last 7 days
  const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
  const recentCheckIns = await prisma.checkIn.findMany({
    where: {
      student: { branchId: { in: allBranchIds } },
      date: { gte: sevenDaysAgo },
    },
  });

  const checkinsPorDiaMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    checkinsPorDiaMap[format(subDays(new Date(), i), "dd/MM")] = 0;
  }
  for (const ci of recentCheckIns) {
    const day = format(ci.date, "dd/MM");
    if (day in checkinsPorDiaMap) checkinsPorDiaMap[day]++;
  }
  const checkinsPorDia = Object.entries(checkinsPorDiaMap).map(([dia, count]) => ({ dia, count }));

  // Top 3 classes
  const topAulas = allClasses
    .map((cls) => ({ name: cls.name, count: cls.checkIns.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const maxBeltCount = Math.max(...alunosPorFaixa.map((b) => b.count), 1);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Relatórios</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-900/20 border-blue-800/30">
          <CardContent className="p-4">
            <Users className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-black text-white">{allStudents.length}</p>
            <p className="text-xs text-gray-400">Total de Alunos</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800/30">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-black text-white">{frequenciaMedia}</p>
            <p className="text-xs text-gray-400">Frequência Média</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-800/30">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-2xl font-black text-white">{inadimplentes}</p>
            <p className="text-xs text-gray-400">Inadimplentes</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
            Distribuição por Faixa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alunosPorFaixa.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum dado</p>
          ) : (
            alunosPorFaixa.map(({ belt, count }) => (
              <div key={belt} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">{BELT_LABELS[belt as Belt] ?? belt}</span>
                  <span className="text-gray-400 text-sm font-semibold">{count}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full"
                    style={{ width: `${(count / maxBeltCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
            Check-ins nos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checkinsPorDia.map(({ dia, count }) => (
              <div key={dia} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0">
                <span className="text-gray-400 text-sm">{dia}</span>
                <span className="text-white font-semibold text-sm">{count} check-ins</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {topAulas.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
              Top 3 Aulas Mais Frequentadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topAulas.map(({ name, count }, index) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-gray-500 font-bold text-sm w-5 text-center">{index + 1}</span>
                <p className="flex-1 text-white text-sm font-medium">{name}</p>
                <span className="text-gray-400 text-sm">{count} check-ins</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
