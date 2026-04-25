import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const part = await prisma.part.findUnique({
    where: { id },
    include: {
      serviceRecordParts: {
        include: { serviceRecord: { include: { machine: { include: { building: true } } } } },
        orderBy: { serviceRecord: { serviceDate: "desc" } },
      },
    },
  });
  if (!part) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(part);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const part = await prisma.part.update({ where: { id }, data: body });
  return NextResponse.json(part);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.part.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
