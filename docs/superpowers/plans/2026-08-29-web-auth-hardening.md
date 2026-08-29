---
workflow: superpowers:subagent-driven-development
---

# Implementation Plan — Web Auth Hardening: OTP Password Reset + D1 Rate Limiting — 2026-08-29

Spec: `docs/superpowers/specs/2026-08-29-web-auth-hardening-design.md` (user-approved via "Start implementation")
Ledger: `.superpowers/sdd/web-auth-hardening/progress.md`
Scope: `packages/db` (new `auth_attempts` table + migration), `apps/web` (OTP reset, rate limiting, docs, tests), `apps/api` (mail.ts dual-header fix).

## Task 1 — SDD artifacts
- [ ] 1.1 Design spec written
- [ ] 1.2 Plan written + ledger created
- [ ] 1.3 `task.md` updated with this task group

## Task 2 — `authAttempts` table + migration (`packages/db`)
- [ ] 2.1 `src/schema.ts`: add `authAttempts` sqliteTable (key unique, attempts, windowStart, lockedUntil, updatedAt)
- [ ] 2.2 `drizzle-kit generate` → `packages/db/drizzle/XXXX_auth_attempts.sql`; inspect SQL
- [ ] 2.3 Rebuild `@bukoo/db` (web imports `dist`)
- [ ] 2.4 Apply migration to LOCAL D1 only (`wrangler d1 execute --local`); remote deferred to manual `migrate-d1.yml`

## Task 3 — Rate limiter (`apps/web/src/lib/rate-limit.ts`)
- [ ] 3.1 Pure core: `LimiterStorage` interface, `RateLimitPolicy`, `RATE_LIMIT_POLICIES`, `checkRateLimit`, `recordFailure`, `recordSuccess` (injectable now)
- [ ] 3.2 D1 storage impl `d1LimiterStorage(getDb)` (upsert on key, window reset, lock)
- [ ] 3.3 Policy constants per spec table
- [ ] 3.4 Client IP helper (`getRequestIp()`) using `x-forwarded-for` / CF header, fallback `unknown`

## Task 4 — MailChannels dual-header + web mail lib
- [ ] 4.1 `apps/api/src/lib/mail.ts`: send both `X-Api-Key` and `X-Auth-Api-Key` headers
- [ ] 4.2 `apps/web/src/lib/mail.ts`: copy `sendEmail`/`sendOtpEmail` with dual-header pattern (env via process.env)

## Task 5 — OTP reset actions (`apps/web/src/app/(auth)/actions.ts`)
- [ ] 5.1 Add `requestPasswordReset(formData)` (validation → rate-limit → generic success → create OTP + fire-and-forget email)
- [ ] 5.2 Add `verifyPasswordReset(formData)` (rate-limit → code check → expiry → hash+update → cleanup → RESET_DONE)
- [ ] 5.3 Adjust `signIn`: pre-check lock, recordFailure/recordSuccess
- [ ] 5.4 Adjust `signUp`/`signUpPublisher`: per-IP register limiter
- [ ] 5.5 Adjust `signInWithGoogle`: per-IP login limiter
- [ ] 5.6 `apps/web/src/lib/auth.ts` `authorize()`: read-only block check → return null
- [ ] 5.7 Keep OTP code generation testable → `apps/web/src/lib/otp.ts` (`generateOtpCode`, `isOtpExpired`)

## Task 6 — Forgot-password UI + errors
- [ ] 6.1 `forgot-password/page.tsx`: two-step UI (`?step=code&email=`)
- [ ] 6.2 `errors.ts`: add `OTP_SENT`, `OTP_INVALID`, `OTP_EXPIRED`, `RATE_LIMITED`; keep RESET_DONE

## Task 7 — Docs/config
- [ ] 7.1 `AGENTS.md`: fix stale `/publisher/dashboard` middleware claim; document OTP flow + rate limits + new secrets
- [ ] 7.2 `.env.example` (root) + `apps/web/.dev.vars` mail vars
- [ ] 7.3 `task.md`: entries under this task group

## Task 8 — Tests
- [ ] 8.1 `apps/web/src/lib/rate-limit.test.ts` (fake clock + in-memory storage: window expiry, lock, success reset, policies, blocked retryAfter)
- [ ] 8.2 `apps/web/src/lib/otp.test.ts` (code format 6 digits, expiry boundary)

## Task 9 — Verify
- [ ] 9.1 `packages/db`: `npx tsc --noEmit` + `drizzle-kit check`
- [ ] 9.2 `apps/web`: `npx tsc --noEmit` + `npm run lint` + `npm run test`
- [ ] 9.3 `apps/api`: `npx tsc --noEmit` + lint + test (mail.ts change)
- [ ] 9.4 Manual `wrangler dev` QA checklist (OTP flow, lockout, direct POST blocked)
- [ ] 9.5 Deploy notes written (preview, secrets, migrate-d1 remote path)

## Task 10 — Bookkeeping
- [ ] 10.1 Ledger + `task.md` updated
- [ ] 10.2 Final: rotate MailChannels key (user action) — flag in summary

## Verification checklist (AGENTS.md)
- [ ] `packages/db`: typecheck ✅ build ✅ db:check ✅ (no tests in workspace — stated)
- [ ] `apps/web`: typecheck ✅ lint ✅ test ✅ (new rate-limit + otp tests)
- [ ] `apps/api`: typecheck ✅ lint ✅ test ✅ (existing suite still green)