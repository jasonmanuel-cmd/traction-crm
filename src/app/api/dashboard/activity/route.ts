export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activities = await prisma.activity.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { lead: { select: { name: true } }, campaign: { select: { name: true } } },
  });

  return NextResponse.json({ activities });
}
