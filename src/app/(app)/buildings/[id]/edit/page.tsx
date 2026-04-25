import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { BuildingForm } from "@/components/BuildingForm";

export default async function EditBuildingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const building = await prisma.building.findUnique({ where: { id } });
  if (!building) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Building</h2>
      <BuildingForm building={building} />
    </div>
  );
}
