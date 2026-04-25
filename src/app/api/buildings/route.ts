import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";

export async function GET() {
  const buildings = await prisma.building.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { machines: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(buildings);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const body = await req.json();
  const building = await prisma.building.create({ data: body });

  await prisma.activity.create({
    data: {
      type: "BUILDING_ADDED",
      body: `Building "${building.name}" added`,
      buildingId: building.id,
      userId: userId ?? undefined,
    },
  });

  return NextResponse.json(building, { status: 201 });
}
