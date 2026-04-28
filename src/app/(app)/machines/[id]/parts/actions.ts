"use server";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function togglePartsSource(machineId: string, isPartsSource: boolean) {
  await prisma.machine.update({ where: { id: machineId }, data: { isPartsSource } });
  revalidatePath(`/machines/${machineId}`);
  revalidatePath(`/machines/${machineId}/parts`);
  revalidatePath("/parts-flow");
}

export async function createMachinePart(machineId: string, formData: FormData) {
  const salePrice = formData.get("salePrice") as string;
  const soldAt = formData.get("soldAt") as string;

  await prisma.machinePart.create({
    data: {
      machineId,
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || null,
      condition: (formData.get("condition") as string) || null,
      quantity: parseInt(formData.get("quantity") as string, 10) || 1,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      soldAt: soldAt ? new Date(soldAt) : null,
    },
  });
  revalidatePath(`/machines/${machineId}/parts`);
  revalidatePath("/parts-flow");
  redirect(`/machines/${machineId}/parts`);
}

export async function updateMachinePart(partId: string, machineId: string, formData: FormData) {
  const salePrice = formData.get("salePrice") as string;
  const soldAt = formData.get("soldAt") as string;

  await prisma.machinePart.update({
    where: { id: partId },
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      category: (formData.get("category") as string) || null,
      condition: (formData.get("condition") as string) || null,
      quantity: parseInt(formData.get("quantity") as string, 10) || 1,
      salePrice: salePrice ? parseFloat(salePrice) : null,
      soldAt: soldAt ? new Date(soldAt) : null,
    },
  });
  revalidatePath(`/machines/${machineId}/parts`);
  revalidatePath("/parts-flow");
  redirect(`/machines/${machineId}/parts`);
}

export async function deleteMachinePart(partId: string, machineId: string) {
  await prisma.machinePart.delete({ where: { id: partId } });
  revalidatePath(`/machines/${machineId}/parts`);
  revalidatePath("/parts-flow");
}
