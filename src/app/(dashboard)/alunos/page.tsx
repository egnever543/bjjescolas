import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddAlunoDialog } from "@/components/alunos/add-aluno-dialog";
import { AlunosList } from "@/components/alunos/alunos-list";

async function getStudents(userId: string, search?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: {
        include: {
          branches: { select: { id: true, name: true } },
        },
      },
    },
  });

  const branchIds = user?.ownedAcademy?.branches.map((b) => b.id) ?? [];

  const students = await prisma.student.findMany({
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
      payments: { orderBy: { dueDate: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return { students, branches: user?.ownedAcademy?.branches ?? [] };
}

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const { students, branches } = session?.user?.id
    ? await getStudents(session.user.id, params.q)
    : { students: [], branches: [] };

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
          <p className="text-gray-500 mb-4">Clique no botão + para adicionar o primeiro aluno.</p>
        </div>
      ) : (
        <AlunosList initialStudents={students} branches={branches} />
      )}

      <AddAlunoDialog branches={branches} />
    </div>
  );
}
