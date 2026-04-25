import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Edit, Building2 } from "lucide-react";

const stageColors: Record<string, string> = {
  PROSPECTING: "bg-gray-100 text-gray-700",
  QUALIFIED: "bg-blue-100 text-blue-700",
  PROPOSAL_SENT: "bg-purple-100 text-purple-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  CLOSED_WON: "bg-green-100 text-green-700",
  CLOSED_LOST: "bg-red-100 text-red-700",
};

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { building: true, assignedTo: true, lineItems: true, activities: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!deal) notFound();

  const lineTotal = deal.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{deal.title}</h2>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColors[deal.stage]}`}>
              {deal.stage.replace(/_/g, " ")}
            </span>
          </div>
          {deal.building && (
            <Link href={`/buildings/${deal.buildingId}`} className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {deal.building.name}
            </Link>
          )}
        </div>
        <Link href={`/deals/${id}/edit`}>
          <Button size="sm" variant="outline" className="gap-1.5"><Edit className="h-4 w-4" /> Edit</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Deal Value</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(deal.value)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Expected Close</p>
          <p className="font-semibold text-gray-900 mt-1">{formatDate(deal.closeDate)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Probability</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{deal.probability != null ? `${deal.probability}%` : "—"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Weighted Value</p>
          <p className="text-xl font-bold text-gray-900 mt-1">
            {deal.value && deal.probability ? formatCurrency((deal.value * deal.probability) / 100) : "—"}
          </p>
        </CardContent></Card>
      </div>

      {deal.lineItems.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Line Items</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-600">Description</th>
                  <th className="text-right py-2 font-medium text-gray-600">Qty</th>
                  <th className="text-right py-2 font-medium text-gray-600">Unit Price</th>
                  <th className="text-right py-2 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {deal.lineItems.map((li) => (
                  <tr key={li.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-2 text-gray-700">{li.description}</td>
                    <td className="py-2 text-right text-gray-600">{li.quantity}</td>
                    <td className="py-2 text-right text-gray-600">{formatCurrency(li.unitPrice)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(li.unitPrice * li.quantity)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300">
                  <td colSpan={3} className="py-2 font-semibold text-right text-gray-700">Total</td>
                  <td className="py-2 text-right font-bold text-gray-900">{formatCurrency(lineTotal)}</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {deal.notes && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Notes</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{deal.notes}</p>
          </CardContent>
        </Card>
      )}

      {deal.activities.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">Activity</p>
            <div className="space-y-2">
              {deal.activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{a.body}</p>
                    <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
