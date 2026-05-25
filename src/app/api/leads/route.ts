export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get("campaignId");

  const where: any = { userId: payload.userId };
  if (campaignId) where.campaignId = campaignId;

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function POST(req: Request) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, company, title, email, phone, campaignId, source } = await req.json();
  if (!name || !company || !campaignId) {
    return NextResponse.json({ error: "name, company, campaignId required" }, { status: 400 });
  }

  // Check lead limit
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const leadCount = await prisma.lead.count({ where: { userId: payload.userId } });
  if (user.leadsLimit !== -1 && leadCount >= user.leadsLimit) {
    return NextResponse.json(
      { error: `You've reached the lead limit (${user.leadsLimit}) for the ${user.plan} plan. Upgrade to add more leads.` },
      { status: 403 }
    );
  }

  const lead = await prisma.lead.create({
    data: { name, company, title, email, phone, campaignId, userId: payload.userId, source: source || "manual" },
  });

  return NextResponse.json({ lead });
}
