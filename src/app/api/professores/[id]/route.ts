import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  belt: z.string().optional(),
  degree: z.number().optional(),
  bio: z.string().optional(),
  branchId: z.string().optional(),
  modalities: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const professor = await prisma.professor.findUnique({ where: { id }, include: { user: true } });
    if (!professor) return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });

    if (data.name || data.email) {
      await prisma.user.update({
        where: { id: professor.userId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.email ? { email: data.email } : {}),
        },
      });
    }

    const updated = await prisma.professor.update({
      where: { id },
      data: {
        ...(data.belt ? { belt: data.belt as never } : {}),
        ...(data.degree !== undefined ? { degree: data.degree } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.branchId ? { branchId: data.branchId } : {}),
        ...(data.modalities ? { modalities: data.modalities as never[] } : {}),
      },
      include: { user: true, branch: true },
    });

    return NextResponse.json(updated);
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
    const professor = await prisma.professor.findUnique({ where: { id } });
    if (!professor) return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 });

    await prisma.professor.delete({ where: { id } });
    await prisma.user.delete({ where: { id: professor.userId } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
