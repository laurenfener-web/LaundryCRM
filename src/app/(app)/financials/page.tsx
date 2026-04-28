import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getAllMachinesFinancials, getMonthlyServiceSpend } from "@/lib/db/financials";
import { InvoiceRow } from "@/components/financials/InvoiceRow";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";

const TABS = [
  { id: "pnl", label: "P&L Sheet" },
  { id: "invoices", label: "Invoices" },
  { id: "revenue", label: "Revenue by Deal" },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default async function FinancialsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sort?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const tab = (sp.tab ?? "pnl") as Tab;
  const sort = sp.sort ?? "profit_desc";
  const statusFilter = sp.status ?? "all";

  return (
    <div className="space-y-6 max-w-6xl">
      <h2 className="text-lg font-semibold text-gray-900">Financials</h2>

      {/* Tab nav */}
      <div className="flex gap-0 border-b-2 border-gray-200">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <Link
              key={t.id}
              href={`/financials?tab=${t.id}`}
              className="px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors"
              style={
                active
                  ? { borderBottom: "3px solid #f5c518", color: "#0d1b2a", marginBottom: "-2px" }
                  : { color: "#6b7280" }
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {tab === "pnl" && <PnLTab sort={sort} />}
      {tab === "invoices" && <InvoicesTab statusFilter={statusFilter} sort={sort} />}
      {tab === "revenue" && <RevenueTab sort={sort} />}
    </div>
  );
}

// ─── P&L Tab ───────────────────────────────────────────────────────────────

async function PnLTab({ sort }: { sort: string }) {
  const [machineFinancials, monthlySpend, machines, wonDeals] = await Promise.all([
    getAllMachinesFinancials(),
    getMonthlyServiceSpend(12),
    prisma.machine.findMany({
      where: { deletedAt: null },
      include: { serviceRecords: { include: { parts: true } } },
    }),
    prisma.deal.findMany({
      where: { stage: "CLOSED_WON", deletedAt: null },
      include: { lineItems: true },
    }),
  ]);

  // Revenue from closed deals
  const totalRevenue = wonDeals.reduce((sum, d) => {
    const lineTotal = d.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
    return sum + (lineTotal > 0 ? lineTotal : (d.value ?? 0));
  }, 0);

  const totalPurchaseCost = machineFinancials.reduce((s, m) => s + m.purchasePrice, 0);
  const totalLaborCost = machineFinancials.reduce((s, m) => s + m.totalLaborCost, 0);
  const totalPartsCost = machineFinancials.reduce((s, m) => s + m.totalPartsCost, 0);
  const totalCosts = totalPurchaseCost + totalLaborCost + totalPartsCost;
  const netPnL = totalRevenue - totalCosts;

  // Machine type breakdown
  const revenueByType: Record<string, number> = {};
  for (const d of wonDeals) {
    for (const li of d.lineItems) {
      if (li.machineType) {
        revenueByType[li.machineType] = (revenueByType[li.machineType] ?? 0) + li.quantity * li.unitPrice;
      }
    }
  }

  const costsByType: Record<string, { purchase: number; service: number }> = {};
  for (const m of machines) {
    const t = m.type;
    if (!costsByType[t]) costsByType[t] = { purchase: 0, service: 0 };
    costsByType[t].purchase += m.purchasePrice ?? 0;
    for (const sr of m.serviceRecords) {
      costsByType[t].service += sr.laborCost ?? 0;
      for (const p of sr.parts) {
        costsByType[t].service += p.unitCostAtTime * p.quantity;
      }
    }
  }

  const allTypes = Array.from(new Set([...Object.keys(revenueByType), ...Object.keys(costsByType)]));
  let machineTypeRows = allTypes.map((type) => ({
    type,
    revenue: revenueByType[type] ?? 0,
    purchaseCost: costsByType[type]?.purchase ?? 0,
    serviceCost: costsByType[type]?.service ?? 0,
    totalCost: (costsByType[type]?.purchase ?? 0) + (costsByType[type]?.service ?? 0),
    profit: (revenueByType[type] ?? 0) - ((costsByType[type]?.purchase ?? 0) + (costsByType[type]?.service ?? 0)),
  }));

  if (sort === "profit_asc") machineTypeRows.sort((a, b) => a.profit - b.profit);
  else if (sort === "revenue_desc") machineTypeRows.sort((a, b) => b.revenue - a.revenue);
  else if (sort === "cost_desc") machineTypeRows.sort((a, b) => b.totalCost - a.totalCost);
  else machineTypeRows.sort((a, b) => b.profit - a.profit); // profit_desc default

  const maxMonthly = Math.max(...monthlySpend.map((m) => m.total), 1);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-2 md:col-span-1 p-5 flex items-center justify-between" style={{ background: "#0d1b2a" }}>
          <div>
            <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Net P&L</p>
            <p className="text-3xl font-bold mt-1" style={{ color: netPnL >= 0 ? "#f5c518" : "#f87171" }}>
              {formatCurrency(netPnL)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Revenue minus all costs</p>
          </div>
          {netPnL >= 0
            ? <TrendingUp className="h-10 w-10 text-white opacity-20" />
            : <TrendingDown className="h-10 w-10 text-white opacity-20" />}
        </div>

        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Revenue</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{wonDeals.length} closed deals</p>
        </div>

        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Costs</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalCosts)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Purchases + labor + parts</p>
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Machine Purchases", value: totalPurchaseCost },
          { label: "Labor Costs", value: totalLaborCost },
          { label: "Parts Costs", value: totalPartsCost },
        ].map(({ label, value }) => (
          <div key={label} className="p-4 bg-white border border-gray-200">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(value)}</p>
          </div>
        ))}
      </div>

      {/* Machine type profit breakdown */}
      <div className="bg-white border-2 border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200" style={{ background: "#1a3a6e" }}>
          <p className="text-sm font-bold text-white uppercase tracking-wide">Profit by Machine Type</p>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs text-gray-400">Sort by:</span>
            {[
              { value: "profit_desc", label: "Profit ↓" },
              { value: "profit_asc", label: "Profit ↑" },
              { value: "revenue_desc", label: "Revenue" },
              { value: "cost_desc", label: "Cost" },
            ].map(({ value, label }) => (
              <Link
                key={value}
                href={`/financials?tab=pnl&sort=${value}`}
                className={`text-xs px-2 py-1 font-semibold uppercase tracking-wide ${
                  sort === value ? "text-[#0d1b2a]" : "text-gray-400 hover:text-gray-200"
                }`}
                style={sort === value ? { background: "#f5c518" } : {}}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Type</th>
              <th className="text-right px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Revenue</th>
              <th className="text-right px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Purchases</th>
              <th className="text-right px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide hidden md:table-cell">Service</th>
              <th className="text-right px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Total Cost</th>
              <th className="text-right px-5 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Profit</th>
            </tr>
          </thead>
          <tbody>
            {machineTypeRows.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-gray-400">No data</td></tr>
            ) : machineTypeRows.map((row) => (
              <tr key={row.type} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-semibold text-gray-900">{row.type}</td>
                <td className="px-5 py-3 text-right text-green-700 font-semibold">{formatCurrency(row.revenue)}</td>
                <td className="px-5 py-3 text-right text-gray-500 hidden md:table-cell">{formatCurrency(row.purchaseCost)}</td>
                <td className="px-5 py-3 text-right text-gray-500 hidden md:table-cell">{formatCurrency(row.serviceCost)}</td>
                <td className="px-5 py-3 text-right text-red-500">{formatCurrency(row.totalCost)}</td>
                <td className="px-5 py-3 text-right font-bold" style={{ color: row.profit >= 0 ? "#15803d" : "#dc2626" }}>
                  {formatCurrency(row.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Monthly spend chart */}
      {monthlySpend.length > 0 && (
        <div className="bg-white border-2 border-gray-200 p-5">
          <p className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">Monthly Service Spend (12 months)</p>
          <div className="space-y-2">
            {monthlySpend.map(({ month, total }) => (
              <div key={month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 shrink-0">{month}</span>
                <div className="flex-1 bg-gray-100 h-2">
                  <div className="h-2" style={{ width: `${(total / maxMonthly) * 100}%`, background: "#1a3a6e" }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-20 text-right shrink-0">{formatCurrency(total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Invoices Tab ──────────────────────────────────────────────────────────

async function InvoicesTab({ statusFilter, sort }: { statusFilter: string; sort: string }) {
  const records = await prisma.serviceRecord.findMany({
    where: {
      ...(statusFilter !== "all" && { invoiceStatus: statusFilter.toUpperCase() }),
    },
    include: {
      machine: { include: { building: true } },
      parts: true,
    },
    orderBy: sort === "amount_desc"
      ? undefined
      : sort === "oldest"
      ? { serviceDate: "asc" }
      : { serviceDate: "desc" },
  });

  // client-side sort for amount (can't do in Prisma easily without raw query)
  const sorted = sort === "amount_desc"
    ? [...records].sort((a, b) => {
        const totalA = (a.laborCost ?? 0) + a.parts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);
        const totalB = (b.laborCost ?? 0) + b.parts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);
        return totalB - totalA;
      })
    : records;

  const unpaidCount = records.filter((r) => r.invoiceStatus === "UNPAID").length;
  const paidCount = records.filter((r) => r.invoiceStatus === "PAID").length;
  const totalUnpaid = records
    .filter((r) => r.invoiceStatus === "UNPAID")
    .reduce((s, r) => s + (r.laborCost ?? 0) + r.parts.reduce((p, part) => p + part.unitCostAtTime * part.quantity, 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{records.length}</p>
        </div>
        <div className="p-4 bg-white border-2 border-yellow-300">
          <p className="text-xs text-gray-500">Unpaid</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{unpaidCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(totalUnpaid)} outstanding</p>
        </div>
        <div className="p-4 bg-white border-2 border-green-300">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{paidCount}</p>
        </div>
      </div>

      {/* Filters + sort */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {[
            { value: "all", label: "All" },
            { value: "unpaid", label: "Unpaid" },
            { value: "paid", label: "Paid" },
          ].map(({ value, label }) => (
            <Link
              key={value}
              href={`/financials?tab=invoices&status=${value}&sort=${sort}`}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                statusFilter === value
                  ? "text-[#0d1b2a]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={statusFilter === value ? { background: "#f5c518" } : {}}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 mr-1">Sort:</span>
          {[
            { value: "date_desc", label: "Newest" },
            { value: "oldest", label: "Oldest" },
            { value: "amount_desc", label: "Amount" },
          ].map(({ value, label }) => (
            <Link
              key={value}
              href={`/financials?tab=invoices&status=${statusFilter}&sort=${value}`}
              className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${
                sort === value
                  ? "text-[#0d1b2a]"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={sort === value ? { background: "#f5c518" } : {}}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Invoice table */}
      <div className="bg-white border-2 border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#1a3a6e" }}>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Invoice</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Machine / Location</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden md:table-cell">Type</th>
              <th className="text-right px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Amount</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden sm:table-cell">Status</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden lg:table-cell">File</th>
              <th className="text-right px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No invoices found</td>
              </tr>
            ) : (
              sorted.map((record) => <InvoiceRow key={record.id} record={record} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Revenue by Deal Tab ───────────────────────────────────────────────────

async function RevenueTab({ sort }: { sort: string }) {
  const wonDeals = await prisma.deal.findMany({
    where: { stage: "CLOSED_WON", deletedAt: null },
    include: {
      lineItems: true,
      building: true,
      assignedTo: true,
    },
    orderBy: { closeDate: "desc" },
  });

  const dealsWithRevenue = wonDeals.map((d) => {
    const lineTotal = d.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
    return { ...d, revenue: lineTotal > 0 ? lineTotal : (d.value ?? 0) };
  });

  let sorted = [...dealsWithRevenue];
  if (sort === "revenue_asc") sorted.sort((a, b) => a.revenue - b.revenue);
  else if (sort === "date_asc") sorted.sort((a, b) => (a.closeDate?.getTime() ?? 0) - (b.closeDate?.getTime() ?? 0));
  else if (sort === "date_desc") sorted.sort((a, b) => (b.closeDate?.getTime() ?? 0) - (a.closeDate?.getTime() ?? 0));
  else sorted.sort((a, b) => b.revenue - a.revenue); // revenue_desc default

  const totalRevenue = dealsWithRevenue.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between px-5 py-4" style={{ background: "#0d1b2a" }}>
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Total Earned Revenue</p>
          <p className="text-3xl font-bold mt-1" style={{ color: "#f5c518" }}>{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">{dealsWithRevenue.length} closed deal{dealsWithRevenue.length !== 1 ? "s" : ""}</p>
        </div>
        <DollarSign className="h-12 w-12 text-white opacity-20" />
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400 mr-1">Sort by:</span>
        {[
          { value: "revenue_desc", label: "Revenue ↓" },
          { value: "revenue_asc", label: "Revenue ↑" },
          { value: "date_desc", label: "Newest" },
          { value: "date_asc", label: "Oldest" },
        ].map(({ value, label }) => (
          <Link
            key={value}
            href={`/financials?tab=revenue&sort=${value}`}
            className={`px-2 py-1 text-xs font-bold uppercase tracking-wide ${
              sort === value
                ? "text-[#0d1b2a]"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            style={sort === value ? { background: "#f5c518" } : {}}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Deal revenue table */}
      <div className="bg-white border-2 border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#1a3a6e" }}>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Deal</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Location</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden md:table-cell">Owner</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden lg:table-cell">Assigned To</th>
              <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden sm:table-cell">Closed</th>
              <th className="text-right px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No closed deals yet</td>
              </tr>
            ) : sorted.map((d) => (
              <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/deals/${d.id}`} className="font-semibold text-blue-600 hover:underline">
                    {d.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {d.building ? (
                    <div>
                      <Link href={`/buildings/${d.buildingId}`} className="text-sm font-medium text-gray-900 hover:underline">
                        {d.building.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {d.building.address}, {d.building.city}, {d.building.state}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {d.building?.ownerName ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900">{d.building.ownerName}</p>
                      {d.building.ownerEmail && (
                        <p className="text-xs text-gray-400 mt-0.5">{d.building.ownerEmail}</p>
                      )}
                      {d.building.ownerPhone && (
                        <p className="text-xs text-gray-400">{d.building.ownerPhone}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                  {d.assignedTo?.name ?? d.assignedTo?.email ?? "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                  {formatDate(d.closeDate)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-green-700 text-base">
                  {formatCurrency(d.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Line item breakdown per deal */}
      {sorted.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Line Item Breakdown</p>
          {sorted.map((d) => (
            d.lineItems.length > 0 && (
              <div key={d.id} className="bg-white border-2 border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between" style={{ background: "#f4f6f9" }}>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{d.title}</p>
                    {d.building && (
                      <p className="text-xs text-gray-500">{d.building.name} · {d.building.ownerName}</p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-green-700">{formatCurrency(d.revenue)}</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {d.lineItems.map((li) => (
                      <tr key={li.id} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-2 text-gray-700">{li.description}</td>
                        {li.machineType && (
                          <td className="px-4 py-2 text-xs text-gray-400">{li.machineType}</td>
                        )}
                        <td className="px-4 py-2 text-right text-gray-500">×{li.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-500">{formatCurrency(li.unitPrice)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatCurrency(li.unitPrice * li.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
