import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ownedAcademy: { include: { branches: { select: { id: true } } } } },
  });

  const branchIds = user?.ownedAcademy?.branches.map((b) => b.id) ?? [];

  const classes = await prisma.class.findMany({
    where: { branchId: { in: branchIds } },
    include: { professor: { include: { user: true } }, branch: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(classes);
}

const createSchema = z.object({
  name: z.string().min(2),
  modality: z.string(),
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  maxStudents: z.number().optional(),
  branchId: z.string(),
  professorId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const cls = await prisma.class.create({
      data: {
        name: data.name,
        modality: data.modality as never,
        dayOfWeek: data.dayOfWeek as never,
        startTime: data.startTime,
        endTime: data.endTime,
        maxStudents: data.maxStudents,
        branchId: data.branchId,
        professorId: data.professorId,
      },
    });

    return NextResponse.json(cls, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
