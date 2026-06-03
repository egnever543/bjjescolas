import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Phone, GitBranch } from "lucide-react";

async function getAcademies(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: {
        include: {
          branches: true,
          brand: true,
        },
      },
    },
  });
  return user?.ownedAcademy;
}

export default async function AcademiasPage() {
  const session = await auth();
  const academy = session?.user?.id ? await getAcademies(session.user.id) : null;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-black text-white mb-6">Minha Academia</h1>

      {!academy ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Nenhuma academia configurada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-600/20 border border-red-600/30 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white">{academy.name}</CardTitle>
                  {academy.brand && (
                    <p className="text-gray-400 text-sm">{academy.brand.name}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {academy.description && (
                <p className="text-gray-400 text-sm">{academy.description}</p>
              )}
              {(academy.city || academy.state) && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {[academy.city, academy.state].filter(Boolean).join(", ")}
                </div>
              )}
              {academy.phone && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  {academy.phone}
                </div>
              )}
              {academy.address && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {academy.address}
                </div>
              )}

              <div className="border-t border-gray-800 pt-3 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-gray-500" />
                <span className="text-gray-400 text-sm">
                  {academy.branches.length} {academy.branches.length === 1 ? "filial" : "filiais"}
                </span>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-gray-300 font-semibold text-sm uppercase tracking-wider mb-3">
              Modalidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {academy.modalities.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma modalidade cadastrada</p>
              ) : (
                academy.modalities.map((mod) => (
                  <span
                    key={mod}
                    className="bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {mod}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
