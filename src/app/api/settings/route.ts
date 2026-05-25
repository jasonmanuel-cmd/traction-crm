export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function PUT(req: Request) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const allowedFields: Record<string, string | undefined> = {
    businessName: body.businessName,
    website: body.website,
    phone: body.phone,
    industry: body.industry,
    openaiKey: body.openaiKey,
    sendgridKey: body.sendgridKey,
  };
  Object.keys(allowedFields).forEach((k) => { if (!allowedFields[k]) delete allowedFields[k]; });

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: allowedFields,
    select: { id: true, name: true, email: true, businessName: true, website: true, phone: true, industry: true, plan: true, leadsLimit: true, emailsLimit: true },
  });

  return NextResponse.json({ user });
}
