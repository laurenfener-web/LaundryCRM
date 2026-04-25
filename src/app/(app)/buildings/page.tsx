import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, MapPin } from "lucide-react";

export default async function BuildingsPage() {
  const buildings = await prisma.building.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { machines: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Buildings</h2>
          <p className="text-sm text-gray-500">{buildings.length} locations</p>
        </div>
        <Link href="/buildings/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Building
          </Button>
        </Link>
      </div>

      {buildings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <Building2 className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No buildings yet</p>
            <Link href="/buildings/new">
              <Button size="sm">Add your first building</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {buildings.map((b) => (
            <Link key={b.id} href={`/buildings/${b.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 rounded-lg p-2 shrink-0">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {b.city}, {b.state} {b.zip}
                      </p>
                      {b.ownerName && (
                        <p className="text-xs text-gray-500 mt-1">Owner: {b.ownerName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{b._count.machines} machines</Badge>
                    <Badge variant="outline">{b._count.deals} deals</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
