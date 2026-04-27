import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { CompanyForm } from "@/components/CompanyForm";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Company</h2>
      <CompanyForm company={company} />
    </div>
  );
}
