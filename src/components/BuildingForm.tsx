"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Building } from "@/types";

type FormData = {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  notes: string;
};

export function BuildingForm({ building }: { building?: Building }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: building?.name ?? "",
      address: building?.address ?? "",
      city: building?.city ?? "",
      state: building?.state ?? "",
      zip: building?.zip ?? "",
      ownerName: building?.ownerName ?? "",
      ownerEmail: building?.ownerEmail ?? "",
      ownerPhone: building?.ownerPhone ?? "",
      notes: building?.notes ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const url = building ? `/api/buildings/${building.id}` : "/api/buildings";
    const method = building ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const result = await res.json();
    router.push(`/buildings/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name">Building Name *</Label>
          <Input id="name" {...register("name", { required: true })} placeholder="123 Main St Laundromat" />
        </div>
        <div>
          <Label htmlFor="address">Address *</Label>
          <Input id="address" {...register("address", { required: true })} placeholder="123 Main Street" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1">
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register("city", { required: true })} />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Input id="state" {...register("state", { required: true })} placeholder="NY" />
          </div>
          <div>
            <Label htmlFor="zip">ZIP *</Label>
            <Input id="zip" {...register("zip", { required: true })} />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Owner Information</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" {...register("ownerName")} />
          </div>
          <div>
            <Label htmlFor="ownerEmail">Email</Label>
            <Input id="ownerEmail" type="email" {...register("ownerEmail")} />
          </div>
          <div>
            <Label htmlFor="ownerPhone">Phone</Label>
            <Input id="ownerPhone" {...register("ownerPhone")} />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : building ? "Save Changes" : "Create Building"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
