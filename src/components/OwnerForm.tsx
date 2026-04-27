"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Owner, Company } from "@/types";

type FormData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  companyId: string;
  notes: string;
};

interface OwnerFormProps {
  owner?: Owner;
  companies: Pick<Company, "id" | "name">[];
}

export function OwnerForm({ owner, companies }: OwnerFormProps) {
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: owner?.name ?? "",
      title: owner?.title ?? "",
      email: owner?.email ?? "",
      phone: owner?.phone ?? "",
      companyId: owner?.companyId ?? "",
      notes: owner?.notes ?? "",
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v.trim() || null])
    );
    const url = owner ? `/api/owners/${owner.id}` : "/api/owners";
    const method = owner ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await res.json();
    router.push(`/owners/${result.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">

      <div className="space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basic Info</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" {...register("name", { required: true })} placeholder="Jane Smith" />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} placeholder="Owner, Property Manager…" />
          </div>
        </div>
        <div>
          <Label>Company</Label>
          <Select value={watch("companyId") || "_none"} onValueChange={(v) => setValue("companyId", v && v !== "_none" ? v : "")}>
            <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">— No company —</SelectItem>
              {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
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
      </div>

      <div className="pt-4 border-t">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} rows={3} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : owner ? "Save Changes" : "Add Owner"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
