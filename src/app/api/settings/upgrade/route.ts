export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const PLAN_LIMITS: Record<string, { leadsLimit: number; emailsLimit: number }> = {
  free: { leadsLimit: 100, emailsLimit: 500 },
  starter: { leadsLimit: 500, emailsLimit: 1000 },
  pro: { leadsLimit: 5000, emailsLimit: 10000 },
  agency: { leadsLimit: -1, emailsLimit: 50000 },
};

export async function POST(req: Request) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!plan || !PLAN_LIMITS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const limits = PLAN_LIMITS[plan];
  const now = new Date();

  const updateData: any = {
    plan,
    leadsLimit: limits.leadsLimit,
    emailsLimit: limits.emailsLimit,
    upgradedAt: now,
  };

  // Set trial period for free plan upgrades
  if (plan === "free") {
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);
    updateData.trialStartAt = now;
    updateData.trialEndAt = trialEnd;
  }

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: updateData,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      leadsLimit: user.leadsLimit,
      emailsLimit: user.emailsLimit,
      trialStartAt: user.trialStartAt?.toISOString() || null,
      trialEndAt: user.trialEndAt?.toISOString() || null,
      upgradedAt: user.upgradedAt?.toISOString() || null,
    },
  });
}
