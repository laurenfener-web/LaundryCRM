import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Factory } from "lucide-react";

const typeColors: Record<string, string> = {
  PROSPECT: "bg-yellow-100 text-yellow-700",
  CUSTOMER: "bg-green-100 text-green-700",
  PARTNER: "bg-blue-100 text-blue-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { owners: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-500">{companies.length} compan{companies.length !== 1 ? "ies" : "y"}</p>
        </div>
        <Link href="/companies/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Company
          </Button>
        </Link>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <Factory className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No companies yet</p>
            <Link href="/companies/new"><Button size="sm">Add your first company</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {companies.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-50 rounded-lg p-2 shrink-0">
                      <Factory className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{c.name}</p>
                      {c.industry && <p className="text-xs text-gray-500 mt-0.5">{c.industry.replace(/_/g, " ")}</p>}
                      {c.city && c.state && (
                        <p className="text-xs text-gray-400 mt-0.5">{c.city}, {c.state}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 flex-wrap items-center">
                    {c.type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[c.type] ?? "bg-gray-100 text-gray-600"}`}>
                        {c.type}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{c._count.owners} owner{c._count.owners !== 1 ? "s" : ""}</span>
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
