import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Mail, Phone, Factory } from "lucide-react";

export default async function OwnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await prisma.owner.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!owner) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{owner.name}</h2>
          {owner.title && <p className="text-sm text-gray-500 mt-1">{owner.title}</p>}
        </div>
        <Link href={`/owners/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
          {owner.phone && (
            <a href={`tel:${owner.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Phone className="h-4 w-4 text-gray-400" /> {owner.phone}
            </a>
          )}
          {owner.email && (
            <a href={`mailto:${owner.email}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600">
              <Mail className="h-4 w-4 text-gray-400" /> {owner.email}
            </a>
          )}
          {!owner.phone && !owner.email && (
            <p className="text-sm text-gray-400">No contact info recorded</p>
          )}
        </CardContent></Card>

        {owner.company && (
          <Card><CardContent className="p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
            <Link href={`/companies/${owner.company.id}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
              <Factory className="h-4 w-4 text-gray-400" /> {owner.company.name}
            </Link>
          </CardContent></Card>
        )}
      </div>

      {owner.notes && (
        <Card><CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{owner.notes}</p>
        </CardContent></Card>
      )}
    </div>
  );
}
