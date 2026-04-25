import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const parts = await prisma.part.findMany({
    include: { _count: { select: { serviceRecordParts: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(parts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const part = await prisma.part.create({ data: body });
  return NextResponse.json(part, { status: 201 });
}
