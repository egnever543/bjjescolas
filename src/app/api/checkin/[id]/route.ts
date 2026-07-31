import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAccessibleBranchIds } from "@/lib/access";

// Confirma a presença de um check-in pendente.
// Só gestor/professor com acesso à filial da aula pode confirmar.
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const checkIn = await prisma.checkIn.findUnique({
    where: { id },
    select: { class: { select: { branchId: true } } },
  });
  if (!checkIn) return NextResponse.json({ error: "Check-in não encontrado" }, { status: 404 });

  const branchIds = await getAccessibleBranchIds(session.user.id!);
  if (!branchIds.includes(checkIn.class.branchId)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  const updated = await prisma.checkIn.update({ where: { id }, data: { confirmed: true } });
  return NextResponse.json(updated);
}

// Rejeita um check-in (remove o registro). O aluno pode refazer depois.
// Só gestor/professor com acesso à filial da aula pode rejeitar.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const checkIn = await prisma.checkIn.findUnique({
    where: { id },
    select: { class: { select: { branchId: true } } },
  });
  if (!checkIn) return NextResponse.json({ error: "Check-in não encontrado" }, { status: 404 });

  const branchIds = await getAccessibleBranchIds(session.user.id!);
  if (!branchIds.includes(checkIn.class.branchId)) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
  }

  await prisma.checkIn.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
