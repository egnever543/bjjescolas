import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updatePaymentSchema = z.object({
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  paidAt: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = updatePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { status, paidAt } = parsed.data;

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(paidAt ? { paidAt: new Date(paidAt) } : {}),
    },
  });

  return NextResponse.json(payment);
}
