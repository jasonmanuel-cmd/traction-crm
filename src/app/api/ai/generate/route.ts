export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  const payload = await getAuthUser();
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { openaiKey: true, businessName: true, industry: true } });
  if (!user?.openaiKey) return NextResponse.json({ error: "No OpenAI key configured. Add one in Settings." }, { status: 400 });

  const { leadId } = await req.json();
  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: payload.userId } });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  try {
    const openai = new OpenAI({ apiKey: user.openaiKey });
    const prompt = `Write a short, personalized sales email (max 150 words) from ${user.businessName || "our company"} to ${lead.name}, who works as ${lead.title || "a professional"} at ${lead.company || "their company"}. The email should be friendly, mention how we help businesses in ${user.industry || "their industry"}, and invite a quick call. Include a subject line prefixed with "Subject: ".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || "";

    await prisma.lead.update({
      where: { id: lead.id },
      data: { generatedContent: content },
    });

    await prisma.activity.create({
      data: {
        action: `Generated AI email for ${lead.name} at ${lead.company}`,
        type: "ai",
        leadId: lead.id,
        userId: payload.userId,
      },
    });

    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI generation failed" }, { status: 500 });
  }
}
