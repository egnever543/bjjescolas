import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, MapPin, Phone, Users, Calendar } from "lucide-react";

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

      {branches.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma filial cadastrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {branches.map((branch) => (
            <Card key={branch.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GitBranch className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{branch.name}</p>
                    {(branch.city || branch.state) && (
                      <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {[branch.city, branch.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">{branch._count.students}</p>
                    <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                      <Users className="w-3 h-3" /> Alunos
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">{branch._count.professors}</p>
                    <p className="text-gray-500 text-xs">Profs</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">{branch._count.classes}</p>
                    <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" /> Aulas
                    </p>
                  </div>
                </div>

                {branch.phone && (
                  <p className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                    <Phone className="w-3.5 h-3.5" />
                    {branch.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
