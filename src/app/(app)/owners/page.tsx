import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, User } from "lucide-react";

export default async function OwnersPage() {
  const owners = await prisma.owner.findMany({
    where: { deletedAt: null },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Owners</h2>
          <p className="text-sm text-gray-500">{owners.length} owner{owners.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/owners/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Owner
          </Button>
        </Link>
      </div>

      {owners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <User className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No owners yet</p>
            <Link href="/owners/new"><Button size="sm">Add your first owner</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {owners.map((o) => (
            <Link key={o.id} href={`/owners/${o.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-50 rounded-lg p-2 shrink-0">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{o.name}</p>
                      {o.title && <p className="text-xs text-gray-500 mt-0.5">{o.title}</p>}
                      {o.company && (
                        <p className="text-xs text-gray-400 mt-0.5">{o.company.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 text-xs text-gray-400">
                    {o.phone && <span>{o.phone}</span>}
                    {o.email && <span className="truncate">{o.email}</span>}
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
