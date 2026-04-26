import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, WashingMachine } from "lucide-react";
import { MachineFilters } from "@/components/MachineFilters";

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

const sortMap: Record<string, object> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  make: { make: "asc" },
  modelYear: { modelYear: "desc" },
  purchasePrice: { purchasePrice: "desc" },
  installDate: { installDate: "desc" },
  condition: { condition: "asc" },
};

export default async function MachinesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const buildingId = typeof sp.buildingId === "string" ? sp.buildingId : undefined;
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const fuelType = typeof sp.fuelType === "string" ? sp.fuelType : undefined;
  const controlType = typeof sp.controlType === "string" ? sp.controlType : undefined;
  const condition = typeof sp.condition === "string" ? sp.condition : undefined;
  const ownershipType = typeof sp.ownershipType === "string" ? sp.ownershipType : undefined;
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";

  const [machines, buildings] = await Promise.all([
    prisma.machine.findMany({
      where: {
        deletedAt: null,
        ...(buildingId && { buildingId }),
        ...(type && { type }),
        ...(status && { status }),
        ...(fuelType && { fuelType }),
        ...(controlType && { controlType }),
        ...(condition && { condition }),
        ...(ownershipType && { ownershipType }),
        ...(q && {
          OR: [
            { make: { contains: q, mode: "insensitive" } },
            { model: { contains: q, mode: "insensitive" } },
            { serialNumber: { contains: q, mode: "insensitive" } },
            { assetTag: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        building: true,
        _count: { select: { serviceRecords: true } },
      },
      orderBy: sortMap[sort] ?? { createdAt: "desc" },
    }),
    prisma.building.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const isFiltered = !!(q || buildingId || type || status || fuelType || controlType || condition || ownershipType || (sort && sort !== "newest"));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Machines</h2>
          <p className="text-sm text-gray-500">
            {machines.length} {isFiltered ? "matching" : ""} machine{machines.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/machines/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Machine
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="h-8 bg-gray-100 rounded animate-pulse" />}>
        <MachineFilters buildings={buildings} />
      </Suspense>

      {machines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <WashingMachine className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">{isFiltered ? "No machines match your filters" : "No machines yet"}</p>
            {!isFiltered && (
              <Link href="/machines/new"><Button size="sm">Add your first machine</Button></Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b-2" style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Machine</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Location</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Type</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Status</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Condition</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Control</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Year</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Services</th>
                <th className="text-left px-4 py-3 font-bold text-white uppercase tracking-wide text-xs">Price</th>
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
                    {m.assetTag && <p className="text-xs text-gray-400">Tag: {m.assetTag}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/buildings/${m.buildingId}`} className="text-gray-600 hover:underline">
                      {m.building.name}
                    </Link>
                    {m.locationDetail && <p className="text-xs text-gray-400">{m.locationDetail}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.type}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>
                      {m.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.condition ? (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionColors[m.condition] ?? "bg-gray-100 text-gray-600"}`}>
                        {m.condition.replace(/_/g, " ")}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.controlType ?? <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3 text-gray-600">{m.modelYear ?? <span className="text-gray-300">—</span>}</td>
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
