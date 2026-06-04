import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddAulaDialog } from "@/components/aulas/add-aula-dialog";
import { AulasList } from "@/components/aulas/aulas-list";

async function getClasses(userId: string) {
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

  const classes = await prisma.class.findMany({
    where: { branchId: { in: branchIds } },
    include: {
      professor: { include: { user: true } },
      branch: true,
    },
    orderBy: { startTime: "asc" },
  });

  const professors = await prisma.professor.findMany({
    where: { branchId: { in: branchIds } },
    include: { user: true },
  });

  return { classes, branches, professors };
}

export default async function AulasPage() {
  const session = await auth();
  const { classes, branches, professors } = session?.user?.id
    ? await getClasses(session.user.id)
    : { classes: [], branches: [], professors: [] };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Grade de Aulas</h1>
        <span className="text-gray-400 text-sm">{classes.length} aulas</span>
      </div>

      <AulasList initialClasses={classes} branches={branches} professors={professors} />

      <AddAulaDialog branches={branches} professors={professors} />
    </div>
  );
}
