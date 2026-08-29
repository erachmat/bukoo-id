# Design Spec — Web Auth Hardening: OTP Password Reset + D1 Rate Limiting — 2026-08-29

## Executive summary

Two critical auth gaps on the web app (`bukoo.id` / `publisher.bukoo.id`,
NextAuth v5 on Cloudflare Workers):

1. **Unauthenticated password reset = account takeover.** The web
   `resetPassword` server action accepts any email + new password and updates
   the password with **zero verification** (no email, no OTP, no token).
   Anyone who knows a registered email can hijack the account. The mobile API
   already has a correct 6-digit-OTP flow (`apps/api/src/routes/auth.ts` +
   `otp_tokens`); the web does not.
2. **No rate limiting / lockout anywhere.** Login, register, Google sign-in
   and password reset are unbounded — brute-force / credential-stuffing is
   wide open.

This spec fixes both: the web forgot-password flow becomes a two-step
OTP flow (email → 6-digit code → set new password) mirroring the API, and
all auth actions are protected by D1-backed attempt counters + lockout that
also work in local dev (no Cloudflare Rate Limiting binding dependency).

**Out of scope** (user-approved): Google `email_verified` account-linking
hardening, signup email verification, JWT revocation (JWT-only sessions),
`CONTENT_MANAGER` role support, Turnstile CAPTCHA.

## Component spec

### 1. `packages/db/src/schema.ts` — new `authAttempts` table

```ts
export const authAttempts = sqliteTable('auth_attempts', {
  id:          text('id').primaryKey(),            // cuid2 (createId)
  key:         text('key').notNull().unique(),     // e.g. 'login:email:user@x' | 'login:ip:1.2.3.4'
  attempts:    integer('attempts').notNull().default(0),
  windowStart: integer('window_start').notNull(),   // Unix ms — start of current attempt window
  lockedUntil: integer('locked_until'),            // Unix ms — non-null while locked
  updatedAt:   text('updated_at').notNull().default(now()),
});
```

Key format convention: `<policy>:<scope>:<identifier>` where policy ∈
`login-email | login-ip | register-ip | otp-request-email | otp-request-ip |
otp-verify-email` and identifier is the lowercased email or hashed IP.

> **D1 migration:** one new migration (`auth_attempts`). Remote apply ONLY
> via the manual `migrate-d1.yml` workflow (AGENTS.md hard rule #1); local
> dev via `wrangler d1 execute --local --file=...`.

### 2. `apps/web/src/lib/rate-limit.ts` — D1-backed limiter (pure + testable)

Interface (injectable clock & storage for unit tests):

```ts
export interface LimiterStorage {
  get(key: string): Promise<AuthAttemptRow | undefined>;
  write(key: string, row: AuthAttemptRow): Promise<void>;
}
export interface RateLimitPolicy {
  maxAttempts: number;      // failures allowed per window
  windowMs: number;         // sliding/rolling window
  lockMs: number;           // lockout duration once maxAttempts exceeded
}
export const RATE_LIMIT_POLICIES = { loginEmail, loginIp, registerIp, otpRequestEmail, otpRequestIp, otpVerifyEmail } as const;
export function checkRateLimit(storage, now, policy, key): Promise<{ allowed: boolean; retryAfterMs: number }>;
export function recordFailure(storage, now, policy, key): Promise<void>;
export function recordSuccess(storage, now, key): Promise<void>;
```

**D1 implementation** lives in the same file (`d1LimiterStorage(getDb)`).
Window reset: if `now - windowStart > windowMs`, reset `attempts`/`windowStart`
before incrementing. Lock: once `attempts >= maxAttempts`, set `lockedUntil =
now + lockMs` and reject further attempts until it passes.

Policies (defaults, tunable):
| policy | key | maxAttempts | window | lock |
|---|---|---|---|---|
| loginEmail | `login:email:{email}` | 5 | 15 min | 15 min |
| loginIp | `login:ip:{ip}` | 10 | 15 min | 1 h |
| registerIp | `register:ip:{ip}` | 5 | 1 h | 1 h |
| otpRequestEmail | `otp_request:email:{email}` | 3 | 15 min | 15 min |
| otpRequestIp | `otp_request:ip:{ip}` | 5 | 1 h | 1 h |
| otpVerifyEmail | `otp_verify:email:{email}` | 5 | 15 min | 15 min |

### 3. `apps/web/src/lib/mail.ts` — MailChannels (mirrors API, dual header)

Copy of `apps/api/src/lib/mail.ts` (`sendEmail` + `sendOtpEmail`,
`https://api.mailchannels.net/tx/v1/send`) with the **dual auth header fix**:

```ts
if (env.MAILCHANNELS_API_KEY) {
  headers['X-Api-Key'] = env.MAILCHANNELS_API_KEY;           // current MailChannels docs
  headers['X-Auth-Api-Key'] = env.MAILCHANNELS_API_KEY;      // legacy (2023 CF tutorial)
}
```

Also fixes `apps/api/src/lib/mail.ts` to send both headers for backward
compatibility with new-account keys. Sender default `noreply@bukoo.id`.

### 4. `apps/web/src/app/(auth)/actions.ts` — replace `resetPassword`

**`requestPasswordReset(formData)`** (step 1):
- Validate email format → redirect `?error=EMAIL_INVALID`.
- Rate-limit `otpRequestEmail` + `otpRequestIp`: blocked → `?error=RATE_LIMITED`.
- **Always** redirect `?step=code&email={email}&message=OTP_SENT` (generic,
  anti-enumeration).
- If a user with that email exists: delete existing `otp_tokens` row for the
  email, insert new `{ id: createId(), email, code: 6-digit, expiresAt: now+15min }`,
  fire-and-forget `sendOtpEmail` (catch + `console.error`, never block the
  response).

**`verifyPasswordReset(formData)`** (step 2):
- Validate password ≥ 6 → `?error=PASSWORD_TOO_SHORT`.
- Rate-limit `otpVerifyEmail`: blocked → `?error=RATE_LIMITED`.
- Look up `otp_tokens` by email: missing/wrong code → count failure →
  `?error=OTP_INVALID`; expired → delete row → `?error=OTP_EXPIRED`.
- `hashPassword(newPassword)` → update `users.password` → delete OTP row →
  redirect `/login?message=RESET_DONE`.

### 5. `apps/web/src/app/(auth)/forgot-password/page.tsx` — two-step UI

- **Step 1** (`?step=` absent): email input → `requestPasswordReset`. Keep
  server-component + `SubmitButton`/`PasswordInput` patterns.
- **Step 2** (`?step=code&email=...`): hidden email, OTP code input + new
  password (`PasswordInput`) → `verifyPasswordReset`. Shows the generic
  `OTP_SENT` info banner ("Jika email terdaftar, kode verifikasi telah dikirim.").

### 6. `apps/web/src/app/(auth)/errors.ts` — new keys

Add: `OTP_SENT` (info), `OTP_INVALID`, `OTP_EXPIRED`, `RATE_LIMITED`
(Indonesian). Keep `RESET_DONE`, `PASSWORD_TOO_SHORT`, `EMAIL_INVALID`.
`RESET_FAILED` retired from the new flow.

### 7. Login/register lockout (Phase 3)

- `apps/web/src/app/(auth)/actions.ts` `signIn`: pre-check lock
  (`loginEmail`+`loginIp`) → blocked `?error=RATE_LIMITED`; on
  `CredentialsSignin` → `recordFailure` for email + IP → existing error
  redirects; on success → `recordSuccess(email)`.
- `apps/web/src/lib/auth.ts` `authorize()`: read-only block check
  (`isBlocked` for `loginEmail`) → return `null` early. Defense-in-depth for
  direct POSTs to `/api/auth/callback/credentials`; **no increments** (avoids
  double-counting with the action).
- `signUp`/`signUpPublisher`: `registerIp` counting + block check.
- `signInWithGoogle`: `loginIp` counting + block check.

### 8. Docs & config

- `AGENTS.md`: fix stale claim that `/publisher/dashboard` is
  middleware-gated (it's a public showcase page that conditionally renders
  `DashboardClient`); document the OTP reset flow, rate-limit policies, and
  the two new worker secrets (`MAILCHANNELS_API_KEY`, `MAIL_FROM`).
- `apps/web/.env.example` (root) + `apps/web/.dev.vars`: document optional
  mail vars (mail gracefully skips when unset).
- Root `task.md`: add this task group with checklists.

## Layout / styling tokens

N/A — no new visual language. The forgot-password page reuses existing
`auth-label` / `auth-input` / `price-cta-btn` classes and
`SubmitButton`/`PasswordInput` components.

## Verification plan

1. `packages/db`: `npx tsc --noEmit` + `drizzle-kit check` clean + migration
   SQL inspected.
2. `apps/web`: `npx tsc --noEmit` + `npm run lint` + `npm run test`
   (new `rate-limit.test.ts`, `otp.test.ts`, existing tests).
3. Manual `wrangler dev`: full OTP happy path (with real key in `.dev.vars`),
   wrong/expired code, generic response for unknown email, 6 failed logins →
   `RATE_LIMITED`, lock persists across requests (D1-backed), direct POST to
   `/api/auth/callback/credentials` while locked → blocked.
4. Deploy notes: preview worker + `wrangler secret put` (web + api) +
   migration via `migrate-d1.yml`; prod deploy + smoke test.

## Out of scope

- Google `email_verified` linking hardening, signup email verification.
- JWT revocation / DB sessions (JWT-only by design).
- `CONTENT_MANAGER` role support, Turnstile.
- Changing mobile/API auth.