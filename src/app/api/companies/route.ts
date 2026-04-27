import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  const companies = await prisma.company.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { owners: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const company = await prisma.company.create({ data: body });
  return NextResponse.json(company, { status: 201 });
}
