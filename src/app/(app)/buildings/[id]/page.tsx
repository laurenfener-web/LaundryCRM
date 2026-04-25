import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Edit, Plus, WashingMachine, TrendingUp, MapPin, Phone, Mail } from "lucide-react";
import { MACHINE_STATUSES } from "@/types";

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  DECOMMISSIONED: "bg-red-100 text-red-700",
  FOR_SALE: "bg-yellow-100 text-yellow-700",
};

const stageColors: Record<string, string> = {
  PROSPECTING: "bg-gray-100 text-gray-600",
  QUALIFIED: "bg-blue-100 text-blue-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED_WON: "bg-green-100 text-green-700",
  CLOSED_LOST: "bg-red-100 text-red-700",
};

export default async function BuildingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const building = await prisma.building.findUnique({
    where: { id },
    include: {
      machines: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      deals: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!building) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{building.name}</h2>
          <p className="text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-4 w-4" />
            {building.address}, {building.city}, {building.state} {building.zip}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/machines/new?buildingId=${building.id}`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Machine
            </Button>
          </Link>
          <Link href={`/buildings/${id}/edit`}>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit className="h-4 w-4" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Owner</p>
            <p className="font-medium text-gray-900">{building.ownerName ?? "—"}</p>
            {building.ownerEmail && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Mail className="h-3 w-3" /> {building.ownerEmail}
              </p>
            )}
            {building.ownerPhone && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Phone className="h-3 w-3" /> {building.ownerPhone}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Machines</p>
            <p className="text-2xl font-bold text-gray-900">{building.machines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">Open Deals</p>
            <p className="text-2xl font-bold text-gray-900">
              {building.deals.filter((d) => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <WashingMachine className="h-4 w-4" /> Machines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {building.machines.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No machines</p>
            ) : (
              <div className="space-y-2">
                {building.machines.map((m) => (
                  <Link key={m.id} href={`/machines/${m.id}`}>
                    <div className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{m.make} {m.model}</p>
                        <p className="text-xs text-gray-400">{m.type} · {m.serialNumber ?? "No serial"}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>
                        {m.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {building.deals.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No deals</p>
            ) : (
              <div className="space-y-2">
                {building.deals.map((d) => (
                  <Link key={d.id} href={`/deals/${d.id}`}>
                    <div className="flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium text-gray-800">{d.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColors[d.stage]}`}>
                        {d.stage.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {building.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{building.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
