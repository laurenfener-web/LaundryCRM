import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MachinePartForm } from "@/components/MachinePartForm";

export default async function NewMachinePartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machine = await prisma.machine.findUnique({ where: { id }, include: { building: true } });
  if (!machine) notFound();

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href={`/machines/${id}/parts`} className="text-gray-400 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Add Harvested Part</h2>
          <p className="text-sm text-gray-500">{machine.make} {machine.model} · {machine.building.name}</p>
        </div>
      </div>
      <MachinePartForm machineId={id} />
    </div>
  );
}
