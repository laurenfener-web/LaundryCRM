import { prisma } from "@/lib/db/client";
import { DealForm } from "@/components/DealForm";

export default async function NewDealPage() {
  const buildings = await prisma.building.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">New Deal</h2>
      <DealForm buildings={buildings} />
    </div>
  );
}
