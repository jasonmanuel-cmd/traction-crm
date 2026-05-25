export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();
  if (!payload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true, name: true, email: true, businessName: true, website: true,
      phone: true, industry: true, plan: true, leadsLimit: true, emailsLimit: true,
      trialStartAt: true, trialEndAt: true, upgradedAt: true, createdAt: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Calculate trial status
  const now = new Date();
  const isTrialActive = user.trialEndAt && new Date(user.trialEndAt) > now && user.plan === "free";
  const trialDaysLeft = user.trialEndAt
    ? Math.max(0, Math.ceil((new Date(user.trialEndAt).getTime() - now.getTime()) / 86400000))
    : 0;

  return NextResponse.json({
    user: {
      ...user,
      trialStartAt: user.trialStartAt?.toISOString() || null,
      trialEndAt: user.trialEndAt?.toISOString() || null,
      upgradedAt: user.upgradedAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      isTrialActive,
      trialDaysLeft,
    },
  });
}
