"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Part } from "@/types";

type FormData = {
  name: string;
  sku: string;
  category: string;
  unitCost: string;
  supplier: string;
  description: string;
  notes: string;
};

export function PartForm({ part }: { part?: Part }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: part?.name ?? "",
      sku: part?.sku ?? "",
      category: part?.category ?? "",
      unitCost: part?.unitCost?.toString() ?? "",
      supplier: part?.supplier ?? "",
      description: part?.description ?? "",
      notes: part?.notes ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, unitCost: parseFloat(data.unitCost) || 0, sku: data.sku || null, supplier: data.supplier || null };
    const url = part ? `/api/parts/${part.id}` : "/api/parts";
    const method = part ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/parts/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Part Name *</Label>
          <Input id="name" {...register("name", { required: true })} placeholder="Drive Belt" />
        </div>
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} placeholder="SQ-DB-001" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Input id="category" {...register("category")} placeholder="Belts" />
        </div>
        <div>
          <Label htmlFor="unitCost">Unit Cost ($) *</Label>
          <Input id="unitCost" type="number" step="0.01" {...register("unitCost", { required: true })} />
        </div>
        <div>
          <Label htmlFor="supplier">Supplier</Label>
          <Input id="supplier" {...register("supplier")} />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register("description")} />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : part ? "Save Changes" : "Add Part"}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
