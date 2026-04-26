"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VENDOR_CATEGORIES } from "@/types";
import type { Vendor } from "@/types";

type FormData = {
  name: string;
  category: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
};

export function VendorForm({ vendor }: { vendor?: Vendor }) {
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: vendor?.name ?? "",
      category: vendor?.category ?? "",
      contactName: vendor?.contactName ?? "",
      phone: vendor?.phone ?? "",
      email: vendor?.email ?? "",
      website: vendor?.website ?? "",
      address: vendor?.address ?? "",
      city: vendor?.city ?? "",
      state: vendor?.state ?? "",
      zip: vendor?.zip ?? "",
      notes: vendor?.notes ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v.trim() || null])
    );
    const url = vendor ? `/api/vendors/${vendor.id}` : "/api/vendors";
    const method = vendor ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/vendors/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      <div className="space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basic Info</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Vendor Name *</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Speed Queen" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={watch("category") || "_none"} onValueChange={(v) => setValue("category", v && v !== "_none" ? v : "")}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {VENDOR_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="contactName">Contact Name</Label>
            <Input id="contactName" {...register("contactName")} placeholder="Jane Smith" />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="(555) 000-0000" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input id="website" {...register("website")} placeholder="https://…" />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
        <div>
          <Label htmlFor="address">Street Address</Label>
          <Input id="address" {...register("address")} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} maxLength={2} placeholder="NY" />
          </div>
          <div>
            <Label htmlFor="zip">ZIP</Label>
            <Input id="zip" {...register("zip")} />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : vendor ? "Save Changes" : "Add Vendor"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
