import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getPurchaseOrderSummary } from "@/lib/db/financials";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      company: true,
      owner: true,
      machines: {
        where: { deletedAt: null },
        include: {
          building: true,
          serviceRecords: {
            include: { parts: { include: { part: true } }, technician: true },
            orderBy: { serviceDate: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const summary = await getPurchaseOrderSummary(id);

  return NextResponse.json({ ...order, summary });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const order = await prisma.purchaseOrder.update({
    where: { id },
    data: body,
    include: { vendor: true, company: true, owner: true },
  });
  return NextResponse.json(order);
}
