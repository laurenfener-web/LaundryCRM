import { VendorForm } from "@/components/VendorForm";

export default function NewVendorPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Vendor</h2>
      <VendorForm />
    </div>
  );
}
