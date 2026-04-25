import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getMonthlyServiceSpend } from "@/lib/db/financials";

export async function GET() {
  const [
    totalBuildings,
    totalMachines,
    activeMachines,
    openDeals,
    recentService,
    monthlySpend,
    dealsByStage,
  ] = await Promise.all([
    prisma.building.count({ where: { deletedAt: null } }),
    prisma.machine.count({ where: { deletedAt: null } }),
    prisma.machine.count({ where: { deletedAt: null, status: "ACTIVE" } }),
    prisma.deal.count({ where: { deletedAt: null, stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } } }),
    prisma.serviceRecord.findMany({
      take: 5,
      orderBy: { serviceDate: "desc" },
      include: { machine: { include: { building: true } } },
    }),
    getMonthlyServiceSpend(6),
    prisma.deal.groupBy({
      by: ["stage"],
      where: { deletedAt: null },
      _count: true,
      _sum: { value: true },
    }),
  ]);

  return NextResponse.json({
    totalBuildings,
    totalMachines,
    activeMachines,
    openDeals,
    recentService,
    monthlySpend,
    dealsByStage,
  });
}
