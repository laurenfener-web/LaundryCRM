import { prisma } from "@/lib/db/client";
import { getAllMachinesFinancials, getMonthlyServiceSpend } from "@/lib/db/financials";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { DollarSign, TrendingDown } from "lucide-react";

export default async function FinancialsPage() {
  const [machineFinancials, monthlySpend, machines, topParts] = await Promise.all([
    getAllMachinesFinancials(),
    getMonthlyServiceSpend(12),
    prisma.machine.findMany({ where: { deletedAt: null }, include: { building: true } }),
    prisma.serviceRecordPart.groupBy({
      by: ["partId"],
      _sum: { unitCostAtTime: true },
      _count: true,
      orderBy: { _sum: { unitCostAtTime: "desc" } },
      take: 10,
    }),
  ]);

  const machineMap = Object.fromEntries(machines.map((m) => [m.id, m]));
  const partIds = topParts.map((p) => p.partId);
  const parts = await prisma.part.findMany({ where: { id: { in: partIds } } });
  const partMap = Object.fromEntries(parts.map((p) => [p.id, p.name]));

  const totalSpend = machineFinancials.reduce((s, m) => s + m.totalCost, 0);
  const totalLaborSpend = machineFinancials.reduce((s, m) => s + m.totalLaborCost, 0);
  const totalPartsSpend = machineFinancials.reduce((s, m) => s + m.totalPartsCost, 0);
  const totalPurchase = machineFinancials.reduce((s, m) => s + m.purchasePrice, 0);

  const sorted = [...machineFinancials].sort((a, b) => b.totalCost - a.totalCost);
  const maxCost = sorted[0]?.totalCost ?? 1;

  return (
    <div className="space-y-6 max-w-5xl">
      <h2 className="text-lg font-semibold text-gray-900">Financials Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Spend (All Time)</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalSpend)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Machine Purchases</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPurchase)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Labor</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalLaborSpend)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Parts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalPartsSpend)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Top 10 Most Expensive Machines</CardTitle>
          </CardHeader>
          <CardContent>
            {sorted.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No data</p>
            ) : (
              <div className="space-y-3">
                {sorted.slice(0, 10).map((mf) => {
                  const machine = machineMap[mf.machineId];
                  if (!machine) return null;
                  return (
                    <Link key={mf.machineId} href={`/machines/${mf.machineId}`}>
                      <div className="flex items-center gap-3 hover:bg-gray-50 rounded p-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {machine.make} {machine.model}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{machine.building.name}</p>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-red-400 h-1.5 rounded-full"
                              style={{ width: `${(mf.totalCost / maxCost) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">{formatCurrency(mf.totalCost)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Service Spend (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlySpend.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No data</p>
            ) : (
              <div className="space-y-2">
                {monthlySpend.map(({ month, total }) => {
                  const maxMonthly = Math.max(...monthlySpend.map((m) => m.total), 1);
                  return (
                    <div key={month} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16 shrink-0">{month}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(total / maxMonthly) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-20 text-right shrink-0">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Top Parts by Spend</CardTitle>
        </CardHeader>
        <CardContent>
          {topParts.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No parts data</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Part</th>
                  <th className="text-right py-2 font-medium text-gray-600">Times Used</th>
                  <th className="text-right py-2 font-medium text-gray-600">Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {topParts.map((p) => (
                  <tr key={p.partId} className="border-b border-gray-100 last:border-0">
                    <td className="py-2">
                      <Link href={`/parts/${p.partId}`} className="text-blue-600 hover:underline">
                        {partMap[p.partId] ?? "Unknown"}
                      </Link>
                    </td>
                    <td className="py-2 text-right text-gray-600">{p._count}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(p._sum.unitCostAtTime ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
