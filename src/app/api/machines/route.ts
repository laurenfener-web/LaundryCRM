import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buildingId = searchParams.get("buildingId");
  const machines = await prisma.machine.findMany({
    where: { deletedAt: null, ...(buildingId ? { buildingId } : {}) },
    include: { building: true, _count: { select: { serviceRecords: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(machines);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const body = await req.json();
  const machine = await prisma.machine.create({
    data: body,
    include: { building: true },
  });
  await prisma.activity.create({
    data: {
      type: "MACHINE_ADDED",
      body: `Machine ${machine.make} ${machine.model} added`,
      machineId: machine.id,
      buildingId: machine.buildingId,
      userId: userId ?? undefined,
    },
  });
  return NextResponse.json(machine, { status: 201 });
}
