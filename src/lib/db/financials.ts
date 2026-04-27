import { prisma } from "./client";
import type { MachineFinancials, PurchaseOrderSummary } from "@/types";

function computeMachineFinancials(machine: {
  id: string;
  purchasePrice: number | null;
  salePrice: number | null;
  serviceRecords: Array<{
    laborCost: number | null;
    parts: Array<{ unitCostAtTime: number; quantity: number }>;
  }>;
}): MachineFinancials {
  let totalLaborCost = 0;
  let totalPartsCost = 0;

  for (const sr of machine.serviceRecords) {
    totalLaborCost += sr.laborCost ?? 0;
    for (const p of sr.parts) {
      totalPartsCost += p.unitCostAtTime * p.quantity;
    }
  }

  const purchasePrice = machine.purchasePrice ?? 0;
  const totalServiceCost = totalLaborCost + totalPartsCost;
  const totalCost = purchasePrice + totalServiceCost;
  const salePrice = machine.salePrice;
  const profit = salePrice !== null ? salePrice - totalCost : null;

  return {
    machineId: machine.id,
    purchasePrice,
    totalLaborCost,
    totalPartsCost,
    totalServiceCost,
    totalCost,
    salePrice,
    profit,
    serviceCount: machine.serviceRecords.length,
  };
}

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
  return computeMachineFinancials(machine);
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
  return machines.map(computeMachineFinancials);
}

export async function getPurchaseOrderSummary(
  purchaseOrderId: string
): Promise<PurchaseOrderSummary> {
  const machines = await prisma.machine.findMany({
    where: { purchaseOrderId },
    include: {
      serviceRecords: {
        include: { parts: true },
      },
    },
  });

  const machineFinancials = machines.map(computeMachineFinancials);

  const totalInvested = machineFinancials.reduce((s, m) => s + m.purchasePrice, 0);
  const totalServiceCost = machineFinancials.reduce((s, m) => s + m.totalServiceCost, 0);
  const totalCost = totalInvested + totalServiceCost;

  const soldMachines = machineFinancials.filter((m) => m.salePrice !== null);
  const totalRevenue = soldMachines.reduce((s, m) => s + (m.salePrice ?? 0), 0);
  const soldCost = soldMachines.reduce((s, m) => s + m.totalCost, 0);
  const profit = totalRevenue - soldCost;

  return {
    purchaseOrderId,
    machineCount: machines.length,
    soldCount: soldMachines.length,
    totalInvested,
    totalServiceCost,
    totalCost,
    totalRevenue,
    profit,
    machines: machineFinancials,
  };
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
