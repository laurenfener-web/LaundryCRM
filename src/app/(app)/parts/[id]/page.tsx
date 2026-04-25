import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit } from "lucide-react";

export default async function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const part = await prisma.part.findUnique({
    where: { id },
    include: {
      serviceRecordParts: {
        include: { serviceRecord: { include: { machine: { include: { building: true } } } } },
        orderBy: { serviceRecord: { serviceDate: "desc" } },
        take: 20,
      },
    },
  });
  if (!part) notFound();

  const totalUsed = part.serviceRecordParts.reduce((s, p) => s + p.quantity, 0);
  const totalSpend = part.serviceRecordParts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{part.name}</h2>
          {part.sku && <p className="text-sm text-gray-500 mt-1">SKU: {part.sku}</p>}
        </div>
        <Link href={`/parts/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5"><Edit className="h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Unit Cost</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(part.unitCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Category</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{part.category ?? "—"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Times Used</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalUsed}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Spend</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalSpend)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Usage History</CardTitle>
        </CardHeader>
        <CardContent>
          {part.serviceRecordParts.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Part not used in any service records</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 font-medium text-gray-600">Machine</th>
                  <th className="text-left py-2 font-medium text-gray-600">Building</th>
                  <th className="text-right py-2 font-medium text-gray-600">Qty</th>
                  <th className="text-right py-2 font-medium text-gray-600">Cost</th>
                </tr>
              </thead>
              <tbody>
                {part.serviceRecordParts.map((srp) => (
                  <tr key={srp.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-500">{formatDate(srp.serviceRecord.serviceDate)}</td>
                    <td className="py-2">
                      <Link href={`/machines/${srp.serviceRecord.machineId}`} className="text-blue-600 hover:underline">
                        {srp.serviceRecord.machine.make} {srp.serviceRecord.machine.model}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-500">{srp.serviceRecord.machine.building.name}</td>
                    <td className="py-2 text-right text-gray-600">{srp.quantity}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(srp.unitCostAtTime * srp.quantity)}</td>
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
