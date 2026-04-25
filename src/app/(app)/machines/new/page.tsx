import { prisma } from "@/lib/db/client";
import { MachineForm } from "@/components/MachineForm";

export default async function NewMachinePage() {
  const buildings = await prisma.building.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Add Machine</h2>
      <MachineForm buildings={buildings} />
    </div>
  );
}
