import { prisma } from "@/lib/db/client";
import { ServiceForm } from "@/components/ServiceForm";

export default async function NewServicePage() {
  const [machines, parts] = await Promise.all([
    prisma.machine.findMany({
      where: { deletedAt: null },
      include: { building: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Log Service Record</h2>
      <ServiceForm machines={machines} parts={parts} />
    </div>
  );
}
