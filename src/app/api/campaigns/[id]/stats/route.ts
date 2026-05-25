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
      leads: true,
      activities: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const leads = campaign.leads;
  const total = leads.length;
  const byStatus: Record<string, number> = {};
  leads.forEach((l) => {
    byStatus[l.status] = (byStatus[l.status] || 0) + 1;
  });

  const bySource: Record<string, number> = {};
  leads.forEach((l) => {
    bySource[l.source] = (bySource[l.source] || 0) + 1;
  });

  const withContent = leads.filter((l) => l.generatedContent).length;
  const contacted = (byStatus["contacted"] || 0) + (byStatus["qualified"] || 0) + (byStatus["meeting"] || 0) + (byStatus["won"] || 0);
  const meetings = (byStatus["meeting"] || 0) + (byStatus["won"] || 0);
  const won = byStatus["won"] || 0;

  const dailyActivity: Record<string, { emails: number; opens: number; replies: number }> = {};
  campaign.activities.forEach((a) => {
    const day = new Date(a.createdAt).toISOString().split("T")[0];
    if (!dailyActivity[day]) dailyActivity[day] = { emails: 0, opens: 0, replies: 0 };
    if (a.type === "email") dailyActivity[day].emails++;
    else if (a.type === "open") dailyActivity[day].opens++;
    else if (a.type === "reply") dailyActivity[day].replies++;
  });

  return NextResponse.json({
    stats: {
      total,
      new: byStatus["new"] || 0,
      contacted,
      qualified: byStatus["qualified"] || 0,
      meetings,
      won,
      lost: byStatus["lost"] || 0,
      withContent,
      byStatus,
      bySource,
      dailyActivity,
    },
  });
}
