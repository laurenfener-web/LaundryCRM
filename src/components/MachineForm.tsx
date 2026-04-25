"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MACHINE_TYPES, MACHINE_STATUSES } from "@/types";
import type { Machine, Building } from "@/types";

type FormData = {
  buildingId: string;
  make: string;
  model: string;
  type: string;
  status: string;
  serialNumber: string;
  purchasePrice: string;
  installDate: string;
  notes: string;
};

export function MachineForm({ machine, buildings }: { machine?: Machine; buildings: Building[] }) {
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
      purchasePrice: machine?.purchasePrice?.toString() ?? "",
      installDate: machine?.installDate ? new Date(machine.installDate).toISOString().slice(0, 10) : "",
      notes: machine?.notes ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : null,
      installDate: data.installDate ? new Date(data.installDate).toISOString() : null,
      serialNumber: data.serialNumber || null,
    };
    const url = machine ? `/api/machines/${machine.id}` : "/api/machines";
    const method = machine ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/machines/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div>
        <Label>Building *</Label>
        <Select value={watch("buildingId")} onValueChange={(v: string | null) => setValue("buildingId", v ?? "")}>
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
          <Select value={watch("type")} onValueChange={(v: string | null) => setValue("type", v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MACHINE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={watch("status")} onValueChange={(v: string | null) => setValue("status", v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MACHINE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="serialNumber">Serial Number</Label>
          <Input id="serialNumber" {...register("serialNumber")} />
        </div>
        <div>
          <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
          <Input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} />
        </div>
        <div>
          <Label htmlFor="installDate">Install Date</Label>
          <Input id="installDate" type="date" {...register("installDate")} />
        </div>
      </div>

      <div>
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
