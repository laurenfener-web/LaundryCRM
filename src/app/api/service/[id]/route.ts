import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await prisma.serviceRecord.findUnique({
    where: { id },
    include: {
      machine: { include: { building: true } },
      technician: true,
      parts: { include: { part: true } },
      activities: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { parts, ...data } = body;
  if (data.serviceDate) data.serviceDate = new Date(data.serviceDate);

  const record = await prisma.serviceRecord.update({
    where: { id },
    data: {
      ...data,
      ...(parts !== undefined
        ? {
            parts: {
              deleteMany: {},
              create: parts.map((p: { partId: string; quantity: number; unitCostAtTime: number }) => ({
                partId: p.partId,
                quantity: p.quantity,
                unitCostAtTime: p.unitCostAtTime,
              })),
            },
          }
        : {}),
    },
    include: { machine: true, parts: { include: { part: true } } },
  });
  return NextResponse.json(record);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.serviceRecord.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
