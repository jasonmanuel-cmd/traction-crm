export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: payload.userId },
    include: {
      leads: { orderBy: { createdAt: "desc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ campaign });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: payload.userId } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { status, name } = await req.json();
  const update: Record<string, string> = {};
  if (status) update.status = status;
  if (name) update.name = name;

  const updated = await prisma.campaign.updateMany({ where: { id, userId: payload.userId }, data: update });
  if (updated.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updatedCampaign = await prisma.campaign.findUnique({ where: { id } });
  return NextResponse.json({ campaign: updatedCampaign });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: payload.userId } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade: delete associated activities and leads first
  await prisma.activity.deleteMany({ where: { campaignId: id } });
  await prisma.lead.deleteMany({ where: { campaignId: id } });
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
