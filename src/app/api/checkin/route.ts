import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
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
      return NextResponse.json(existing);
    }

    const checkIn = await prisma.checkIn.create({
      data: { studentId, classId },
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
