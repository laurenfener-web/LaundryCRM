"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPANY_TYPES, COMPANY_INDUSTRIES } from "@/types";
import type { Company } from "@/types";

type FormData = {
  name: string;
  type: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
};

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: company?.name ?? "",
      type: company?.type ?? "",
      industry: company?.industry ?? "",
      website: company?.website ?? "",
      phone: company?.phone ?? "",
      email: company?.email ?? "",
      address: company?.address ?? "",
      city: company?.city ?? "",
      state: company?.state ?? "",
      zip: company?.zip ?? "",
      notes: company?.notes ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v.trim() || null])
    );
    const url = company ? `/api/companies/${company.id}` : "/api/companies";
    const method = company ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/companies/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      <div className="space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basic Info</p>
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input id="name" {...register("name", { required: true })} placeholder="Acme Laundry Corp" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={watch("type") || "_none"} onValueChange={(v) => setValue("type", v && v !== "_none" ? v : "")}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {COMPANY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Industry</Label>
            <Select value={watch("industry") || "_none"} onValueChange={(v) => setValue("industry", v && v !== "_none" ? v : "")}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">—</SelectItem>
                {COMPANY_INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
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
          {isSubmitting ? "Saving…" : company ? "Save Changes" : "Add Company"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
