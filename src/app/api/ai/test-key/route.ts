export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  const { key } = await req.json();
  if (!key || !key.startsWith("sk-")) {
    return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
  }
  try {
    const openai = new OpenAI({ apiKey: key });
    await openai.models.list();
    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }
}
