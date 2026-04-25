"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEAL_STAGES, MACHINE_TYPES } from "@/types";
import type { Building, Deal, DealLineItem } from "@/types";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type DealWithLineItems = Deal & { lineItems: DealLineItem[] };

type FormData = {
  title: string;
  buildingId: string;
  stage: string;
  value: string;
  closeDate: string;
  probability: string;
  notes: string;
  lineItems: { description: string; quantity: string; unitPrice: string; machineType: string }[];
};

export function DealForm({ deal, buildings }: { deal?: DealWithLineItems; buildings: Building[] }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, control, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      title: deal?.title ?? "",
      buildingId: deal?.buildingId ?? "",
      stage: deal?.stage ?? "PROSPECTING",
      value: deal?.value?.toString() ?? "",
      closeDate: deal?.closeDate ? new Date(deal.closeDate).toISOString().slice(0, 10) : "",
      probability: deal?.probability?.toString() ?? "",
      notes: deal?.notes ?? "",
      lineItems: deal?.lineItems?.map((li) => ({
        description: li.description,
        quantity: li.quantity.toString(),
        unitPrice: li.unitPrice.toString(),
        machineType: li.machineType ?? "",
      })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "lineItems" });
  const watchedItems = watch("lineItems");
  const totalValue = watchedItems.reduce((s, li) => s + (parseInt(li.quantity || "1") * parseFloat(li.unitPrice || "0")), 0);

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      buildingId: data.buildingId || null,
      value: data.value ? parseFloat(data.value) : null,
      closeDate: data.closeDate ? new Date(data.closeDate).toISOString() : null,
      probability: data.probability ? parseInt(data.probability) : null,
      lineItems: data.lineItems.map((li) => ({
        description: li.description,
        quantity: parseInt(li.quantity) || 1,
        unitPrice: parseFloat(li.unitPrice) || 0,
        machineType: li.machineType || null,
      })),
    };
    const url = deal ? `/api/deals/${deal.id}` : "/api/deals";
    const method = deal ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/deals/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div>
        <Label htmlFor="title">Deal Title *</Label>
        <Input id="title" {...register("title", { required: true })} placeholder="10-machine sale to ABC Laundromat" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Building</Label>
          <Select value={watch("buildingId")} onValueChange={(v: string | null) => setValue("buildingId", v ?? "")}>
            <SelectTrigger><SelectValue placeholder="Select building (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">No building</SelectItem>
              {buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Stage</Label>
          <Select value={watch("stage")} onValueChange={(v: string | null) => setValue("stage", v ?? "")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="value">Deal Value ($)</Label>
          <Input id="value" type="number" step="0.01" {...register("value")} />
        </div>
        <div>
          <Label htmlFor="closeDate">Expected Close</Label>
          <Input id="closeDate" type="date" {...register("closeDate")} />
        </div>
        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input id="probability" type="number" min="0" max="100" {...register("probability")} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <Label>Line Items</Label>
          <Button type="button" size="sm" variant="outline" className="gap-1"
            onClick={() => append({ description: "", quantity: "1", unitPrice: "", machineType: "" })}>
            <Plus className="h-3 w-3" /> Add Line Item
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">No line items — add machines or services being quoted</p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, i) => (
              <div key={field.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input placeholder="Description" {...register(`lineItems.${i}.description`)} />
                </div>
                <div className="w-16">
                  <Input type="number" min="1" placeholder="Qty" {...register(`lineItems.${i}.quantity`)} />
                </div>
                <div className="w-24">
                  <Input type="number" step="0.01" placeholder="Price $" {...register(`lineItems.${i}.unitPrice`)} />
                </div>
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            ))}
            <div className="text-right text-sm font-semibold text-gray-700 pt-1">
              Total: {formatCurrency(totalValue)}
            </div>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : deal ? "Save Changes" : "Create Deal"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
