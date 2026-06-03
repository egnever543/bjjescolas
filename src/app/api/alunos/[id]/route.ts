import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      branch: { include: { academy: true } },
      graduations: { orderBy: { promotedAt: "desc" } },
      checkIns: {
        include: { class: true },
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });

  if (!student) return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });

  return NextResponse.json(student);
}

const updateSchema = z.object({
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  belt: z.string().optional(),
  degree: z.number().optional(),
  modality: z.string().optional(),
  branchId: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bloodType: z.string().optional(),
  healthNotes: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const student = await prisma.student.update({
      where: { id },
      data: {
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        belt: data.belt as never,
        degree: data.degree,
        modality: data.modality as never,
        branchId: data.branchId,
        emergencyContact: data.emergencyContact,
        emergencyPhone: data.emergencyPhone,
        bloodType: data.bloodType,
        healthNotes: data.healthNotes,
        address: data.address,
        city: data.city,
        state: data.state,
      },
    });

    return NextResponse.json(student);
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
