// Simple in-memory rate limiter
// Max 5 attempts per IP per 15-minute window

type AttemptRecord = {
  count: number;
  resetAt: number;
};

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const attempts = new Map<string, AttemptRecord>();

export function rateLimitCheck(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record || now > record.resetAt) {
    // Window expired or first attempt — start fresh
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  attempts.set(ip, record);
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count };
}
