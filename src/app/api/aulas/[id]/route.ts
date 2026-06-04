import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  modality: z.string().optional(),
  dayOfWeek: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  maxStudents: z.number().nullable().optional(),
  professorId: z.string().optional(),
  branchId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const cls = await prisma.class.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.modality ? { modality: data.modality as never } : {}),
        ...(data.dayOfWeek ? { dayOfWeek: data.dayOfWeek as never } : {}),
        ...(data.startTime ? { startTime: data.startTime } : {}),
        ...(data.endTime ? { endTime: data.endTime } : {}),
        ...(data.maxStudents !== undefined ? { maxStudents: data.maxStudents } : {}),
        ...(data.professorId ? { professorId: data.professorId } : {}),
        ...(data.branchId ? { branchId: data.branchId } : {}),
      },
      include: { professor: { include: { user: true } }, branch: true },
    });

    return NextResponse.json(cls);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
