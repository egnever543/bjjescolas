import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  studentId: z.string(),
  belt: z.string(),
  degree: z.number(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const [graduation] = await prisma.$transaction([
      prisma.graduation.create({
        data: {
          studentId: data.studentId,
          belt: data.belt as never,
          degree: data.degree,
          notes: data.notes,
        },
      }),
      prisma.student.update({
        where: { id: data.studentId },
        data: {
          belt: data.belt as never,
          degree: data.degree,
        },
      }),
    ]);

    return NextResponse.json(graduation, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
