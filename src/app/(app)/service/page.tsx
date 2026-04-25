import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, labelFromKey } from "@/lib/utils";
import { Plus, Wrench } from "lucide-react";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function ServicePage() {
  const records = await prisma.serviceRecord.findMany({
    include: {
      machine: { include: { building: true } },
      parts: true,
    },
    orderBy: { serviceDate: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Service Records</h2>
          <p className="text-sm text-gray-500">{records.length} records</p>
        </div>
        <Link href="/service/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Log Service</Button>
        </Link>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <Wrench className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No service records yet</p>
            <Link href="/service/new"><Button size="sm">Log first service</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Date</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Machine</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Building</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Type</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Status</th>
                <th className="text-right px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Cost</th>
              </tr>
            </thead>
            <tbody>
              {records.map((sr) => {
                const partsCost = sr.parts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);
                const total = (sr.laborCost ?? 0) + partsCost;
                return (
                  <tr key={sr.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                    <td className="px-4 py-3 text-gray-500">{formatDate(sr.serviceDate)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/service/${sr.id}`} className="font-medium text-blue-600 hover:underline">
                        {sr.machine.make} {sr.machine.model}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{sr.machine.building.name}</td>
                    <td className="px-4 py-3 text-gray-600">{labelFromKey(sr.serviceType)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[sr.status]}`}>
                        {sr.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
