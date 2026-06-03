import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BELT_COLORS, BELT_LABELS, MODALITY_LABELS } from "@/types";
import type { Belt, Modality } from "@/types";
import { GraduationCap } from "lucide-react";

async function getProfessors(userId: string) {
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

  return prisma.professor.findMany({
    where: { branchId: { in: branchIds } },
    include: {
      user: true,
      branch: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ProfessoresPage() {
  const session = await auth();
  const professors = session?.user?.id ? await getProfessors(session.user.id) : [];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Professores</h1>
        <span className="text-gray-400 text-sm">{professors.length} professores</span>
      </div>

      {professors.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum professor cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {professors.map((prof) => {
            const initials = prof.user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <div
                key={prof.id}
                className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3"
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{prof.user.name}</p>
                  <p className="text-gray-500 text-xs">{prof.branch.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {prof.modalities.slice(0, 3).map((mod) => (
                      <span key={mod} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                        {MODALITY_LABELS[mod as Modality]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BELT_COLORS[prof.belt as Belt]}`}>
                    {BELT_LABELS[prof.belt as Belt]}
                  </span>
                  {prof.degree > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: prof.degree }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
