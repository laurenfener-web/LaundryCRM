import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { VendorForm } from "@/components/VendorForm";

export default async function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Vendor</h2>
      <VendorForm vendor={vendor} />
    </div>
  );
}
