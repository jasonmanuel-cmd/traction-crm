export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, COOKIE_OPTIONS } from "@/lib/auth";
import { rateLimitCheck } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  try {
    // Rate limiting by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed, remaining } = rateLimitCheck(ip);
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again in 15 minutes." }, { status: 429 });
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Enforce minimum password length
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Set 14-day free trial
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        plan: "free",
        leadsLimit: 100,
        emailsLimit: 500,
        trialStartAt: now,
        trialEndAt: trialEnd,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set("token", token, COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
