import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { ServiceForm } from "@/components/ServiceForm";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [record, machines, parts] = await Promise.all([
    prisma.serviceRecord.findUnique({
      where: { id },
      include: { parts: { include: { part: true } } },
    }),
    prisma.machine.findMany({ where: { deletedAt: null }, include: { building: true }, orderBy: { createdAt: "desc" } }),
    prisma.part.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!record) notFound();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Service Record</h2>
      <ServiceForm record={record} machines={machines} parts={parts} />
    </div>
  );
}
