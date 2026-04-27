"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, WashingMachine } from "lucide-react";

type Machine = {
  id: string;
  make: string;
  model: string;
  type: string;
  status: string;
  serialNumber: string | null;
  building: { name: string };
};

interface CompanyMachinesProps {
  companyId: string;
  assigned: Machine[];
  available: Machine[];
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-600",
  DECOMMISSIONED: "bg-red-100 text-red-700",
  FOR_SALE: "bg-yellow-100 text-yellow-700",
};

export function CompanyMachines({ companyId, assigned, available }: CompanyMachinesProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [isPending, startTransition] = useTransition();

  const assign = async () => {
    if (!selectedId) return;
    await fetch(`/api/machines/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    setSelectedId("");
    startTransition(() => router.refresh());
  };

  const unassign = async (machineId: string) => {
    await fetch(`/api/machines/${machineId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: null }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-4">
      {assigned.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">No machines assigned to this company</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Machine</th>
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Building</th>
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {assigned.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0">
                <td className="py-2">
                  <Link href={`/machines/${m.id}`} className="text-blue-600 hover:underline font-medium">
                    {m.make} {m.model}
                  </Link>
                  {m.serialNumber && <p className="text-xs text-gray-400">#{m.serialNumber}</p>}
                </td>
                <td className="py-2 text-gray-600">{m.building.name}</td>
                <td className="py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[m.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {m.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <button
                    onClick={() => unassign(m.id)}
                    disabled={isPending}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove from company"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {available.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <Select value={selectedId || "_none"} onValueChange={(v) => setSelectedId(v === "_none" ? "" : v)}>
            <SelectTrigger className="flex-1 max-w-xs">
              <SelectValue placeholder="Select a machine to assign…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Select a machine…</SelectItem>
              {available.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.make} {m.model} — {m.building.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={assign} disabled={!selectedId || isPending}>
            <WashingMachine className="h-4 w-4 mr-1.5" /> Assign
          </Button>
        </div>
      )}
    </div>
  );
}
