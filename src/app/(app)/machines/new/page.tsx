import { prisma } from "@/lib/db/client";
import { MachineForm } from "@/components/MachineForm";

export default async function NewMachinePage() {
  const buildings = await prisma.building.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Add Machine</h2>
        <p className="text-sm text-gray-500">Enter the key details — you can fill in specs and ownership info after adding.</p>
      </div>
      <MachineForm buildings={buildings} mode="add" />
    </div>
  );
}
