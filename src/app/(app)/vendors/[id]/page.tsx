import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, Mail, Phone, WashingMachine } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  MANUFACTURER: "bg-blue-100 text-blue-700",
  DISTRIBUTOR: "bg-purple-100 text-purple-700",
  REPAIR: "bg-orange-100 text-orange-700",
  PARTS: "bg-green-100 text-green-700",
  OTHER: "bg-gray-100 text-gray-600",
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  DECOMMISSIONED: "bg-red-100 text-red-700",
  FOR_SALE: "bg-yellow-100 text-yellow-700",
};

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      machines: {
        where: { deletedAt: null },
        include: { building: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor) notFound();

  const totalMachineValue = vendor.machines.reduce((s, m) => s + (m.purchasePrice ?? 0), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{vendor.name}</h2>
            {vendor.category && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColors[vendor.category] ?? "bg-gray-100 text-gray-600"}`}>
                {vendor.category}
              </span>
            )}
          </div>
          {vendor.contactName && <p className="text-sm text-gray-500 mt-1">Contact: {vendor.contactName}</p>}
        </div>
        <Link href={`/vendors/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Machines</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{vendor.machines.length}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Total Machine Value</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalMachineValue || null)}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact details */}
        <Card><CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Details</p>
          {vendor.phone && (
            <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Phone className="h-4 w-4 text-gray-400" /> {vendor.phone}
            </a>
          )}
          {vendor.email && (
            <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail className="h-4 w-4 text-gray-400" /> {vendor.email}
            </a>
          )}
          {vendor.website && (
            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4" /> {vendor.website}
            </a>
          )}
          {!vendor.phone && !vendor.email && !vendor.website && (
            <p className="text-sm text-gray-400">No contact info recorded</p>
          )}
        </CardContent></Card>

        {/* Address */}
        {(vendor.address || vendor.city) && (
          <Card><CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
            <div className="text-sm text-gray-700 space-y-0.5">
              {vendor.address && <p>{vendor.address}</p>}
              {(vendor.city || vendor.state || vendor.zip) && (
                <p>{[vendor.city, vendor.state, vendor.zip].filter(Boolean).join(", ")}</p>
              )}
            </div>
          </CardContent></Card>
        )}
      </div>

      {vendor.notes && (
        <Card><CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{vendor.notes}</p>
        </CardContent></Card>
      )}

      {/* Machines */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <WashingMachine className="h-4 w-4" /> Machines from this Vendor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vendor.machines.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No machines linked to this vendor</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Machine</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Building</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Purchase Price</th>
                </tr>
              </thead>
              <tbody>
                {vendor.machines.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2">
                      <Link href={`/machines/${m.id}`} className="text-blue-600 hover:underline font-medium">
                        {m.make} {m.model}
                      </Link>
                      {m.serialNumber && <p className="text-xs text-gray-400">#{m.serialNumber}</p>}
                    </td>
                    <td className="py-2 text-gray-600">{m.building.name}</td>
                    <td className="py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>
                        {m.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">{formatCurrency(m.purchasePrice)}</td>
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
