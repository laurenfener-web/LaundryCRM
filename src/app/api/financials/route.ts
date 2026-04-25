import { NextResponse } from "next/server";
import { getAllMachinesFinancials, getMonthlyServiceSpend } from "@/lib/db/financials";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const [machineFinancials, monthlySpend, topParts] = await Promise.all([
    getAllMachinesFinancials(),
    getMonthlyServiceSpend(12),
    prisma.serviceRecordPart.groupBy({
      by: ["partId"],
      _sum: { unitCostAtTime: true },
      _count: true,
      orderBy: { _sum: { unitCostAtTime: "desc" } },
      take: 10,
    }),
  ]);

  const partIds = topParts.map((p) => p.partId);
  const parts = await prisma.part.findMany({ where: { id: { in: partIds } } });
  const partMap = Object.fromEntries(parts.map((p) => [p.id, p.name]));

  return NextResponse.json({
    machineFinancials,
    monthlySpend,
    topParts: topParts.map((p) => ({
      partId: p.partId,
      name: partMap[p.partId] ?? "Unknown",
      totalCost: p._sum.unitCostAtTime ?? 0,
      useCount: p._count,
    })),
  });
}
