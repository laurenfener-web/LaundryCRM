"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  MACHINE_TYPES,
  MACHINE_STATUSES,
  FUEL_TYPES,
  CONTROL_TYPES,
  CONDITIONS,
  OWNERSHIP_TYPES,
  SORT_OPTIONS,
} from "@/types";
import type { Building } from "@/types";

const FILTER_KEYS = ["q", "buildingId", "type", "status", "fuelType", "controlType", "condition", "ownershipType", "sort"];

export function MachineFilters({ buildings }: { buildings: Building[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "_all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/machines?${params.toString()}`);
    },
    [router, searchParams]
  );

  const hasFilters = FILTER_KEYS.some((k) => searchParams.has(k));

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        placeholder="Search machines…"
        className="w-44 h-8 text-sm"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => update("q", e.target.value)}
      />

      <Select
        value={searchParams.get("buildingId") ?? "_all"}
        onValueChange={(v) => update("buildingId", v)}
      >
        <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="All buildings" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All buildings</SelectItem>
          {buildings.map((b) => (
            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("type") ?? "_all"}
        onValueChange={(v) => update("type", v)}
      >
        <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="All types" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All types</SelectItem>
          {MACHINE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("status") ?? "_all"}
        onValueChange={(v) => update("status", v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All statuses</SelectItem>
          {MACHINE_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("condition") ?? "_all"}
        onValueChange={(v) => update("condition", v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Condition" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All conditions</SelectItem>
          {CONDITIONS.map((c) => (
            <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("fuelType") ?? "_all"}
        onValueChange={(v) => update("fuelType", v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Fuel type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All fuel types</SelectItem>
          {FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("controlType") ?? "_all"}
        onValueChange={(v) => update("controlType", v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Control" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All controls</SelectItem>
          {CONTROL_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("ownershipType") ?? "_all"}
        onValueChange={(v) => update("ownershipType", v)}
      >
        <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="Ownership" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All ownership</SelectItem>
          {OWNERSHIP_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sort") ?? "newest"}
        onValueChange={(v) => update("sort", v)}
      >
        <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="Sort by" /></SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={() => router.push("/machines")}>
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      )}
    </div>
  );
}
