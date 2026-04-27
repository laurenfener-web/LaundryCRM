import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";

export async function GET() {
  const orders = await prisma.purchaseOrder.findMany({
    include: {
      vendor: { select: { id: true, name: true } },
      company: { select: { id: true, name: true } },
      owner: { select: { id: true, name: true } },
      _count: { select: { machines: true } },
    },
    orderBy: { orderDate: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const body = await req.json();
  const {
    vendorId,
    companyId,
    ownerId,
    orderDate,
    unitCost,
    quantity,
    notes,
    machines: machineData = [],
  }: {
    vendorId?: string;
    companyId?: string;
    ownerId?: string;
    orderDate: string;
    unitCost?: number;
    quantity?: number;
    notes?: string;
    machines?: Array<{
      buildingId: string;
      make: string;
      model: string;
      type: string;
      serialNumber?: string;
      purchasePrice?: number;
    }>;
  } = body;

  const order = await prisma.purchaseOrder.create({
    data: {
      vendorId: vendorId ?? undefined,
      companyId: companyId ?? undefined,
      ownerId: ownerId ?? undefined,
      orderDate: new Date(orderDate),
      unitCost: unitCost ?? undefined,
      quantity: quantity ?? undefined,
      notes: notes ?? undefined,
      machines:
        machineData.length > 0
          ? {
              create: machineData.map((m) => ({
                buildingId: m.buildingId,
                make: m.make,
                model: m.model,
                type: m.type,
                serialNumber: m.serialNumber ?? undefined,
                purchasePrice: m.purchasePrice ?? unitCost ?? undefined,
                status: "ACTIVE",
              })),
            }
          : undefined,
    },
    include: {
      vendor: true,
      company: true,
      owner: true,
      _count: { select: { machines: true } },
    },
  });

  await prisma.activity.create({
    data: {
      type: "PURCHASE_ORDER_CREATED",
      body: `Purchase order created: ${order._count.machines} machine(s) from ${order.vendor?.name ?? "unknown vendor"}`,
      userId: userId ?? undefined,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
