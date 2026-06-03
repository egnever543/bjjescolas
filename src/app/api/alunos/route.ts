import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

async function getBranchIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: { include: { branches: { select: { id: true } } } },
    },
  });
  return user?.ownedAcademy?.branches.map((b) => b.id) ?? [];
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? undefined;
  const branchIds = await getBranchIds(session.user.id);

  const students = await prisma.student.findMany({
    where: {
      branchId: { in: branchIds },
      ...(search ? { user: { name: { contains: search, mode: "insensitive" } } } : {}),
    },
    include: { user: { select: { name: true, email: true } }, branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(students);
}

const createStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  belt: z.string().optional(),
  degree: z.number().optional(),
  modality: z.string().optional(),
  branchId: z.string(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bloodType: z.string().optional(),
  healthNotes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createStudentSchema.parse(body);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: "STUDENT",
        student: {
          create: {
            branchId: data.branchId,
            phone: data.phone,
            birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
            belt: (data.belt as never) ?? "BRANCA",
            degree: data.degree ?? 0,
            modality: (data.modality as never) ?? "BJJ",
            emergencyContact: data.emergencyContact,
            emergencyPhone: data.emergencyPhone,
            bloodType: data.bloodType,
            healthNotes: data.healthNotes,
            address: data.address,
            city: data.city,
            state: data.state,
          },
        },
      },
      include: { student: true },
    });

    return NextResponse.json(user.student, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
