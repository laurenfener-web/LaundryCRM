import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck } from "lucide-react";

const categoryColors: Record<string, string> = {
  MANUFACTURER: "bg-blue-100 text-blue-700",
  DISTRIBUTOR: "bg-purple-100 text-purple-700",
  REPAIR: "bg-orange-100 text-orange-700",
  PARTS: "bg-green-100 text-green-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default async function VendorsPage() {
  const vendors = await prisma.vendor.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { machines: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vendors</h2>
          <p className="text-sm text-gray-500">{vendors.length} vendor{vendors.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/vendors/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Vendor
          </Button>
        </Link>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <Truck className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No vendors yet</p>
            <Link href="/vendors/new"><Button size="sm">Add your first vendor</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map((v) => (
            <Link key={v.id} href={`/vendors/${v.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 rounded-lg p-2 shrink-0">
                      <Truck className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{v.name}</p>
                      {v.contactName && <p className="text-xs text-gray-500 mt-0.5">{v.contactName}</p>}
                      {v.city && v.state && (
                        <p className="text-xs text-gray-400 mt-0.5">{v.city}, {v.state}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {v.category && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[v.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {v.category}
                      </span>
                    )}
                    <Badge variant="secondary">{v._count.machines} machine{v._count.machines !== 1 ? "s" : ""}</Badge>
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
