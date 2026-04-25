import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, WashingMachine } from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  DECOMMISSIONED: "bg-red-100 text-red-700",
  FOR_SALE: "bg-yellow-100 text-yellow-700",
};

export default async function MachinesPage() {
  const machines = await prisma.machine.findMany({
    where: { deletedAt: null },
    include: {
      building: true,
      _count: { select: { serviceRecords: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Machines</h2>
          <p className="text-sm text-gray-500">{machines.length} machines</p>
        </div>
        <Link href="/machines/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Machine
          </Button>
        </Link>
      </div>

      {machines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <WashingMachine className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No machines yet</p>
            <Link href="/machines/new"><Button size="sm">Add your first machine</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2" style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Machine</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Building</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Type</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Status</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Services</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Purchase Price</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Installed</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/machines/${m.id}`} className="font-medium text-blue-600 hover:underline">
                      {m.make} {m.model}
                    </Link>
                    {m.serialNumber && <p className="text-xs text-gray-400">#{m.serialNumber}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/buildings/${m.buildingId}`} className="text-gray-600 hover:underline">
                      {m.building.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m._count.serviceRecords}</td>
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(m.purchasePrice)}</td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(m.installDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
