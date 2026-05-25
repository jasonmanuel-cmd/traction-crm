export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // Block seed endpoint in production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // In non-production, require an admin secret
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.user.findUnique({ where: { email: "demo@traction.ai" } });
  if (existing) {
    await prisma.activity.deleteMany({ where: { userId: existing.id } });
    await prisma.lead.deleteMany({ where: { userId: existing.id } });
    await prisma.campaign.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
  }

  const hashed = await bcrypt.hash("demo1234", 12);

  // Set trial to end in 10 days from now
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 10);

  const user = await prisma.user.create({
    data: {
      name: "John Demo",
      email: "demo@traction.ai",
      password: hashed,
      businessName: "Acme Services LLC",
      website: "https://acmeservices.com",
      phone: "(555) 000-0000",
      industry: "Roofing & Construction",
      plan: "free",
      leadsLimit: 100,
      emailsLimit: 500,
      trialStartAt: now,
      trialEndAt: trialEnd,
    },
  });

  const campaigns = await Promise.all([
    prisma.campaign.create({ data: { name: "Q2 Roofing Outreach", status: "active", userId: user.id } }),
    prisma.campaign.create({ data: { name: "HVAC Summer Campaign", status: "active", userId: user.id } }),
    prisma.campaign.create({ data: { name: "Dental Practice Follow-up", status: "paused", userId: user.id } }),
    prisma.campaign.create({ data: { name: "Real Estate Q2 Blast", status: "completed", userId: user.id } }),
    prisma.campaign.create({ data: { name: "Landscaping Spring Push", status: "draft", userId: user.id } }),
    prisma.campaign.create({ data: { name: "Law Firm Retainer Outreach", status: "active", userId: user.id } }),
  ]);

  const leadData = [
    { name: "Michael Chen", company: "Summit Roofing", title: "Owner", email: "michael@summitroofing.com", phone: "(555) 123-4567", status: "meeting", score: 92, source: "LinkedIn", campaignId: campaigns[0].id },
    { name: "Sarah Mitchell", company: "Premier HVAC", title: "Operations Manager", email: "sarah@premierhvac.com", phone: "(555) 234-5678", status: "qualified", score: 85, source: "Google Maps", campaignId: campaigns[1].id },
    { name: "James Rodriguez", company: "BrightSmile Dental", title: "Practice Owner", email: "james@brightsmile.com", phone: "(555) 345-6789", status: "contacted", score: 73, source: "Website", campaignId: campaigns[2].id },
    { name: "Emily Thompson", company: "Thompson Realty", title: "Broker", email: "emily@thompsonrealty.com", phone: "(555) 456-7890", status: "won", score: 95, source: "Referral", campaignId: campaigns[3].id },
    { name: "David Park", company: "GreenLeaf Landscaping", title: "CEO", email: "david@greenleaf.com", phone: "(555) 567-8901", status: "new", score: 68, source: "Facebook", campaignId: campaigns[4].id },
    { name: "Lisa Anderson", company: "Anderson & Associates", title: "Partner", email: "lisa@andersonlaw.com", phone: "(555) 678-9012", status: "contacted", score: 78, source: "LinkedIn", campaignId: campaigns[5].id },
    { name: "Robert Kim", company: "Elite Electrical", title: "Founder", email: "robert@eliteelectrical.com", phone: "(555) 789-0123", status: "meeting", score: 88, source: "Google Maps", campaignId: campaigns[0].id },
    { name: "Amanda Foster", company: "Foster Plumbing", title: "Director", email: "amanda@fosterplumbing.com", phone: "(555) 890-1234", status: "qualified", score: 81, source: "Website", campaignId: campaigns[1].id },
  ];

  const leads = await Promise.all(
    leadData.map((l) => prisma.lead.create({ data: { ...l, userId: user.id } }))
  );

  const activityData = [
    { action: "Email sent to Michael Chen", type: "email", leadId: leads[0].id, campaignId: campaigns[0].id },
    { action: "Sarah Mitchell opened email", type: "open", leadId: leads[1].id, campaignId: campaigns[1].id },
    { action: "Meeting booked with Robert Kim", type: "booking", leadId: leads[6].id, campaignId: campaigns[0].id },
    { action: "James Rodriguez replied to sequence", type: "reply", leadId: leads[2].id, campaignId: campaigns[2].id },
    { action: "David Park added to campaign", type: "lead_added", leadId: leads[4].id, campaignId: campaigns[4].id },
    { action: "Emily Thompson marked as won", type: "deal_won", leadId: leads[3].id, campaignId: campaigns[3].id },
    { action: "Campaign 'HVAC Summer' launched", type: "campaign_started", campaignId: campaigns[1].id },
  ];

  await Promise.all(
    activityData.map((a) => prisma.activity.create({ data: { ...a, userId: user.id } }))
  );

  return NextResponse.json({
    message: "Database seeded",
    user: { email: "demo@traction.ai", password: "demo1234" },
  });
}
