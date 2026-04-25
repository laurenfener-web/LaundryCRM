import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, labelFromKey } from "@/lib/utils";
import { Edit } from "lucide-react";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.serviceRecord.findUnique({
    where: { id },
    include: {
      machine: { include: { building: true } },
      technician: true,
      parts: { include: { part: true } },
    },
  });
  if (!record) notFound();

  const partsCost = record.parts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);
  const totalCost = (record.laborCost ?? 0) + partsCost;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{labelFromKey(record.serviceType)}</h2>
          <div className="flex items-center gap-3 mt-1">
            <Link href={`/machines/${record.machineId}`} className="text-blue-600 hover:underline text-sm">
              {record.machine.make} {record.machine.model}
            </Link>
            <span className="text-gray-300">·</span>
            <Link href={`/buildings/${record.machine.buildingId}`} className="text-gray-500 hover:underline text-sm">
              {record.machine.building.name}
            </Link>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[record.status]}`}>
              {record.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <Link href={`/service/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5"><Edit className="h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Date</p>
          <p className="font-semibold text-gray-900 mt-1">{formatDate(record.serviceDate)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Labor Cost</p>
          <p className="font-semibold text-gray-900 mt-1">{formatCurrency(record.laborCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Parts Cost</p>
          <p className="font-semibold text-gray-900 mt-1">{formatCurrency(partsCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Cost</p>
          <p className="font-bold text-gray-900 mt-1">{formatCurrency(totalCost)}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5 space-y-3">
          <p className="text-sm font-medium text-gray-700">Description</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.description}</p>
          {record.invoiceNumber && (
            <p className="text-xs text-gray-400">Invoice: {record.invoiceNumber}</p>
          )}
          {record.warrantyWork && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Warranty Work</span>
          )}
          {record.technician && (
            <p className="text-xs text-gray-400">Technician: {record.technician.name}</p>
          )}
        </CardContent>
      </Card>

      {record.parts.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Parts Used</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Part</th>
                  <th className="text-right py-2 font-medium text-gray-600">Qty</th>
                  <th className="text-right py-2 font-medium text-gray-600">Unit Cost</th>
                  <th className="text-right py-2 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {record.parts.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2">
                      <Link href={`/parts/${p.partId}`} className="text-blue-600 hover:underline">{p.part.name}</Link>
                    </td>
                    <td className="py-2 text-right text-gray-600">{p.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{formatCurrency(p.unitCostAtTime)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(p.unitCostAtTime * p.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
