import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, TrendingUp, DollarSign } from "lucide-react";

const STAGES = ["PROSPECTING", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"] as const;

const stageColors: Record<string, string> = {
  PROSPECTING: "border-gray-300 bg-gray-50",
  QUALIFIED: "border-blue-300 bg-blue-50",
  PROPOSAL_SENT: "border-purple-300 bg-purple-50",
  NEGOTIATION: "border-orange-300 bg-orange-50",
  CLOSED_WON: "border-green-300 bg-green-50",
  CLOSED_LOST: "border-red-300 bg-red-50",
};

const stageLabelColors: Record<string, string> = {
  PROSPECTING: "text-gray-700",
  QUALIFIED: "text-blue-700",
  PROPOSAL_SENT: "text-purple-700",
  NEGOTIATION: "text-orange-700",
  CLOSED_WON: "text-green-700",
  CLOSED_LOST: "text-red-700",
};

export default async function DealsPage() {
  const deals = await prisma.deal.findMany({
    where: { deletedAt: null },
    include: { building: true, assignedTo: true, lineItems: true },
    orderBy: { createdAt: "desc" },
  });

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s, deals.filter((d) => d.stage === s)])
  );

  const wonDeals = deals.filter((d) => d.stage === "CLOSED_WON");
  const wonDealsWithRevenue = wonDeals.map((d) => {
    const lineTotal = d.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
    return { ...d, revenue: lineTotal > 0 ? lineTotal : (d.value ?? 0) };
  });
  const totalRevenue = wonDealsWithRevenue.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Deals Pipeline</h2>
          <p className="text-sm text-gray-500">
            {deals.filter((d) => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).length} open deals
          </p>
        </div>
        <Link href="/deals/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Deal</Button>
        </Link>
      </div>

      {wonDealsWithRevenue.length > 0 && (
        <div className="border-2 border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ background: "#0d1b2a" }}>
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-400">Revenue Earned</p>
              <p className="text-3xl font-bold mt-1" style={{ color: "#f5c518" }}>{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {wonDealsWithRevenue.length} closed deal{wonDealsWithRevenue.length !== 1 ? "s" : ""}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-white opacity-20" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#1a3a6e" }}>
                <th className="text-left px-4 py-2 text-white text-xs font-bold uppercase tracking-wide">Deal</th>
                <th className="text-left px-4 py-2 text-white text-xs font-bold uppercase tracking-wide hidden sm:table-cell">Building</th>
                <th className="text-left px-4 py-2 text-white text-xs font-bold uppercase tracking-wide hidden md:table-cell">Closed</th>
                <th className="text-right px-4 py-2 text-white text-xs font-bold uppercase tracking-wide">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {wonDealsWithRevenue.map((d) => (
                <tr key={d.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/deals/${d.id}`} className="font-medium text-blue-600 hover:underline">
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{d.building?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatDate(d.closeDate)}</td>
                  <td className="px-4 py-3 text-right font-bold text-green-700">{formatCurrency(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <TrendingUp className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No deals yet</p>
            <Link href="/deals/new"><Button size="sm">Create first deal</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Open Pipeline</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {STAGES.map((stage) => (
              <div key={stage} className={`rounded-lg border-2 p-3 min-h-40 ${stageColors[stage]}`}>
                <div className="mb-3">
                  <p className={`text-xs font-semibold uppercase tracking-wide ${stageLabelColors[stage]}`}>
                    {stage.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{byStage[stage].length} deals</p>
                </div>
                <div className="space-y-2">
                  {byStage[stage].map((deal) => (
                    <Link key={deal.id} href={`/deals/${deal.id}`}>
                      <div className="bg-white rounded-md p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                        <p className="text-xs font-medium text-gray-900 line-clamp-2">{deal.title}</p>
                        {deal.building && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{deal.building.name}</p>
                        )}
                        {deal.value && (
                          <p className="text-xs font-semibold text-gray-700 mt-1">{formatCurrency(deal.value)}</p>
                        )}
                        {deal.closeDate && (
                          <p className="text-xs text-gray-400">{formatDate(deal.closeDate)}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
