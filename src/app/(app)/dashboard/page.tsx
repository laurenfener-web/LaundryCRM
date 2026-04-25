import { prisma } from "@/lib/db/client";
import { getMonthlyServiceSpend } from "@/lib/db/financials";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, WashingMachine, TrendingUp, Wrench } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [totalBuildings, totalMachines, activeMachines, openDeals, recentService, monthlySpend] =
    await Promise.all([
      prisma.building.count({ where: { deletedAt: null } }),
      prisma.machine.count({ where: { deletedAt: null } }),
      prisma.machine.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.deal.count({ where: { deletedAt: null, stage: { notIn: ["CLOSED_WON", "CLOSED_LOST"] } } }),
      prisma.serviceRecord.findMany({
        take: 5,
        orderBy: { serviceDate: "desc" },
        include: { machine: { include: { building: true } } },
      }),
      getMonthlyServiceSpend(6),
    ]);

  const kpis = [
    { label: "Buildings", value: totalBuildings, icon: Building2, href: "/buildings" },
    { label: "Total Machines", value: totalMachines, icon: WashingMachine, href: "/machines" },
    { label: "Active Machines", value: activeMachines, icon: WashingMachine, href: "/machines" },
    { label: "Open Deals", value: openDeals, icon: TrendingUp, href: "/deals" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                  </div>
                  <div className="bg-blue-50 rounded-full p-3">
                    <Icon className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Wrench className="h-4 w-4" /> Recent Service Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentService.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No service records yet</p>
            ) : (
              <div className="space-y-3">
                {recentService.map((sr) => (
                  <Link key={sr.id} href={`/service/${sr.id}`}>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 rounded px-1">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {sr.machine.make} {sr.machine.model}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sr.machine.building.name} · {sr.serviceType.replace(/_/g, " ")}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(sr.serviceDate)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-700">Monthly Service Spend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlySpend.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No spend data yet</p>
            ) : (
              <div className="space-y-2">
                {monthlySpend.slice(-6).map(({ month, total }) => (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-16">{month}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (total / Math.max(...monthlySpend.map((m) => m.total))) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-20 text-right">
                      {formatCurrency(total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
