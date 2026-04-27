import { CompanyForm } from "@/components/CompanyForm";

export default function NewCompanyPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Company</h2>
      <CompanyForm />
    </div>
  );
}
