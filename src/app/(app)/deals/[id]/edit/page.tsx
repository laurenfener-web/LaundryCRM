import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { DealForm } from "@/components/DealForm";

export default async function EditDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [deal, buildings] = await Promise.all([
    prisma.deal.findUnique({ where: { id }, include: { lineItems: true } }),
    prisma.building.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);
  if (!deal) notFound();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Deal</h2>
      <DealForm deal={deal} buildings={buildings} />
    </div>
  );
}
