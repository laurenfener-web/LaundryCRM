import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const vendors = await prisma.vendor.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { machines: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(vendors);
}

export async function POST(req: Request) {
  const body = await req.json();
  const vendor = await prisma.vendor.create({ data: body });
  return NextResponse.json(vendor, { status: 201 });
}
