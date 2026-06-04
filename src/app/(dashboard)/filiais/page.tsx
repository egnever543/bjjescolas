import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddFilialDialog } from "@/components/filiais/add-filial-dialog";
import { FiliaisList } from "@/components/filiais/filiais-list";

async function getBranches(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: {
        include: {
          branches: {
            include: {
              _count: {
                select: { students: true, professors: true, classes: true },
              },
            },
          },
        },
      },
    },
  });
  return user?.ownedAcademy?.branches ?? [];
}

export default async function FiliaisPage() {
  const session = await auth();
  const branches = session?.user?.id ? await getBranches(session.user.id) : [];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">Filiais</h1>
        <span className="text-gray-400 text-sm">{branches.length} unidades</span>
      </div>

      <FiliaisList initialBranches={branches} />

      <AddFilialDialog />
    </div>
  );
}
