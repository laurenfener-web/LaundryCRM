import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Package, TrendingUp, TrendingDown, Plus, ExternalLink } from "lucide-react";

export default async function PartsFlowPage() {
  const [machines, allPartsSourceMachines] = await Promise.all([
    prisma.machine.findMany({
      where: { isPartsSource: true, deletedAt: null },
      include: {
        building: true,
        harvestedParts: { orderBy: { soldAt: "asc" } },
        serviceRecords: { include: { parts: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.machine.count({ where: { isPartsSource: true, deletedAt: null } }),
  ]);

  // Compute per-machine financials
  const machineData = machines.map((m) => {
    const totalRevenue = m.harvestedParts.reduce(
      (s, p) => s + (p.salePrice !== null ? p.salePrice * p.quantity : 0),
      0
    );
    const soldCount = m.harvestedParts.filter((p) => p.salePrice !== null).length;
    const unsoldCount = m.harvestedParts.filter((p) => p.salePrice === null).length;
    const purchaseCost = m.purchasePrice ?? 0;
    const serviceCost = m.serviceRecords.reduce(
      (s, sr) => s + (sr.laborCost ?? 0) + sr.parts.reduce((sp, p) => sp + p.unitCostAtTime * p.quantity, 0),
      0
    );
    const totalCost = purchaseCost + serviceCost;
    const netProfit = totalRevenue - totalCost;
    const isProfitable = netProfit > 0;
    return { machine: m, totalRevenue, soldCount, unsoldCount, purchaseCost, serviceCost, totalCost, netProfit, isProfitable };
  });

  // Group by building owner for rollup
  const byBuilding = new Map<
    string,
    {
      building: (typeof machines)[0]["building"];
      machines: typeof machineData;
      totalRevenue: number;
      totalCost: number;
      netProfit: number;
    }
  >();

  for (const md of machineData) {
    const bid = md.machine.buildingId;
    if (!byBuilding.has(bid)) {
      byBuilding.set(bid, {
        building: md.machine.building,
        machines: [],
        totalRevenue: 0,
        totalCost: 0,
        netProfit: 0,
      });
    }
    const entry = byBuilding.get(bid)!;
    entry.machines.push(md);
    entry.totalRevenue += md.totalRevenue;
    entry.totalCost += md.totalCost;
    entry.netProfit += md.netProfit;
  }

  const ownerGroups = Array.from(byBuilding.values()).sort((a, b) => b.netProfit - a.netProfit);

  const globalRevenue = machineData.reduce((s, m) => s + m.totalRevenue, 0);
  const globalCost = machineData.reduce((s, m) => s + m.totalCost, 0);
  const globalNet = globalRevenue - globalCost;
  const profitableOwners = ownerGroups.filter((g) => g.netProfit > 0).length;

  const conditionColors: Record<string, string> = {
    Excellent: "bg-blue-100 text-blue-700",
    Good: "bg-green-100 text-green-700",
    Fair: "bg-yellow-100 text-yellow-700",
    Poor: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Machine Parts Flow</h2>
          <p className="text-sm text-gray-500">{allPartsSourceMachines} machines in parts flow</p>
        </div>
        <Link
          href="/machines/new"
          className="flex items-center gap-1.5 text-xs px-3 py-2 font-bold uppercase tracking-wide"
          style={{ background: "#f5c518", color: "#0d1b2a" }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Machine
        </Link>
      </div>

      {/* Global summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Machines in Flow</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{allPartsSourceMachines}</p>
        </div>
        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Parts Revenue</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(globalRevenue)}</p>
        </div>
        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Machine Cost</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(globalCost)}</p>
        </div>
        <div className={`p-4 border-2 ${globalNet >= 0 ? "bg-green-50 border-green-300" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Net P&L</p>
          <p className={`text-2xl font-bold mt-1 ${globalNet >= 0 ? "text-green-700" : "text-red-600"}`}>
            {formatCurrency(globalNet)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{profitableOwners} profitable owner{profitableOwners !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {machines.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 border-2 border-dashed border-gray-200">
          <Package className="h-12 w-12 text-gray-300" />
          <p className="text-gray-500">No machines in the parts flow yet</p>
          <p className="text-sm text-gray-400">Mark a machine as a "Parts Source" from its detail page, or check if a machine from a laundromat is being used for parts.</p>
          <Link href="/machines" className="text-blue-600 text-sm hover:underline">Browse machines →</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {ownerGroups.map((group) => {
            const isProfitable = group.netProfit > 0;
            return (
              <div key={group.building.id} className="border-2 border-gray-200 overflow-hidden">
                {/* Owner header */}
                <div className="flex items-center justify-between px-5 py-4" style={{ background: "#0d1b2a" }}>
                  <div>
                    <div className="flex items-center gap-3">
                      <Link href={`/buildings/${group.building.id}`} className="text-white font-bold hover:underline">
                        {group.building.name}
                      </Link>
                      <span
                        className={`text-xs px-2 py-0.5 font-black uppercase tracking-widest ${
                          isProfitable ? "text-[#0d1b2a] bg-[#f5c518]" : "text-gray-400 bg-white/10"
                        }`}
                      >
                        {isProfitable ? "✓ Profitable Owner" : "Not Yet Profitable"}
                      </span>
                    </div>
                    {group.building.ownerName && (
                      <p className="text-sm text-gray-400 mt-1">
                        {group.building.ownerName}
                        {group.building.ownerPhone && ` · ${group.building.ownerPhone}`}
                        {group.building.ownerEmail && ` · ${group.building.ownerEmail}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {group.building.address}, {group.building.city}, {group.building.state}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Owner Net</p>
                    <p className={`text-2xl font-bold ${isProfitable ? "text-[#f5c518]" : "text-red-400"}`}>
                      {formatCurrency(group.netProfit)}
                    </p>
                    {isProfitable && (
                      <Link
                        href={`/deals/new?buildingId=${group.building.id}`}
                        className="inline-flex items-center gap-1 mt-2 text-xs font-bold uppercase tracking-wide px-2 py-1 text-[#0d1b2a]"
                        style={{ background: "#f5c518" }}
                      >
                        <ExternalLink className="h-3 w-3" /> Maintain CRM
                      </Link>
                    )}
                  </div>
                </div>

                {/* Owner revenue rollup bar */}
                <div className="px-5 py-2 bg-gray-800 flex items-center gap-6 text-xs text-gray-400">
                  <span>Revenue: <strong className="text-green-400">{formatCurrency(group.totalRevenue)}</strong></span>
                  <span>Cost: <strong className="text-red-400">{formatCurrency(group.totalCost)}</strong></span>
                  <span>{group.machines.length} machine{group.machines.length !== 1 ? "s" : ""} in flow</span>
                  {isProfitable
                    ? <span className="ml-auto flex items-center gap-1 text-green-400"><TrendingUp className="h-3.5 w-3.5" /> Profitable — maintain CRM relationship</span>
                    : <span className="ml-auto flex items-center gap-1 text-gray-500"><TrendingDown className="h-3.5 w-3.5" /> Parts still in progress</span>
                  }
                </div>

                {/* Machines */}
                <div className="divide-y divide-gray-100">
                  {group.machines.map(({ machine: m, totalRevenue, soldCount, unsoldCount, purchaseCost, serviceCost, totalCost, netProfit, isProfitable: machineProfit }) => (
                    <div key={m.id} className="p-5">
                      {/* Machine header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link href={`/machines/${m.id}`} className="font-bold text-gray-900 hover:underline">
                              {m.make} {m.model}
                            </Link>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 font-semibold">{m.type}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 font-semibold uppercase">Parts Source</span>
                          </div>
                          {m.locationDetail && <p className="text-xs text-gray-400 mt-0.5">{m.locationDetail}</p>}
                          {m.notes && <p className="text-xs text-gray-500 mt-1 italic">{m.notes}</p>}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className={`text-lg font-bold ${machineProfit ? "text-green-700" : "text-red-500"}`}>
                            {formatCurrency(netProfit)}
                          </p>
                          <p className="text-xs text-gray-400">net profit</p>
                          <Link href={`/machines/${m.id}/parts`} className="text-xs text-blue-600 hover:underline mt-1 block">
                            Manage parts →
                          </Link>
                        </div>
                      </div>

                      {/* Machine cost breakdown */}
                      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                        <div className="bg-gray-50 border border-gray-200 p-2 text-center">
                          <p className="text-gray-400 uppercase tracking-wide">Purchase</p>
                          <p className="font-bold text-gray-700 mt-0.5">{formatCurrency(purchaseCost)}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-2 text-center">
                          <p className="text-gray-400 uppercase tracking-wide">Service</p>
                          <p className="font-bold text-gray-700 mt-0.5">{formatCurrency(serviceCost)}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 p-2 text-center">
                          <p className="text-gray-400 uppercase tracking-wide">Parts Sold</p>
                          <p className="font-bold text-green-700 mt-0.5">{formatCurrency(totalRevenue)}</p>
                        </div>
                      </div>

                      {/* Parts list */}
                      {m.harvestedParts.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-gray-200">
                          <p className="text-xs text-gray-400">No parts recorded yet</p>
                          <Link href={`/machines/${m.id}/parts/new`} className="text-xs text-blue-600 hover:underline mt-1 block">+ Add part</Link>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                              Parts ({soldCount} sold · {unsoldCount} unsold)
                            </p>
                            <Link href={`/machines/${m.id}/parts/new`} className="text-xs text-blue-600 hover:underline">+ Add part</Link>
                          </div>
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wide">
                                <th className="text-left py-1.5">Part</th>
                                <th className="text-left py-1.5 hidden sm:table-cell">Category</th>
                                <th className="text-left py-1.5 hidden md:table-cell">Condition</th>
                                <th className="text-right py-1.5">Sale Price</th>
                                <th className="text-left py-1.5 hidden lg:table-cell">Sold</th>
                              </tr>
                            </thead>
                            <tbody>
                              {m.harvestedParts.map((p) => (
                                <tr key={p.id} className="border-b border-gray-50 last:border-0">
                                  <td className="py-1.5 font-medium text-gray-800">{p.name}</td>
                                  <td className="py-1.5 text-gray-500 hidden sm:table-cell">{p.category ?? "—"}</td>
                                  <td className="py-1.5 hidden md:table-cell">
                                    {p.condition ? (
                                      <span className={`px-1.5 py-0.5 text-xs font-semibold ${conditionColors[p.condition] ?? "bg-gray-100 text-gray-600"}`}>
                                        {p.condition}
                                      </span>
                                    ) : "—"}
                                  </td>
                                  <td className="py-1.5 text-right font-semibold">
                                    {p.salePrice !== null
                                      ? <span className="text-green-700">{formatCurrency(p.salePrice * p.quantity)}</span>
                                      : <span className="text-gray-300 font-normal italic">{p.description ?? "Not sold"}</span>}
                                  </td>
                                  <td className="py-1.5 text-gray-400 hidden lg:table-cell">
                                    {p.soldAt ? formatDate(p.soldAt) : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
