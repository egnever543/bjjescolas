import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import { BELT_LABELS } from "@/types";
import type { Belt } from "@/types";

type ReportData = {
  totalAlunos: number;
  alunosPorFaixa: { belt: string; count: number }[];
  frequenciaMedia: number;
  inadimplentes: number;
  checkinsPorDia: { dia: string; count: number }[];
  topAulas: { name: string; count: number }[];
};

async function getReportData(baseUrl: string): Promise<ReportData | null> {
  try {
    const res = await fetch(`${baseUrl}/api/relatorios`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const data = await getReportData(baseUrl);

  if (!data) {
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

  const maxBeltCount = Math.max(...data.alunosPorFaixa.map((b) => b.count), 1);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-black text-white">Relatórios</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-900/20 border-blue-800/30">
          <CardContent className="p-4">
            <Users className="w-5 h-5 text-blue-400 mb-2" />
            <p className="text-2xl font-black text-white">{data.totalAlunos}</p>
            <p className="text-xs text-gray-400">Total de Alunos</p>
          </CardContent>
        </Card>
        <Card className="bg-green-900/20 border-green-800/30">
          <CardContent className="p-4">
            <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
            <p className="text-2xl font-black text-white">{data.frequenciaMedia}</p>
            <p className="text-xs text-gray-400">Frequência Média</p>
          </CardContent>
        </Card>
        <Card className="bg-red-900/20 border-red-800/30">
          <CardContent className="p-4">
            <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
            <p className="text-2xl font-black text-white">{data.inadimplentes}</p>
            <p className="text-xs text-gray-400">Inadimplentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Belt distribution */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
            Distribuição por Faixa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.alunosPorFaixa.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhum dado</p>
          ) : (
            data.alunosPorFaixa.map(({ belt, count }) => (
              <div key={belt} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">
                    {BELT_LABELS[belt as Belt] ?? belt}
                  </span>
                  <span className="text-gray-400 text-sm font-semibold">{count}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all"
                    style={{ width: `${(count / maxBeltCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Check-ins last 7 days */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
            Check-ins nos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.checkinsPorDia.map(({ dia, count }) => (
              <div key={dia} className="flex items-center justify-between py-1 border-b border-gray-800 last:border-0">
                <span className="text-gray-400 text-sm">{dia}</span>
                <span className="text-white font-semibold text-sm">{count} check-ins</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 classes */}
      {data.topAulas.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
              Top 3 Aulas Mais Frequentadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topAulas.map(({ name, count }, index) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-gray-500 font-bold text-sm w-5 text-center">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{name}</p>
                </div>
                <span className="text-gray-400 text-sm">{count} check-ins</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
