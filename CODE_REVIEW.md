# CODE REVIEW: Traction Marketing CRM Platform

**Date:** 2026-05-24
**Location:** C:\Users\blunt\Desktop\apps\traction
**Stack:** Next.js 16, React 19, Prisma 7, SQLite (libsql), Tailwind CSS 4
**Commit:** 36f06d5 (Initial commit)

---

## 1. Project Overview

Traction is an AI-powered sales/marketing CRM platform. Key features:
- User authentication with JWT cookies
- Lead management with campaign grouping
- AI email generation via OpenAI (user-supplied API key)
- Email sending via SendGrid (user-supplied API key)
- Usage-based plan limits (free/starter/pro/agency)
- Dashboard with stats and activity feeds
- 14-day free trial for new users

---

## 2. Security Issues (CRITICAL / HIGH)

### 2.1 -- Seed Endpoint Exposed in Production (CRITICAL)
**File:** `src/app/api/seed/route.ts`
- The seed endpoint has **NO authentication check**. Anyone can POST to `/api/seed` at any time.
- It **deletes and recreates** the demo user and all associated data (crm.  This is a destructive operation with no guard.
- The hardcoded demo credentials (`demo@traction.ai` / `demo1234`) are returned in the response.
- **Recommendation:** Remove this route entirely from production builds, or gate it behind `NODE_ENV === "development"` and/or an admin secret.

### 2.2 -- AI Test-Key Endpoint Lacks Authentication (HIGH)
**File:** `src/app/api/ai/test-key/route.ts`
- No authentication -- anyone can POST arbitrary OpenAI keys to `/api/test-key`.
- The endpoint sends the user-supply key to `api.openkey` and returns the result, which could be used to **validate stolen API keys**.
- Should require auth to prevent abuse as an OpenAI key validator.

### 2.3 -- OpenAI and Sendgrid Keys Stored in Plain Text (HIGH)
**File:** `prisma/schema.prisma` (lines 18-19)
- `openaiKey` and `sendgridKey` are stored as plain `String` fields in the database.
- No encryption at rest. If the SQLite DB is compromised, all users' API keys are exposed.
- **Recommendation:** Encrypt these keys before storing (e.g., AES-256 with a server-side secret), or use a secrets manager.

### 2.4 -- Campaign PATCH Uses Unchecked ID for Update (HIGH)
**File:** `src/app/api/campaigns/[id]/route.ts`, line 38
- The PATCH handler uses `prisma.campaign.update({ where: { id }, ... })` instead of `prisma.campaign.updateMany({ where: { id, userId: payload.userId }, ... })`.
- Unlike the GET and DELETE handlers in the same file, the PATCH does **NOT** verify `userId` in the update call.
- An attacker could modify any campaign by supplying a valid session token and a different user's campaign ID.

### 2.5 -- No CSRF Protection
- The app uses cookie-based JWT auth with `sameSite: "lx"` which provides some CSRF mitigation, but there's no CSRF token pattern for state-changing POST/PUT/DELETE operations.
- The `sameSite: "lax"` setting means GET requests from cross-origin pages won't send cookies, but POSTs initiated from third-party forms could still be vulnerable in older browsers.

### 2.6 -- JWT Secret Crash at Startup Only
**File:** `src/lib/auth.ts`
- If `JWT_SECRET` is not set, the app throws at the module level on import. This is good -- it fails fast.
- However, there's no minimum length validation. A weak/short secret would be accepted without warning.

### 2.7 -- Password Input Has No Strength Validation
**File:** `src/app/api/auth/register/route.ts`
- The register endpoint checks that password is present (`!password`) but does not enforce minimum length or complexity.
- The bcrypt cost factor (12) is good, but weak passwords are still weak.

---

## 3. Bugs and Logic Issues

### 3.1 -- Campaign PATCH: Empty String Bypass (MEDIUM)
**File:** `src/app/api/campaigns/[id]/route.ts`, lines 35-36
```ts
if (status) update.status = status;
if (name) update.name = name;
```
- If `name` is an empty string `""`, the `if (name)` check is false, so the name won't be updated to empty. This is probably fine semantically, but `status` could also be set to `""` which would pass through if the client sends it explicitly as a non-empty string. No validation of allowed status values.

### 3.2 -- Campaign DELETE Doesn't Clean Up Relations (MEDIUM)
**File:** `src/app/api/campaigns/[id]/route.ts`, line 50
- Deleting a campaign does NOT delete its associated `leads` or `activities`. Since `Lead.campaign` has cascade behavior defined by Prisma relations, but the DB is SQLite without `ON DELETE CASCADE` enforced in the migration, orphaned leads may remain.
- Compare with `[id]/leadDELETE` (leads/[id]) which does `deleteMany` on activities first.

### 3.3 -- Lead PATCH Uses updateMany But Returns Possibly Null (MEDIUM)
**File:** `src/app/api/leads/[id]/route.ts`, lines 32-43
- Uses `updateMany` for the update (secure), then `findFirst` to return. But if the lead was deleted between the two calls (race condition), `lead` would be `null` and the response would error. Minor but unhandled.

### 3.4 -- Email Sending Silently Swallows Errors (MEDIUM)
**File:** `src/app/api/campaigns/[id]/send/route.ts`, line 45
```ts
} catch { }
```
- Individual email failures are silently caught and ignored. The sent count will be inaccurate. Failed sends are not logged or reported to the user.
- The outer try/catch also swallows SendGrid initialization errors with a generic message.

### 3.5 -- Lead Filtering Uses `any` Type (LOW)
**File:** `src/app/api/leads/route.ts`, line 14
```ts
const where: any = { userId: payload.userId };
```
- The `any` type defeats TypeScript's type checking. The `where` should use Prisma's typed `LeadWhereInput`.

### 3.6 -- Settings PUT Allows Partial Updates Without Validation (LOW)
**File:** `src/app/api/settings/route.ts`
- The `allowedFields` pattern filters out falsy values, but there's no validation on the format of `website` (should be URL), `phone` (should match pattern), or `openaiKey` (should start with `sk-`).
- An invalid OpenAI key could be saved, breaking AI generation until corrected.

### 3.7 -- No Rate Limiting on Any Endpoint
- No rate limiting on login, register, seed, or API endpoints. The login endpoint is vulnerable to brute-force attacks.
- The AI generation endpoint could be abused to exhaust a user's OpenAI quota.

### 3.8 -- Middleware Doesn't Validate Token Signature
**File:** `src/middleware.ts`
- The middleware only checks for the **presence** of the `token` cookie (`request.cookies.get("token")?.value`). It does NOT verify the JWT signature.
- A user could craft a fake cookie with `token=anything` and pass the middleware check. The API routes do verify the token, so this is a defense-in-depth issue rather than a direct exploit, but it means the middleware gives a false sense of security.

---

## 4. Missing Error Handling

### 4.1 -- Login/Register: No Input Validation
- `src/app/api/auth/login/route.ts`: No check that `email` and `password` are present before calling `bcrypt.compare`. If `email` is missing, `user` will be null and the generic "Invalid credentials" is returned (which is fine for security), but the code flow is fragile.
- `src/app/api/auth/register/route.ts`: Validates presence but not format (email regex, password length).

### 4.2 -- AI Generate: No Input Sanitization
- `src/app/api/ai/generate/route.ts`: The `leadId` is used directly. While Prisma parameterizes queries (preventing SQL injection), there's no check that the lead belongs to the current user beyond the `findFirst` with `userId` check. This is actually handled correctly.

### 4.3 -- Settings: No Error Response for Invalid JSON
- None of the routes handle the case where `req.json()` fails (malformed JSON body). This would throw an unhandled exception and return a 500 with a stack trace in development.

---

## 5. TODO/FIXME Comments

No TODO, FIXME, HACK, XXX, or BUG comments were found in the source code (only matches were in `package-lock.json` integrity hashes).

---

## 6. Positive Observations

- **Good use of Prisma** with parameterized queries throughout -- no raw SQL injection vectors.
- **Proper password hashing** with bcrypt at cost factor 12.
- **JWT tokens are httpOnly and secure in production** -- good cookie configuration.
- **Scoped queries**: Most routes correctly filter by `userId` to prevent horizontal privilege escalation.
- **Plan enforcement**: Lead and campaign limits are checked before creation.
- **Clean separation of concerns**: Auth logic in `lib/auth.ts`, Prisma client in `lib/prisma.ts`.
- **Middleware-based route protection** for page routes.
- **Trial tracking** with start/end dates and computed remaining days.

---

## 7. Summary of Recommendations (Priority Order)

| Priority | Issue | File |
|----------|-------|------|
| P0 | Remove or protect the seed endpoint | `src/app/api/seed/route.ts` |
| P0 | Add userId check to campaign PATCH | `src/app/api/campaigns/[id]/route.ts` |
| P0 | Add auth to AI test-key endpoint | `src/app/api/ai/test-key/route.ts` |
| P1 | Encrypt API keys at rest | `prisma/schema.prisma` |
| P1 | Add rate limiting to auth routes | `src/app/api/auth/*` |
| P1 | Validate JWT in middleware, not just presence | `src/middleware.ts` |
| P2 | Add cascade cleanup for campaign delete | `src/app/api/campaigns/[id]/route.ts` |
| P2 | Add input validation (email format, password strength) | `src/app/api/auth/register/route.ts` |
| P2 | Replace `any` types with proper Prisma types | `src/app/api/leads/route.ts` |
| P3 | Add CSRF tokens for state-changing operations | Global |
| P3 | Handle malformed JSON in request bodies | All API routes |
| P3 | Log individual email send failures | `src/app/api/campaigns/[id]/send/route.ts` |

---

## 8. .gitignore Status

The existing `.gitignore` was already comprehensive for a Next.js project. Added `/dist` to the existing entries. The file now covers:
- `node_modules`, `.next`, `build`, `dist`, `coverage`
- `.env*` files
- Debug logs, `.DS_Store`, `*.pem`
- SQLite database files (`dev.db`, `dev.db-journal`, `dev.db-wal`)
- TypeScript build info, Prisma generated files
