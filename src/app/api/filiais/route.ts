import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAccessibleBranchIds, getAcademyId } from "@/lib/access";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const branchIds = await getAccessibleBranchIds(session.user.id!);

  const branches = await prisma.branch.findMany({
    where: { id: { in: branchIds } },
    include: {
      _count: { select: { students: true, professors: true, classes: true } },
    },
  });

  return NextResponse.json(branches);
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

    const academyId = await getAcademyId(session.user.id!);
    if (!academyId) {
      return NextResponse.json({ error: "Academia não encontrada" }, { status: 404 });
    }

    const branch = await prisma.branch.create({
      data: { ...data, academyId },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
