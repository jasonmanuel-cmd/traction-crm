export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({ where: { id, userId: payload.userId }, include: { leads: true } });
  if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { sendgridKey: true, name: true, email: true } });

  const leadsToSend = campaign.leads.filter((l) => l.email && l.email.includes("@") && l.generatedContent);

  if (leadsToSend.length === 0) {
    return NextResponse.json({ error: "No leads with email and generated content. Generate AI copy first." }, { status: 400 });
  }

  if (user?.sendgridKey && user?.email) {
    try {
      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(user.sendgridKey);
      let sent = 0;
      for (const lead of leadsToSend) {
        try {
          const subject = lead.generatedContent.includes("Subject:")
            ? lead.generatedContent.split("Subject:")[1].split("\n")[0].trim()
            : `Quick question for ${lead.name}`;
          const body = lead.generatedContent.replace(/Subject:.+?\n/, "").trim();
          await sgMail.send({
            to: lead.email,
            from: user.email,
            subject: subject.substring(0, 100),
            text: body,
          });
          await prisma.lead.update({ where: { id: lead.id }, data: { status: "contacted" } });
          await prisma.activity.create({
            data: { action: `Email sent via SendGrid to ${lead.name} at ${lead.email}`, type: "email", leadId: lead.id, campaignId: id, userId: payload.userId },
          });
          sent++;
        } catch { }
      }
      await prisma.campaign.update({ where: { id }, data: { status: "active" } });
      return NextResponse.json({ sent, total: leadsToSend.length });
    } catch {
      return NextResponse.json({ error: "Failed to initialize SendGrid. Check your API key in Settings." }, { status: 500 });
    }
  }

  let sent = 0;
  for (const lead of leadsToSend) {
    await prisma.lead.update({ where: { id: lead.id }, data: { status: "contacted" } });
    await prisma.activity.create({
      data: { action: `Email queued for ${lead.name} at ${lead.email}`, type: "email", leadId: lead.id, campaignId: id, userId: payload.userId },
    });
    sent++;
  }
  await prisma.campaign.update({ where: { id }, data: { status: "active" } });
  return NextResponse.json({ sent, total: leadsToSend.length, note: "Marked as sent. Add a SendGrid key in Settings to send for real." });
}
