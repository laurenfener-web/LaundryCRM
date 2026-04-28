"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMachinePart, updateMachinePart } from "@/app/(app)/machines/[id]/parts/actions";

const CATEGORIES = ["Motor", "Pump", "Belt", "Control Board", "Drum", "Door Seal", "Bearing", "Valve", "Hose", "Filter", "Timer", "Lid Switch", "Other"];
const CONDITIONS = ["Excellent", "Good", "Fair", "Poor"];

type MachinePart = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  condition: string | null;
  quantity: number;
  salePrice: number | null;
  soldAt: Date | null;
};

export function MachinePartForm({
  machineId,
  part,
}: {
  machineId: string;
  part?: MachinePart;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = !!part;

  const action = isEdit
    ? updateMachinePart.bind(null, part.id, machineId)
    : createMachinePart.bind(null, machineId);

  return (
    <form ref={formRef} action={action} className="space-y-5 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">Part Name *</Label>
          <Input id="name" name="name" required defaultValue={part?.name} placeholder="e.g. Control Board, Drain Pump" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={part?.category ?? ""}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="condition">Condition</Label>
          <select
            id="condition"
            name="condition"
            defaultValue={part?.condition ?? ""}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Select —</option>
            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" name="quantity" type="number" min={1} defaultValue={part?.quantity ?? 1} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salePrice">Sale Price ($)</Label>
          <Input id="salePrice" name="salePrice" type="number" step="0.01" min="0"
            defaultValue={part?.salePrice ?? ""} placeholder="0.00" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="soldAt">Date Sold</Label>
          <Input id="soldAt" name="soldAt" type="date"
            defaultValue={part?.soldAt ? new Date(part.soldAt).toISOString().slice(0, 10) : ""} />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="description">Notes</Label>
          <Input id="description" name="description" defaultValue={part?.description ?? ""} placeholder="e.g. Listed — asking $120" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" style={{ background: "#f5c518", color: "#0d1b2a" }} className="font-bold uppercase tracking-wide">
          {isEdit ? "Save Changes" : "Add Part"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
      </div>
    </form>
  );
}
