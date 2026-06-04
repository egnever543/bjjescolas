import { prisma } from "@/lib/db";

/**
 * Returns branch IDs accessible by the user based on their role:
 * - ACADEMY_OWNER: all branches of their academy
 * - PROFESSOR: only their own branch
 * - MASTER: all branches across all affiliated academies
 */
export async function getAccessibleBranchIds(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: { include: { branches: { select: { id: true } } } },
      professor: { select: { branchId: true } },
      ownedBrand: { include: { academies: { include: { branches: { select: { id: true } } } } } },
    },
  });

  if (!user) return [];

  if (user.role === "ACADEMY_OWNER" && user.ownedAcademy) {
    return user.ownedAcademy.branches.map((b) => b.id);
  }

  if (user.role === "PROFESSOR" && user.professor) {
    return [user.professor.branchId];
  }

  if (user.role === "MASTER" && user.ownedBrand) {
    return user.ownedBrand.academies.flatMap((a) => a.branches.map((b) => b.id));
  }

  return [];
}

/**
 * Returns the academy ID accessible by the user.
 */
export async function getAcademyId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedAcademy: { select: { id: true } },
      professor: { include: { branch: { select: { academyId: true } } } },
    },
  });

  if (!user) return null;
  if (user.role === "ACADEMY_OWNER") return user.ownedAcademy?.id ?? null;
  if (user.role === "PROFESSOR") return user.professor?.branch.academyId ?? null;
  return null;
}
