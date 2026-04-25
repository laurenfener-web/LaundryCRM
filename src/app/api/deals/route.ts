import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { auth } from "@/auth";

export async function GET() {
  const deals = await prisma.deal.findMany({
    where: { deletedAt: null },
    include: {
      building: true,
      assignedTo: true,
      lineItems: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deals);
}

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const body = await req.json();
  const { lineItems, ...dealData } = body;
  if (dealData.closeDate) dealData.closeDate = new Date(dealData.closeDate);

  // Default assignedToId to logged-in user if not set
  if (!dealData.assignedToId && userId) {
    dealData.assignedToId = userId;
  }

  const deal = await prisma.deal.create({
    data: {
      ...dealData,
      lineItems: lineItems?.length ? { create: lineItems } : undefined,
    },
    include: { building: true, assignedTo: true, lineItems: true },
  });

  await prisma.activity.create({
    data: {
      type: "DEAL_CREATED",
      body: `Deal "${deal.title}" created in ${deal.stage}`,
      dealId: deal.id,
      buildingId: deal.buildingId ?? undefined,
      userId: userId ?? undefined,
    },
  });

  return NextResponse.json(deal, { status: 201 });
}
