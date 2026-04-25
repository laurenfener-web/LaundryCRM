import { PartForm } from "@/components/PartForm";

export default function NewPartPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Part</h2>
      <PartForm />
    </div>
  );
}
