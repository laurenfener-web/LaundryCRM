import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getMachineFinancials } from "@/lib/db/financials";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const machine = await prisma.machine.findUnique({
    where: { id },
    include: {
      building: true,
      serviceRecords: {
        include: { parts: { include: { part: true } }, technician: true },
        orderBy: { serviceDate: "desc" },
      },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!machine) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const financials = await getMachineFinancials(id);
  return NextResponse.json({ ...machine, financials });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const machine = await prisma.machine.update({ where: { id }, data: body, include: { building: true } });
  return NextResponse.json(machine);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.machine.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
