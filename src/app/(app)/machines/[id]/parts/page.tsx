import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, ArrowLeft, Package } from "lucide-react";
import { togglePartsSource, deleteMachinePart } from "./actions";

const conditionColors: Record<string, string> = {
  Excellent: "bg-blue-100 text-blue-700",
  Good: "bg-green-100 text-green-700",
  Fair: "bg-yellow-100 text-yellow-700",
  Poor: "bg-red-100 text-red-700",
};

export default async function MachinePartsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machine = await prisma.machine.findUnique({
    where: { id },
    include: {
      building: true,
      harvestedParts: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!machine) notFound();

  const parts = machine.harvestedParts;
  const soldParts = parts.filter((p) => p.salePrice !== null);
  const totalRevenue = soldParts.reduce((s, p) => s + (p.salePrice ?? 0) * p.quantity, 0);
  const purchaseCost = machine.purchasePrice ?? 0;
  const netProfit = totalRevenue - purchaseCost;
  const isProfitable = netProfit > 0;

  const toggleAction = togglePartsSource.bind(null, id, !machine.isPartsSource);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/machines/${id}`} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">
            {machine.make} {machine.model} — Harvested Parts
          </h2>
          <p className="text-sm text-gray-500">{machine.building.name}</p>
        </div>
        <form action={toggleAction}>
          <button
            type="submit"
            className={`text-xs px-3 py-2 font-bold uppercase tracking-wide border-2 transition-colors ${
              machine.isPartsSource
                ? "border-yellow-400 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {machine.isPartsSource ? "✓ Parts Source" : "Mark as Parts Source"}
          </button>
        </form>
        <Link href={`/machines/${id}/parts/new`}>
          <Button size="sm" className="gap-1.5" style={{ background: "#f5c518", color: "#0d1b2a" }}>
            <Plus className="h-4 w-4" /> Add Part
          </Button>
        </Link>
      </div>

      {/* Profitability summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Machine Cost</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(purchaseCost)}</p>
        </div>
        <div className="p-4 bg-white border-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Parts Sold</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">{soldParts.length} of {parts.length} parts</p>
        </div>
        <div className={`p-4 border-2 ${isProfitable ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Net</p>
          <p className={`text-xl font-bold mt-1 ${isProfitable ? "text-green-700" : "text-red-600"}`}>
            {formatCurrency(netProfit)}
          </p>
        </div>
        <div className={`p-4 border-2 flex items-center justify-center ${isProfitable ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
            <span className={`text-sm font-black uppercase tracking-widest ${isProfitable ? "text-green-700" : "text-gray-500"}`}>
              {isProfitable ? "✓ Profitable" : "In Progress"}
            </span>
          </div>
        </div>
      </div>

      {/* Parts table */}
      {parts.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 border-2 border-dashed border-gray-200">
          <Package className="h-10 w-10 text-gray-300" />
          <p className="text-gray-500 text-sm">No parts harvested yet</p>
          <Link href={`/machines/${id}/parts/new`}>
            <Button size="sm">Add first part</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white border-2 border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Part</th>
                <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden md:table-cell">Condition</th>
                <th className="text-right px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Qty</th>
                <th className="text-right px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Sale Price</th>
                <th className="text-left px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide hidden lg:table-cell">Sold</th>
                <th className="text-right px-4 py-2.5 text-white text-xs font-bold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => {
                const deleteAction = deleteMachinePart.bind(null, p.id, id);
                return (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.description && <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{p.category ?? "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {p.condition ? (
                        <span className={`text-xs px-2 py-0.5 font-semibold ${conditionColors[p.condition] ?? "bg-gray-100 text-gray-600"}`}>
                          {p.condition}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{p.quantity}</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {p.salePrice !== null
                        ? <span className="text-green-700">{formatCurrency(p.salePrice * p.quantity)}</span>
                        : <span className="text-gray-300 font-normal">Not sold</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                      {p.soldAt ? formatDate(p.soldAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/machines/${id}/parts/${p.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                        <form action={deleteAction} onSubmit={(e) => { if (!confirm("Delete this part?")) e.preventDefault(); }}>
                          <button type="submit" className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {parts.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Total Revenue</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(totalRevenue)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <Link href="/parts-flow" className="text-blue-600 hover:underline">← View full Parts Flow overview</Link>
      </div>
    </div>
  );
}
