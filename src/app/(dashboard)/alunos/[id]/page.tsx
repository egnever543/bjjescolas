import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BELT_COLORS, BELT_LABELS, MODALITY_LABELS } from "@/types";
import type { Belt, Modality } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Phone, MapPin, Heart } from "lucide-react";
import Link from "next/link";
import { AddGraduationDialog } from "@/components/alunos/add-graduation-dialog";
import { StudentFinanceiroTab } from "@/components/alunos/student-financeiro-tab";
import { EditAlunoButton } from "@/components/alunos/edit-aluno-button";

async function getStudent(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      branch: { include: { academy: { include: { branches: { select: { id: true, name: true } } } } } },
      graduations: { orderBy: { promotedAt: "desc" } },
      checkIns: {
        where: { confirmed: true },
        include: { class: true },
        orderBy: { date: "desc" },
        take: 30,
      },
      payments: { orderBy: { dueDate: "desc" } },
    },
  });
}

export default async function AlunoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) notFound();

  const initials = student.user.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const beltColor = BELT_COLORS[student.belt as Belt];
  const beltLabel = BELT_LABELS[student.belt as Belt];

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 p-4 md:p-6">
        <Link
          href="/alunos"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 flex-shrink-0">
            <AvatarFallback className="bg-gray-700 text-white text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white leading-tight">{student.user.name}</h1>
              <EditAlunoButton
                aluno={{ ...student, birthDate: student.birthDate?.toISOString() ?? null }}
                branches={student.branch.academy.branches}
              />
            </div>
            <p className="text-gray-400 text-sm">{student.branch.academy.name} - {student.branch.name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${beltColor}`}>
                {beltLabel}
              </span>
              {student.degree > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: student.degree }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-yellow-400" />
                  ))}
                </div>
              )}
              <span className="text-gray-400 text-xs">
                {MODALITY_LABELS[student.modality as Modality]}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 mt-4">
        <Tabs defaultValue="dados">
          <TabsList className="bg-gray-900 border border-gray-800 w-full">
            <TabsTrigger value="dados" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              Dados
            </TabsTrigger>
            <TabsTrigger value="graduacoes" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              Graduações
            </TabsTrigger>
            <TabsTrigger value="frequencia" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              Frequência
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              Financeiro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-4 space-y-4">
            {/* Personal Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Email" value={student.user.email} />
                {student.phone && <InfoRow label="Telefone" value={student.phone} icon={<Phone className="w-3.5 h-3.5" />} />}
                {student.birthDate && (
                  <InfoRow
                    label="Data de Nascimento"
                    value={format(student.birthDate, "dd/MM/yyyy", { locale: ptBR })}
                  />
                )}
                {student.bloodType && <InfoRow label="Tipo Sanguíneo" value={student.bloodType} icon={<Heart className="w-3.5 h-3.5 text-red-400" />} />}
                {(student.city || student.state) && (
                  <InfoRow
                    label="Cidade"
                    value={[student.city, student.state].filter(Boolean).join(", ")}
                    icon={<MapPin className="w-3.5 h-3.5" />}
                  />
                )}
                <InfoRow
                  label="Matriculado em"
                  value={format(student.enrolledAt, "dd/MM/yyyy", { locale: ptBR })}
                />
              </CardContent>
            </Card>

            {/* Emergency */}
            {(student.emergencyContact || student.emergencyPhone) && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
                    Contato de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {student.emergencyContact && <InfoRow label="Nome" value={student.emergencyContact} />}
                  {student.emergencyPhone && <InfoRow label="Telefone" value={student.emergencyPhone} icon={<Phone className="w-3.5 h-3.5" />} />}
                </CardContent>
              </Card>
            )}

            {student.healthNotes && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
                    Observações de Saúde
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm">{student.healthNotes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="graduacoes" className="mt-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-4">
                <div className="flex justify-end mb-4">
                  <AddGraduationDialog studentId={student.id} />
                </div>
                {student.graduations.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">
                    Nenhuma graduação registrada
                  </p>
                ) : (
                  <div className="space-y-3">
                    {student.graduations.map((grad) => (
                      <div key={grad.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${BELT_COLORS[grad.belt as Belt]}`}>
                          {BELT_LABELS[grad.belt as Belt]}
                        </span>
                        {grad.degree > 0 && (
                          <div className="flex gap-0.5">
                            {Array.from({ length: grad.degree }).map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-yellow-400" />
                            ))}
                          </div>
                        )}
                        <span className="text-gray-400 text-xs ml-auto">
                          {format(grad.promotedAt, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frequencia" className="mt-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
                  Últimos 30 Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {student.checkIns.length === 0 ? (
                  <p className="text-gray-500 text-center py-6 text-sm">
                    Nenhum check-in registrado
                  </p>
                ) : (
                  <div className="space-y-2">
                    {student.checkIns.map((ci) => (
                      <div key={ci.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                        <div>
                          <p className="text-white text-sm font-medium">{ci.class.name}</p>
                          <p className="text-gray-500 text-xs">{ci.class.startTime}</p>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {format(ci.date, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financeiro" className="mt-4">
            <StudentFinanceiroTab
              studentId={student.id}
              payments={student.payments.map((p) => ({
                ...p,
                dueDate: p.dueDate.toISOString(),
                paidAt: p.paidAt?.toISOString() ?? null,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
              }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-gray-500 text-sm flex-shrink-0">{label}</span>
      <span className="text-gray-200 text-sm text-right flex items-center gap-1">
        {icon}
        {value}
      </span>
    </div>
  );
}
