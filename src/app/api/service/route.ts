import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const machineId = searchParams.get("machineId");
  const records = await prisma.serviceRecord.findMany({
    where: machineId ? { machineId } : {},
    include: {
      machine: { include: { building: true } },
      technician: true,
      parts: { include: { part: true } },
    },
    orderBy: { serviceDate: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const body = await req.json();
  const { parts, ...recordData } = body;

  // Default technicianId to the logged-in user if not set
  if (!recordData.technicianId && userId) {
    recordData.technicianId = userId;
  }

  const record = await prisma.serviceRecord.create({
    data: {
      ...recordData,
      serviceDate: new Date(recordData.serviceDate),
      parts: parts?.length
        ? {
            create: parts.map((p: { partId: string; quantity: number; unitCostAtTime: number }) => ({
              partId: p.partId,
              quantity: p.quantity,
              unitCostAtTime: p.unitCostAtTime,
            })),
          }
        : undefined,
    },
    include: { machine: true, parts: { include: { part: true } } },
  });

  await prisma.activity.create({
    data: {
      type: "SERVICE_CREATED",
      body: `${recordData.serviceType.replace(/_/g, " ")} service logged`,
      machineId: recordData.machineId,
      serviceRecordId: record.id,
      userId: userId ?? undefined,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
