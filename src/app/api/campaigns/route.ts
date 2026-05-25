export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  // Check campaign limit
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const campaignCount = await prisma.campaign.count({ where: { userId: payload.userId } });

  // Starter: 3 campaigns, Free: 1 campaign, Pro/Agency: unlimited
  const maxCampaigns = user.plan === "starter" ? 3 : user.plan === "free" ? 1 : -1;
  if (maxCampaigns !== -1 && campaignCount >= maxCampaigns) {
    return NextResponse.json(
      { error: `You've reached the campaign limit (${maxCampaigns}) for the ${user.plan} plan. Upgrade to create more campaigns.` },
      { status: 403 }
    );
  }

  const campaign = await prisma.campaign.create({
    data: { name, userId: payload.userId },
  });

  return NextResponse.json({ campaign });
}
