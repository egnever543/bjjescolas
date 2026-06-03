import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedAcademy: {
        include: {
          branches: {
            include: {
              _count: { select: { students: true, professors: true, classes: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json(user?.ownedAcademy?.branches ?? []);
}

const createSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedAcademy: { select: { id: true } } },
    });

    if (!user?.ownedAcademy) {
      return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 });
    }

    const branch = await prisma.branch.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone,
        academyId: user.ownedAcademy.id,
      },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
