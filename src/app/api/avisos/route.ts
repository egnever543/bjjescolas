import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createAvisoSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  branchId: z.string().optional(),
});

async function getAcademyId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: { select: { id: true } },
      professor: { include: { branch: { select: { academyId: true } } } },
      student: { include: { branch: { select: { academyId: true } } } },
    },
  });

  if (user?.ownedAcademy) return user.ownedAcademy.id;
  if (user?.professor?.branch) return user.professor.branch.academyId;
  if (user?.student?.branch) return user.student.branch.academyId;
  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const academyId = await getAcademyId(session.user.id);
  if (!academyId) {
    return NextResponse.json([]);
  }

  const announcements = await prisma.announcement.findMany({
    where: { academyId },
    include: {
      createdBy: { select: { name: true } },
      branch: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createAvisoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { title, content, branchId } = parsed.data;

  const academyId = await getAcademyId(session.user.id);
  if (!academyId) {
    return NextResponse.json({ error: "Academia não encontrada" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      academyId,
      branchId: branchId || null,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { name: true } },
      branch: { select: { name: true } },
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
