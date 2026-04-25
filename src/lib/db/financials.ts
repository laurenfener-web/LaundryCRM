import { prisma } from "./client";
import type { MachineFinancials } from "@/types";

export async function getMachineFinancials(
  machineId: string
): Promise<MachineFinancials> {
  const machine = await prisma.machine.findUniqueOrThrow({
    where: { id: machineId },
    include: {
      serviceRecords: {
        include: { parts: true },
      },
    },
  });

  let totalLaborCost = 0;
  let totalPartsCost = 0;

  for (const sr of machine.serviceRecords) {
    totalLaborCost += sr.laborCost ?? 0;
    for (const p of sr.parts) {
      totalPartsCost += p.unitCostAtTime * p.quantity;
    }
  }

  const purchasePrice = machine.purchasePrice ?? 0;

  return {
    machineId,
    purchasePrice,
    totalLaborCost,
    totalPartsCost,
    totalCost: purchasePrice + totalLaborCost + totalPartsCost,
    serviceCount: machine.serviceRecords.length,
  };
}

export async function getAllMachinesFinancials(): Promise<MachineFinancials[]> {
  const machines = await prisma.machine.findMany({
    where: { deletedAt: null },
    include: {
      serviceRecords: {
        include: { parts: true },
      },
    },
  });

  return machines.map((machine) => {
    let totalLaborCost = 0;
    let totalPartsCost = 0;

    for (const sr of machine.serviceRecords) {
      totalLaborCost += sr.laborCost ?? 0;
      for (const p of sr.parts) {
        totalPartsCost += p.unitCostAtTime * p.quantity;
      }
    }

    const purchasePrice = machine.purchasePrice ?? 0;

    return {
      machineId: machine.id,
      purchasePrice,
      totalLaborCost,
      totalPartsCost,
      totalCost: purchasePrice + totalLaborCost + totalPartsCost,
      serviceCount: machine.serviceRecords.length,
    };
  });
}

export async function getMonthlyServiceSpend(months = 12) {
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const records = await prisma.serviceRecord.findMany({
    where: { serviceDate: { gte: since } },
    include: { parts: true },
    orderBy: { serviceDate: "asc" },
  });

  const byMonth: Record<string, number> = {};
  for (const sr of records) {
    const key = sr.serviceDate.toISOString().slice(0, 7);
    const labor = sr.laborCost ?? 0;
    const parts = sr.parts.reduce(
      (sum, p) => sum + p.unitCostAtTime * p.quantity,
      0
    );
    byMonth[key] = (byMonth[key] ?? 0) + labor + parts;
  }

  return Object.entries(byMonth).map(([month, total]) => ({ month, total }));
}
