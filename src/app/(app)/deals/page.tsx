import { prisma } from "@/lib/db/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, TrendingUp } from "lucide-react";

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
    include: { building: true, assignedTo: true },
    orderBy: { createdAt: "desc" },
  });

  const byStage = Object.fromEntries(
    STAGES.map((s) => [s, deals.filter((d) => d.stage === s)])
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Deals Pipeline</h2>
          <p className="text-sm text-gray-500">{deals.filter((d) => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).length} open deals</p>
        </div>
        <Link href="/deals/new">
          <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New Deal</Button>
        </Link>
      </div>

      {deals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-3">
            <TrendingUp className="h-10 w-10 text-gray-300" />
            <p className="text-gray-500 text-sm">No deals yet</p>
            <Link href="/deals/new"><Button size="sm">Create first deal</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
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
      )}
    </div>
  );
}
