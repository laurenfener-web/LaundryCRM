import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, labelFromKey } from "@/lib/utils";
import { getMachineFinancials } from "@/lib/db/financials";
import type { MachineFinancials } from "@/types";
import { Edit, ExternalLink, Mail, Phone, Plus, Wrench } from "lucide-react";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  DECOMMISSIONED: "bg-red-100 text-red-700",
  FOR_SALE: "bg-yellow-100 text-yellow-700",
};

const conditionColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  LIKE_NEW: "bg-teal-100 text-teal-700",
  GOOD: "bg-green-100 text-green-700",
  FAIR: "bg-yellow-100 text-yellow-700",
  POOR: "bg-red-100 text-red-700",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className="text-right text-gray-900">{value ?? <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

function age(date: Date | null): string | null {
  if (!date) return null;
  const years = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (years < 1) return `${Math.floor(years * 12)} months`;
  return `${years.toFixed(1)} years`;
}

function daysUntil(date: Date | null): string | null {
  if (!date) return null;
  const days = Math.round((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Today";
  return `In ${days} days`;
}

function daysSince(date: Date | null): string | null {
  if (!date) return null;
  const days = Math.round((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  return `${days} days ago`;
}

export default async function MachineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [machine, financials] = await Promise.all([
    prisma.machine.findUnique({
      where: { id },
      include: {
        building: true,
        vendor: true,
        serviceRecords: {
          include: { parts: { include: { part: true } }, technician: true },
          orderBy: { serviceDate: "desc" },
        },
      },
    }),
    getMachineFinancials(id).catch((): MachineFinancials | null => null),
  ]);

  if (!machine) notFound();

  const lastService = machine.serviceRecords[0] ?? null;
  const repairRatio = machine.purchasePrice && financials?.totalCost
    ? ((financials.totalCost - machine.purchasePrice) / machine.purchasePrice) * 100
    : null;
  const depreciation = machine.purchasePrice && machine.currentValue
    ? machine.purchasePrice - machine.currentValue
    : null;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{machine.make} {machine.model}</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[machine.status]}`}>
              {machine.status.replace(/_/g, " ")}
            </span>
            {machine.condition && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${conditionColors[machine.condition] ?? "bg-gray-100 text-gray-600"}`}>
                {machine.condition.replace(/_/g, " ")}
              </span>
            )}
          </div>
          <Link href={`/buildings/${machine.buildingId}`} className="text-sm text-blue-600 hover:underline mt-1 block">
            {machine.building.name}{machine.locationDetail ? ` · ${machine.locationDetail}` : ""}
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

      {/* Top KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Purchase Price</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(machine.purchasePrice)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Repair Cost</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency((financials?.totalLaborCost ?? 0) + (financials?.totalPartsCost ?? 0) || null)}</p>
          {repairRatio !== null && (
            <p className="text-xs text-gray-400 mt-0.5">{repairRatio.toFixed(0)}% of purchase price</p>
          )}
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Lifetime Cost</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(financials?.totalCost)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Machine Age</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{age(machine.installDate) ?? "—"}</p>
          {machine.modelYear && <p className="text-xs text-gray-400 mt-0.5">Model {machine.modelYear}</p>}
        </CardContent></Card>
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Identity */}
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identity</p>
            <Link href={`/machines/${id}/edit#identity`} className="text-gray-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="space-y-2">
            <Row label="Type" value={machine.type} />
            <Row label="Serial #" value={machine.serialNumber} />
            <Row label="Asset Tag" value={machine.assetTag} />
            <Row label="Model Year" value={machine.modelYear} />
            <Row label="Installed" value={formatDate(machine.installDate)} />
            <Row label="Service count" value={financials?.serviceCount ?? 0} />
            <Row label="Last service" value={lastService ? daysSince(lastService.serviceDate) : null} />
          </div>
        </CardContent></Card>

        {/* Specs */}
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specifications</p>
            <Link href={`/machines/${id}/edit#specifications`} className="text-gray-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="space-y-2">
            <Row label="Fuel" value={machine.fuelType} />
            <Row label="Voltage" value={machine.voltage} />
            <Row label="Control" value={machine.controlType} />
            <Row label="Capacity" value={machine.capacity ? `${machine.capacity} ${machine.capacityUnit ?? "lbs"}` : null} />
          </div>
        </CardContent></Card>

        {/* Service schedule */}
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Schedule & Warranty</p>
            <Link href={`/machines/${id}/edit#dates`} className="text-gray-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="space-y-2">
            <Row
              label="Next service"
              value={machine.nextServiceDue ? (
                <span className={daysUntil(machine.nextServiceDue)?.includes("overdue") ? "text-red-600 font-medium" : ""}>
                  {formatDate(machine.nextServiceDue)}<br />
                  <span className="text-xs text-gray-400">{daysUntil(machine.nextServiceDue)}</span>
                </span>
              ) : null}
            />
            <Row
              label="Warranty expires"
              value={machine.warrantyExpiry ? (
                <span className={daysUntil(machine.warrantyExpiry)?.includes("overdue") ? "text-red-600" : ""}>
                  {formatDate(machine.warrantyExpiry)}<br />
                  <span className="text-xs text-gray-400">{daysUntil(machine.warrantyExpiry)}</span>
                </span>
              ) : null}
            />
            {(machine.ownershipType === "LEASED" || machine.ownershipType === "RENTED") && (
              <Row
                label="Lease ends"
                value={machine.leaseEndDate ? (
                  <span className={daysUntil(machine.leaseEndDate)?.includes("overdue") ? "text-red-600 font-medium" : ""}>
                    {formatDate(machine.leaseEndDate)}<br />
                    <span className="text-xs text-gray-400">{daysUntil(machine.leaseEndDate)}</span>
                  </span>
                ) : null}
              />
            )}
          </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Financial */}
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Financial</p>
            <Link href={`/machines/${id}/edit#financial`} className="text-gray-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="space-y-2">
            <Row label="List / MSRP" value={formatCurrency(machine.listPrice)} />
            <Row label="Purchase price" value={formatCurrency(machine.purchasePrice)} />
            <Row label="Current value" value={formatCurrency(machine.currentValue)} />
            {depreciation !== null && (
              <Row label="Depreciation" value={<span className="text-orange-600">{formatCurrency(depreciation)}</span>} />
            )}
            <Row label="Labor cost" value={formatCurrency(financials?.totalLaborCost)} />
            <Row label="Parts cost" value={formatCurrency(financials?.totalPartsCost)} />
            <Row label="Ownership" value={machine.ownershipType} />
          </div>
        </CardContent></Card>

        {/* Vendor */}
        <Card><CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor</p>
            <Link href={`/machines/${id}/edit#ownership`} className="text-gray-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Link>
          </div>
          {machine.vendor ? (
            <div className="space-y-2">
              <Link href={`/vendors/${machine.vendor.id}`} className="text-sm font-medium text-blue-600 hover:underline block">
                {machine.vendor.name}
              </Link>
              {machine.vendor.category && (
                <p className="text-xs text-gray-500">{machine.vendor.category}</p>
              )}
              {machine.vendor.contactName && (
                <p className="text-sm text-gray-700">{machine.vendor.contactName}</p>
              )}
              {machine.vendor.phone && (
                <a href={`tel:${machine.vendor.phone}`} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400" /> {machine.vendor.phone}
                </a>
              )}
              {machine.vendor.email && (
                <a href={`mailto:${machine.vendor.email}`} className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> {machine.vendor.email}
                </a>
              )}
              {machine.vendor.website && (
                <a href={machine.vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                  <ExternalLink className="h-3.5 w-3.5" /> Website
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">No vendor linked</p>
              <Link href={`/machines/${id}/edit`} className="text-xs text-blue-600 hover:underline">Link a vendor →</Link>
            </div>
          )}
        </CardContent></Card>

        {/* Notes */}
        {machine.notes && (
          <Card><CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
              <Link href={`/machines/${id}/edit#notes`} className="text-gray-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></Link>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{machine.notes}</p>
          </CardContent></Card>
        )}
      </div>

      {/* Service History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Service History
            </CardTitle>
            <Link href={`/service/new?machineId=${machine.id}`} className="text-xs text-blue-600 hover:underline">
              + Log service
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {machine.serviceRecords.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No service records yet</p>
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
    </div>
  );
}
