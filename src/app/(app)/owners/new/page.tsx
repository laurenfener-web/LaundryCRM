import { prisma } from "@/lib/db/client";
import { OwnerForm } from "@/components/OwnerForm";

export default async function NewOwnerPage() {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Owner</h2>
      <OwnerForm companies={companies} />
    </div>
  );
}
