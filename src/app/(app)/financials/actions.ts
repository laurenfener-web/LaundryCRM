"use server";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function toggleInvoicePaid(id: string, markPaid: boolean) {
  await prisma.serviceRecord.update({
    where: { id },
    data: {
      invoiceStatus: markPaid ? "PAID" : "UNPAID",
      invoicePaidAt: markPaid ? new Date() : null,
    },
  });
  revalidatePath("/financials");
}
