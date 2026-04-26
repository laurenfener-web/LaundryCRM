import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { MachineForm } from "@/components/MachineForm";

export default async function EditMachinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [machine, buildings, vendors] = await Promise.all([
    prisma.machine.findUnique({ where: { id } }),
    prisma.building.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);
  if (!machine) notFound();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Machine</h2>
      <MachineForm machine={machine} buildings={buildings} vendors={vendors} mode="full" />
    </div>
  );
}
