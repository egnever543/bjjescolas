import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddProfessorDialog } from "@/components/professores/add-professor-dialog";
import { ProfessoresList } from "@/components/professores/professores-list";

async function getProfessors(userId: string) {
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
  const branches = user?.ownedAcademy?.branches ?? [];

  const professors = await prisma.professor.findMany({
    where: { branchId: { in: branchIds } },
    include: {
      user: true,
      branch: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { professors, branches };
}

export default async function ProfessoresPage() {
  const session = await auth();
  const { professors, branches } = session?.user?.id
    ? await getProfessors(session.user.id)
    : { professors: [], branches: [] };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Professores</h1>
        <span className="text-gray-400 text-sm">{professors.length} professores</span>
      </div>

      <ProfessoresList initialProfessors={professors} branches={branches} />

      <AddProfessorDialog branches={branches} />
    </div>
  );
}
