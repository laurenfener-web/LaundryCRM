import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { OwnerForm } from "@/components/OwnerForm";

export default async function EditOwnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [owner, companies] = await Promise.all([
    prisma.owner.findUnique({ where: { id } }),
    prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!owner) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Owner</h2>
      <OwnerForm owner={owner} companies={companies} />
    </div>
  );
}
