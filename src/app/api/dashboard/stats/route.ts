export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = payload.userId;

  const [leadCount, campaignCount, activityCount, leads] = await Promise.all([
    prisma.lead.count({ where: { userId } }),
    prisma.campaign.count({ where: { userId } }),
    prisma.activity.count({ where: { userId } }),
    prisma.lead.findMany({ where: { userId }, select: { status: true } }),
  ]);

  const bookings = leads.filter((l) => l.status === "meeting" || l.status === "won").length;
  const qualified = leads.filter((l) => l.status === "qualified" || l.status === "meeting").length;

  return NextResponse.json({
    stats: {
      totalLeads: leadCount,
      totalCampaigns: campaignCount,
      activities: activityCount,
      meetingsBooked: bookings,
      qualifiedLeads: qualified,
    },
  });
}
