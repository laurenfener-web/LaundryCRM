import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const buildings = await prisma.building.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { machines: true, deals: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(buildings);
}

export async function POST(req: Request) {
  const body = await req.json();
  const building = await prisma.building.create({ data: body });
  return NextResponse.json(building, { status: 201 });
}
