import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { building: true, assignedTo: true, lineItems: true, activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { lineItems, ...data } = body;
  if (data.closeDate) data.closeDate = new Date(data.closeDate);

  const existing = await prisma.deal.findUniqueOrThrow({ where: { id } });
  const stageChanged = data.stage && data.stage !== existing.stage;

  const deal = await prisma.deal.update({
    where: { id },
    data: {
      ...data,
      ...(lineItems !== undefined
        ? { lineItems: { deleteMany: {}, create: lineItems } }
        : {}),
    },
    include: { building: true, assignedTo: true, lineItems: true },
  });

  if (stageChanged) {
    await prisma.activity.create({
      data: {
        type: "DEAL_STAGE_CHANGED",
        body: `Stage changed from ${existing.stage} to ${data.stage}`,
        dealId: id,
      },
    });
  }

  return NextResponse.json(deal);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
