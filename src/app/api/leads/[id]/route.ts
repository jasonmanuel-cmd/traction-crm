export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findFirst({
    where: { id, userId: payload.userId },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      campaign: { select: { id: true, name: true } },
      user: { select: { businessName: true, industry: true } },
    },
  });

  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await prisma.lead.updateMany({
    where: { id, userId: payload.userId },
    data: body,
  });

  const lead = await prisma.lead.findFirst({
    where: { id, userId: payload.userId },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      campaign: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ lead });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.activity.deleteMany({ where: { leadId: id } });
  await prisma.lead.deleteMany({ where: { id, userId: payload.userId } });
  return NextResponse.json({ ok: true });
}
