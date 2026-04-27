import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const owners = await prisma.owner.findMany({
    where: { deletedAt: null },
    include: { company: { select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(owners);
}

export async function POST(req: Request) {
  const body = await req.json();
  const owner = await prisma.owner.create({ data: body });
  return NextResponse.json(owner, { status: 201 });
}
