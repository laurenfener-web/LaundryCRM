"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICE_TYPES, SERVICE_STATUSES } from "@/types";
import type { Machine, Building, Part, ServiceRecord, ServiceRecordPart } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ServiceRecordWithParts = ServiceRecord & { parts: (ServiceRecordPart & { part: Part })[] };

type FormData = {
  machineId: string;
  serviceDate: string;
  serviceType: string;
  status: string;
  description: string;
  laborHours: string;
  laborCost: string;
  invoiceNumber: string;
  warrantyWork: boolean;
  parts: { partId: string; quantity: string; unitCostAtTime: string }[];
};

export function ServiceForm({
  record,
  machines,
  parts,
}: {
  record?: ServiceRecordWithParts;
  machines: (Machine & { building: Building })[];
  parts: Part[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMachineId = record?.machineId ?? searchParams.get("machineId") ?? "";

  const { register, handleSubmit, setValue, watch, control, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      machineId: defaultMachineId,
      serviceDate: record?.serviceDate ? new Date(record.serviceDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      serviceType: record?.serviceType ?? "REPAIR",
      status: record?.status ?? "COMPLETED",
      description: record?.description ?? "",
      laborHours: record?.laborHours?.toString() ?? "",
      laborCost: record?.laborCost?.toString() ?? "",
      invoiceNumber: record?.invoiceNumber ?? "",
      warrantyWork: record?.warrantyWork ?? false,
      parts: record?.parts?.map((p) => ({
        partId: p.partId,
        quantity: p.quantity.toString(),
        unitCostAtTime: p.unitCostAtTime.toString(),
      })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "parts" });
  const watchedParts = watch("parts");
  const laborCost = parseFloat(watch("laborCost") || "0") || 0;
  const partsCost = watchedParts.reduce((s, p) => s + (parseFloat(p.quantity || "1") * parseFloat(p.unitCostAtTime || "0")), 0);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      serviceDate: new Date(data.serviceDate).toISOString(),
      laborHours: data.laborHours ? parseFloat(data.laborHours) : null,
      laborCost: data.laborCost ? parseFloat(data.laborCost) : null,
      invoiceNumber: data.invoiceNumber || null,
      parts: data.parts.map((p) => ({
        partId: p.partId,
        quantity: parseInt(p.quantity) || 1,
        unitCostAtTime: parseFloat(p.unitCostAtTime) || 0,
      })),
    };
    const url = record ? `/api/service/${record.id}` : "/api/service";
    const method = record ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/service/${result.id}`);
    router.refresh();
  };

  const handlePartChange = (index: number, partId: string | null) => {
    if (!partId) return;
    const part = parts.find((p) => p.id === partId);
    if (part) {
      setValue(`parts.${index}.partId`, partId);
      setValue(`parts.${index}.unitCostAtTime`, part.unitCost.toString());
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div>
        <Label>Machine *</Label>
        <Select value={watch("machineId")} onValueChange={(v: string | null) => setValue("machineId", v ?? "")}>
          <SelectTrigger><SelectValue placeholder="Select machine" /></SelectTrigger>
          <SelectContent>
            {machines.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.building.name} — {m.make} {m.model}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="serviceDate">Service Date *</Label>
          <Input id="serviceDate" type="date" {...register("serviceDate", { required: true })} />
        </div>
        <div>
          <Label>Type *</Label>
          <Select value={watch("serviceType")} onValueChange={(v: string | null) => setValue("serviceType", v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={watch("status")} onValueChange={(v: string | null) => setValue("status", v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SERVICE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" {...register("description", { required: true })} rows={3} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="laborHours">Labor Hours</Label>
          <Input id="laborHours" type="number" step="0.5" {...register("laborHours")} />
        </div>
        <div>
          <Label htmlFor="laborCost">Labor Cost ($)</Label>
          <Input id="laborCost" type="number" step="0.01" {...register("laborCost")} />
        </div>
        <div>
          <Label htmlFor="invoiceNumber">Invoice #</Label>
          <Input id="invoiceNumber" {...register("invoiceNumber")} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Parts Used</Label>
          <Button type="button" size="sm" variant="outline" className="gap-1" onClick={() => append({ partId: "", quantity: "1", unitCostAtTime: "" })}>
            <Plus className="h-3 w-3" /> Add Part
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No parts — click "Add Part" to add</p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Select value={watchedParts[i]?.partId} onValueChange={(v: string | null) => handlePartChange(i, v ?? "")}>
                    <SelectTrigger><SelectValue placeholder="Select part" /></SelectTrigger>
                    <SelectContent>
                      {parts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({formatCurrency(p.unitCost)})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-20">
                  <Input type="number" min="1" placeholder="Qty" {...register(`parts.${i}.quantity`)} />
                </div>
                <div className="w-24">
                  <Input type="number" step="0.01" placeholder="Cost $" {...register(`parts.${i}.unitCostAtTime`)} />
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
        <div className="flex justify-between"><span className="text-gray-500">Labor Cost</span><span>{formatCurrency(laborCost)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Parts Cost</span><span>{formatCurrency(partsCost)}</span></div>
        <div className="flex justify-between font-semibold border-t border-gray-200 pt-1 mt-1">
          <span>Total</span><span>{formatCurrency(laborCost + partsCost)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : record ? "Save Changes" : "Log Service"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
