import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, labelFromKey } from "@/lib/utils";
import { getMachineFinancials } from "@/lib/db/financials";
import { Edit, Plus, Wrench } from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  DECOMMISSIONED: "bg-red-100 text-red-700",
  FOR_SALE: "bg-yellow-100 text-yellow-700",
};

export default async function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [machine, financials] = await Promise.all([
    prisma.machine.findUnique({
      where: { id },
      include: {
        building: true,
        serviceRecords: {
          include: { parts: { include: { part: true } }, technician: true },
          orderBy: { serviceDate: "desc" },
        },
      },
    }),
    getMachineFinancials(id).catch(() => null),
  ]);

  if (!machine) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{machine.make} {machine.model}</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[machine.status]}`}>
              {machine.status}
            </span>
          </div>
          <Link href={`/buildings/${machine.buildingId}`} className="text-sm text-blue-600 hover:underline mt-1 block">
            {machine.building.name}
          </Link>
        </div>
        <div className="flex gap-2">
          <Link href={`/service/new?machineId=${machine.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> Log Service
            </Button>
          </Link>
          <Link href={`/machines/${id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Purchase Price</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(machine.purchasePrice)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Labor Cost</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(financials?.totalLaborCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Parts Cost</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(financials?.totalPartsCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Cost (Lifetime)</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(financials?.totalCost)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Details</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Type</span><span>{machine.type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Serial #</span><span>{machine.serialNumber ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Installed</span><span>{formatDate(machine.installDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Services</span><span>{financials?.serviceCount ?? 0}</span></div>
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Wrench className="h-4 w-4" /> Service History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {machine.serviceRecords.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No service records</p>
          ) : (
            <div className="space-y-3">
              {machine.serviceRecords.map((sr) => {
                const partsCost = sr.parts.reduce((s, p) => s + p.unitCostAtTime * p.quantity, 0);
                const totalCost = (sr.laborCost ?? 0) + partsCost;
                return (
                  <Link key={sr.id} href={`/service/${sr.id}`}>
                    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{labelFromKey(sr.serviceType)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{sr.description}</p>
                          {sr.technician && <p className="text-xs text-gray-400 mt-1">Tech: {sr.technician.name}</p>}
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-semibold text-gray-900">{formatCurrency(totalCost)}</p>
                          <p className="text-xs text-gray-400">{formatDate(sr.serviceDate)}</p>
                        </div>
                      </div>
                      {sr.parts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sr.parts.map((p) => (
                            <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {p.part.name} ×{p.quantity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {machine.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{machine.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
