import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

async function getAvisos(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { branch: { select: { id: true, academyId: true } } },
  });

  if (!student) return [];

  return prisma.announcement.findMany({
    where: {
      academyId: student.branch.academyId,
      OR: [
        { branchId: null },
        { branchId: student.branch.id },
      ],
    },
    include: {
      createdBy: { select: { name: true } },
      branch: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MinhaAreaAvisosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const avisos = await getAvisos(session.user.id);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-red-400" />
        <h1 className="text-2xl font-black text-white">Avisos</h1>
      </div>

      {avisos.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum aviso no momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avisos.map((a) => (
            <Card key={a.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-bold text-sm">{a.title}</h3>
                  {a.branch && (
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                      {a.branch.name}
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                  <span className="text-gray-500 text-xs">{a.createdBy.name}</span>
                  <span className="text-gray-500 text-xs">
                    {format(new Date(a.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
