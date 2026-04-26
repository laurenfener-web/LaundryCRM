"use server";

import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user;
}

export async function updateRole(userId: string, role: string) {
  const me = await getSessionUser();
  if (userId === me.id) throw new Error("Cannot change your own role");
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/users");
}

export async function toggleActive(userId: string, active: boolean) {
  const me = await getSessionUser();
  if (userId === me.id) throw new Error("Cannot deactivate your own account");
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/users");
}

export async function deleteUser(userId: string) {
  const me = await getSessionUser();
  if (userId === me.id) throw new Error("Cannot delete your own account");

  const counts = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { serviceRecords: true, assignedDeals: true, activities: true } },
    },
  });
  const total = (counts?._count.serviceRecords ?? 0) +
    (counts?._count.assignedDeals ?? 0) +
    (counts?._count.activities ?? 0);

  if (total > 0) {
    // Has associated records — deactivate instead of hard delete
    await prisma.user.update({ where: { id: userId }, data: { active: false } });
  } else {
    await prisma.loginEvent.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
  revalidatePath("/users");
}
