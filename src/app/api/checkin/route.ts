import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAccessibleBranchIds } from "@/lib/access";
import { z } from "zod";

const schema = z.object({
  studentId: z.string(),
  classId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { studentId, classId } = schema.parse(body);

    // Valida aula e aluno, e autoriza conforme o papel.
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: { branchId: true },
    });
    if (!cls) return NextResponse.json({ error: "Aula inválida" }, { status: 404 });

    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { branchId: true, userId: true },
    });
    if (!targetStudent) return NextResponse.json({ error: "Aluno inválido" }, { status: 404 });

    // O aluno precisa pertencer à filial da aula.
    if (targetStudent.branchId !== cls.branchId) {
      return NextResponse.json({ error: "Aluno não pertence à filial da aula" }, { status: 403 });
    }

    // Aluno pode marcar a si mesmo; gestor/professor precisa ter acesso à filial da aula.
    // Quando o professor/dono marca, a presença já entra confirmada;
    // quando o aluno marca a si mesmo, entra pendente (aguardando conferência).
    const isSelfCheckin = targetStudent.userId === session.user.id;
    if (!isSelfCheckin) {
      const branchIds = await getAccessibleBranchIds(session.user.id!);
      if (!branchIds.includes(cls.branchId)) {
        return NextResponse.json({ error: "Sem permissão para esta filial" }, { status: 403 });
      }
    }
    const confirmed = !isSelfCheckin;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Check for existing
    const existing = await prisma.checkIn.findFirst({
      where: {
        studentId,
        classId,
        date: { gte: startOfDay, lt: endOfDay },
      },
    });

    if (existing) {
      // Se já existe um pendente e é o professor marcando, confirma na hora.
      if (confirmed && !existing.confirmed) {
        const updated = await prisma.checkIn.update({
          where: { id: existing.id },
          data: { confirmed: true },
        });
        return NextResponse.json(updated);
      }
      return NextResponse.json(existing);
    }

    const checkIn = await prisma.checkIn.create({
      data: { studentId, classId, confirmed },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
