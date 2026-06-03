import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BELT_COLORS, BELT_LABELS, MODALITY_LABELS } from "@/types";
import type { Belt, Modality } from "@/types";
import { Input } from "@/components/ui/input";

async function getStudents(userId: string, search?: string) {
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

  return prisma.student.findMany({
    where: {
      branchId: { in: branchIds },
      ...(search
        ? {
            user: {
              name: { contains: search, mode: "insensitive" },
            },
          }
        : {}),
    },
    include: {
      user: true,
      branch: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const students = session?.user?.id ? await getStudents(session.user.id, params.q) : [];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Alunos</h1>
        <span className="text-gray-400 text-sm">{students.length} alunos</span>
      </div>

      {/* Search */}
      <form className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar aluno..."
          className="pl-9 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
        />
      </form>

      {students.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Nenhum aluno cadastrado</p>
          <Link
            href="/alunos/novo"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar primeiro aluno
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => {
            const initials = student.user.name
              .split(" ")
              .slice(0, 2)
              .map((n) => n[0])
              .join("")
              .toUpperCase();

            return (
              <Link
                key={student.id}
                href={`/alunos/${student.id}`}
                className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-3 transition-colors"
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{student.user.name}</p>
                  <p className="text-gray-500 text-xs">{student.branch.name}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${BELT_COLORS[student.belt as Belt]}`}
                  >
                    {BELT_LABELS[student.belt as Belt]}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {MODALITY_LABELS[student.modality as Modality]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <Link
        href="/alunos/novo"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-40"
        aria-label="Adicionar aluno"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
