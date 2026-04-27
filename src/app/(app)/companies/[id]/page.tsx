import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, ExternalLink, Mail, Phone, User } from "lucide-react";

const typeColors: Record<string, string> = {
  PROSPECT: "bg-yellow-100 text-yellow-700",
  CUSTOMER: "bg-green-100 text-green-700",
  PARTNER: "bg-blue-100 text-blue-700",
  OTHER: "bg-gray-100 text-gray-600",
};

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      owners: { where: { deletedAt: null }, orderBy: { name: "asc" } },
    },
  });

  if (!company) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
            {company.type && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[company.type] ?? "bg-gray-100 text-gray-600"}`}>
                {company.type}
              </span>
            )}
          </div>
          {company.industry && <p className="text-sm text-gray-500 mt-1">{company.industry.replace(/_/g, " ")}</p>}
        </div>
        <Link href={`/companies/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Owners</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{company.owners.length}</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
          {company.phone && (
            <a href={`tel:${company.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Phone className="h-4 w-4 text-gray-400" /> {company.phone}
            </a>
          )}
          {company.email && (
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail className="h-4 w-4 text-gray-400" /> {company.email}
            </a>
          )}
          {company.website && (
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <ExternalLink className="h-4 w-4" /> {company.website}
            </a>
          )}
          {!company.phone && !company.email && !company.website && (
            <p className="text-sm text-gray-400">No contact info recorded</p>
          )}
        </CardContent></Card>

        {(company.address || company.city) && (
          <Card><CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
            <div className="text-sm text-gray-700 space-y-0.5">
              {company.address && <p>{company.address}</p>}
              {(company.city || company.state || company.zip) && (
                <p>{[company.city, company.state, company.zip].filter(Boolean).join(", ")}</p>
              )}
            </div>
          </CardContent></Card>
        )}
      </div>

      {company.notes && (
        <Card><CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.notes}</p>
        </CardContent></Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4" /> Owners
            </CardTitle>
            <Link href={`/owners/new?companyId=${id}`}>
              <Button size="sm" variant="outline" className="text-xs">+ Add Owner</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {company.owners.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No owners linked to this company</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Title</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Email</th>
                </tr>
              </thead>
              <tbody>
                {company.owners.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2">
                      <Link href={`/owners/${o.id}`} className="text-blue-600 hover:underline font-medium">
                        {o.name}
                      </Link>
                    </td>
                    <td className="py-2 text-gray-600">{o.title ?? "—"}</td>
                    <td className="py-2 text-gray-600">{o.phone ?? "—"}</td>
                    <td className="py-2 text-gray-600">{o.email ?? "—"}</td>
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
