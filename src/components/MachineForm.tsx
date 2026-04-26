"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MACHINE_TYPES,
  MACHINE_STATUSES,
  FUEL_TYPES,
  CONTROL_TYPES,
  CONDITIONS,
  OWNERSHIP_TYPES,
  VOLTAGE_OPTIONS,
  CAPACITY_UNITS,
} from "@/types";
import type { Machine, Building, Vendor } from "@/types";

type FormData = {
  buildingId: string;
  make: string;
  model: string;
  type: string;
  status: string;
  serialNumber: string;
  assetTag: string;
  purchasePrice: string;
  listPrice: string;
  currentValue: string;
  installDate: string;
  warrantyExpiry: string;
  nextServiceDue: string;
  modelYear: string;
  capacity: string;
  capacityUnit: string;
  fuelType: string;
  voltage: string;
  controlType: string;
  condition: string;
  locationDetail: string;
  ownershipType: string;
  vendorId: string;
  leaseEndDate: string;
  notes: string;
};

function ns(v: string): string | null { return v.trim() ? v.trim() : null; }
function nf(v: string): number | null { return v ? parseFloat(v) : null; }
function ni(v: string): number | null { return v ? parseInt(v, 10) : null; }
function nd(v: string): string | null { return v ? new Date(v).toISOString() : null; }

export function MachineForm({
  machine,
  buildings,
  vendors = [],
  mode = "full",
}: {
  machine?: Machine;
  buildings: Building[];
  vendors?: Vendor[];
  mode?: "add" | "full";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultBuildingId = machine?.buildingId ?? searchParams.get("buildingId") ?? "";

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      buildingId: defaultBuildingId,
      make: machine?.make ?? "",
      model: machine?.model ?? "",
      type: machine?.type ?? "WASHER",
      status: machine?.status ?? "ACTIVE",
      serialNumber: machine?.serialNumber ?? "",
      assetTag: machine?.assetTag ?? "",
      purchasePrice: machine?.purchasePrice?.toString() ?? "",
      listPrice: machine?.listPrice?.toString() ?? "",
      currentValue: machine?.currentValue?.toString() ?? "",
      installDate: machine?.installDate ? new Date(machine.installDate).toISOString().slice(0, 10) : "",
      warrantyExpiry: machine?.warrantyExpiry ? new Date(machine.warrantyExpiry).toISOString().slice(0, 10) : "",
      nextServiceDue: machine?.nextServiceDue ? new Date(machine.nextServiceDue).toISOString().slice(0, 10) : "",
      modelYear: machine?.modelYear?.toString() ?? "",
      capacity: machine?.capacity?.toString() ?? "",
      capacityUnit: machine?.capacityUnit ?? "lbs",
      fuelType: machine?.fuelType ?? "",
      voltage: machine?.voltage ?? "",
      controlType: machine?.controlType ?? "",
      condition: machine?.condition ?? "",
      locationDetail: machine?.locationDetail ?? "",
      ownershipType: machine?.ownershipType ?? "",
      vendorId: machine?.vendorId ?? "",
      leaseEndDate: machine?.leaseEndDate ? new Date(machine.leaseEndDate).toISOString().slice(0, 10) : "",
      notes: machine?.notes ?? "",
    },
  });

  const ownershipType = watch("ownershipType");

  const onSubmit = async (data: FormData) => {
    const payload = {
      buildingId: data.buildingId,
      make: data.make,
      model: data.model,
      type: data.type,
      status: data.status,
      serialNumber: ns(data.serialNumber),
      assetTag: ns(data.assetTag),
      purchasePrice: nf(data.purchasePrice),
      listPrice: nf(data.listPrice),
      currentValue: nf(data.currentValue),
      installDate: nd(data.installDate),
      warrantyExpiry: nd(data.warrantyExpiry),
      nextServiceDue: nd(data.nextServiceDue),
      modelYear: ni(data.modelYear),
      capacity: nf(data.capacity),
      capacityUnit: ns(data.capacityUnit),
      fuelType: ns(data.fuelType),
      voltage: ns(data.voltage),
      controlType: ns(data.controlType),
      condition: ns(data.condition),
      locationDetail: ns(data.locationDetail),
      ownershipType: ns(data.ownershipType),
      vendorId: ns(data.vendorId),
      leaseEndDate: ownershipType === "LEASED" || ownershipType === "RENTED" ? nd(data.leaseEndDate) : null,
      notes: ns(data.notes),
    };
    const url = machine ? `/api/machines/${machine.id}` : "/api/machines";
    const method = machine ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/machines/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      {/* ── Core fields (always shown) ── */}
      <div className="space-y-4">
        <div>
          <Label>Building *</Label>
          <Select value={watch("buildingId")} onValueChange={(v) => setValue("buildingId", v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger>
            <SelectContent>
              {buildings.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="make">Make *</Label>
            <Input id="make" {...register("make", { required: true })} placeholder="Speed Queen" />
          </div>
          <div>
            <Label htmlFor="model">Model *</Label>
            <Input id="model" {...register("model", { required: true })} placeholder="SFNFASSP" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type *</Label>
            <Select value={watch("type")} onValueChange={(v) => setValue("type", v ?? "")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {MACHINE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input id="serialNumber" {...register("serialNumber")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="installDate">Install Date</Label>
            <Input id="installDate" type="date" {...register("installDate")} />
          </div>
          <div>
            <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
            <Input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} />
          </div>
        </div>
      </div>

      {/* ── Extended fields (edit / full mode) ── */}
      {mode === "full" && (
        <>
          {/* Identity */}
          <div className="space-y-4 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Identity</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="assetTag">Asset Tag</Label>
                <Input id="assetTag" {...register("assetTag")} placeholder="Internal ID" />
              </div>
              <div>
                <Label htmlFor="modelYear">Model Year</Label>
                <Input id="modelYear" type="number" min="1950" max="2099" {...register("modelYear")} placeholder="2022" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={watch("status")} onValueChange={(v) => setValue("status", v ?? "")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MACHINE_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="locationDetail">Location Detail</Label>
              <Input id="locationDetail" {...register("locationDetail")} placeholder="e.g. Floor 2, Room B" />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-4 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Specifications</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fuel Type</Label>
                <Select value={watch("fuelType") || "_none"} onValueChange={(v) => setValue("fuelType", v && v !== "_none" ? v : "")}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Voltage</Label>
                <Select value={watch("voltage") || "_none"} onValueChange={(v) => setValue("voltage", v && v !== "_none" ? v : "")}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {VOLTAGE_OPTIONS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" step="0.1" {...register("capacity")} placeholder="18" />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={watch("capacityUnit") || "lbs"} onValueChange={(v) => setValue("capacityUnit", v ?? "lbs")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAPACITY_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Control Type</Label>
                <Select value={watch("controlType") || "_none"} onValueChange={(v) => setValue("controlType", v && v !== "_none" ? v : "")}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {CONTROL_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={watch("condition") || "_none"} onValueChange={(v) => setValue("condition", v && v !== "_none" ? v : "")}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">—</SelectItem>
                  {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-4 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Financial</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="listPrice">List / MSRP ($)</Label>
                <Input id="listPrice" type="number" step="0.01" {...register("listPrice")} />
              </div>
              <div>
                <Label htmlFor="currentValue">Current Value ($)</Label>
                <Input id="currentValue" type="number" step="0.01" {...register("currentValue")} />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dates</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="warrantyExpiry">Warranty Expires</Label>
                <Input id="warrantyExpiry" type="date" {...register("warrantyExpiry")} />
              </div>
              <div>
                <Label htmlFor="nextServiceDue">Next Service Due</Label>
                <Input id="nextServiceDue" type="date" {...register("nextServiceDue")} />
              </div>
            </div>
          </div>

          {/* Ownership */}
          <div className="space-y-4 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ownership</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ownership Type</Label>
                <Select value={watch("ownershipType") || "_none"} onValueChange={(v) => setValue("ownershipType", v && v !== "_none" ? v : "")}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {OWNERSHIP_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vendor</Label>
                <Select value={watch("vendorId") || "_none"} onValueChange={(v) => setValue("vendorId", v && v !== "_none" ? v : "")}>
                  <SelectTrigger><SelectValue placeholder="Select vendor…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— None —</SelectItem>
                    {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(ownershipType === "LEASED" || ownershipType === "RENTED") && (
              <div className="w-48">
                <Label htmlFor="leaseEndDate">Lease / Rental End Date</Label>
                <Input id="leaseEndDate" type="date" {...register("leaseEndDate")} />
              </div>
            )}
          </div>
        </>
      )}

      {/* Notes */}
      <div className="pt-4 border-t">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : machine ? "Save Changes" : "Add Machine"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
