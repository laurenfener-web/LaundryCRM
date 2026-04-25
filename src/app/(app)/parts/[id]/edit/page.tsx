import { prisma } from "@/lib/db/client";
import { notFound } from "next/navigation";
import { PartForm } from "@/components/PartForm";

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const part = await prisma.part.findUnique({ where: { id } });
  if (!part) notFound();
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Edit Part</h2>
      <PartForm part={part} />
    </div>
  );
}
