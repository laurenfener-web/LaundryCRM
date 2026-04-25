import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Plus, Package } from "lucide-react";

export default async function PartsPage() {
  const parts = await prisma.part.findMany({
    include: { _count: { select: { serviceRecordParts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Parts Catalog</h2>
          <p className="text-sm text-gray-500">{parts.length} parts</p>
        </div>
        <Link href="/parts/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Part</Button>
        </Link>
      </div>

      {parts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <Package className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No parts in catalog</p>
            <Link href="/parts/new"><Button size="sm">Add first part</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Name</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">SKU</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Category</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Unit Cost</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Supplier</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Times Used</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/parts/${p.id}`} className="font-medium text-blue-600 hover:underline">{p.name}</Link>
                    {p.description && <p className="text-xs text-gray-400">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(p.unitCost)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.supplier ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{p._count.serviceRecordParts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
