import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { ownedAcademy: { include: { branches: { select: { id: true } } } } },
  });

  const branchIds = user?.ownedAcademy?.branches.map((b) => b.id) ?? [];

  const professors = await prisma.professor.findMany({
    where: { branchId: { in: branchIds } },
    include: { user: true, branch: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(professors);
}

const createSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  branchId: z.string(),
  belt: z.string().optional(),
  degree: z.number().optional(),
  modalities: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "PROFESSOR",
        professor: {
          create: {
            branchId: data.branchId,
            belt: (data.belt as never) ?? "PRETA",
            degree: data.degree ?? 0,
            modalities: (data.modalities as never[]) ?? [],
            bio: data.bio,
          },
        },
      },
      include: { professor: true },
    });

    return NextResponse.json(user.professor, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
