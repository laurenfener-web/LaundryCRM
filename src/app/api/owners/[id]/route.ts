import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await prisma.owner.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(owner);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const owner = await prisma.owner.update({ where: { id }, data: body });
  return NextResponse.json(owner);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.owner.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
