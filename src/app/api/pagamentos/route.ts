import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createPaymentSchema = z.object({
  studentId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  description: z.string().optional(),
});

async function getAcademyBranchIds(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: {
        include: { branches: { select: { id: true } } },
      },
      professor: { select: { branchId: true } },
    },
  });

  if (user?.ownedAcademy) {
    return user.ownedAcademy.branches.map((b) => b.id);
  }
  if (user?.professor) {
    return [user.professor.branchId];
  }
  return [];
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const branchIds = await getAcademyBranchIds(session.user.id);

  const payments = await prisma.payment.findMany({
    where: {
      student: { branchId: { in: branchIds } },
      ...(status ? { status: status as "PENDING" | "PAID" | "OVERDUE" | "CANCELLED" } : {}),
    },
    include: {
      student: { include: { user: true, branch: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { studentId, amount, dueDate, description } = parsed.data;

  const payment = await prisma.payment.create({
    data: {
      studentId,
      amount,
      dueDate: new Date(dueDate),
      description,
      status: "PENDING",
    },
    include: { student: { include: { user: true } } },
  });

  return NextResponse.json(payment, { status: 201 });
}
