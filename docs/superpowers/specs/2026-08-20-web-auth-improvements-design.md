# Design Spec — Web Auth Overhaul: login/register/Google for bukoo.id + publisher.bukoo.id — 2026-08-20

## Executive summary

The web auth surface (NextAuth v5, DrizzleAdapter → Cloudflare D1, one `bukoo-web`
worker serving both `bukoo.id` and `publisher.bukoo.id`) has a real **logout bug**,
UX gaps, and security gaps:

1. **Logout doesn't fully sign the user out** (user-reported): after logging in with
   Google and logging out, the dashboard is still reachable without re-login. Two
   candidate root causes, both addressed:
   - All sign-out is **client-side** `signOut({ callbackUrl: '/' })` from
     `next-auth/react` (`Navbar.tsx`, `account-sign-out.tsx`, `admin-sidebar.tsx`,
     `publisher/sidebar-client.tsx`) — unreliable at clearing the JWT session cookie
     on Cloudflare Workers. Fix: use the server-action `signOut()` from
     `(auth)/actions.ts` (clears cookie server-side).
   - **`/publisher/dashboard` and `/publisher/submit` are NOT protected** — the
     `(protected)` route group only wraps `books/` (a stale comment in
     `(protected)/layout.tsx` claims otherwise). A logged-out user can open the
     illustrative dashboard. Fix: middleware PUBLISHER gate on both paths.
2. **UX gaps on shared login/register** (`bukoo.id`): ignored `callbackUrl` (reader
   deep-links lost), Google button has no pending/disabled state (double-submit),
   inconsistent raw error strings, no server-side validation, confusing
   passwordless-account copy (task.md follow-up item 6).
3. **Security gaps**: email enumeration on register ("Email ini sudah terdaftar") and
   forgot-password ("Email tidak ditemukan"); `allowDangerousEmailAccountLinking`
   kept per product intent (auto-link) — documented as a decision.
4. **Publisher** (`publisher.bukoo.id`) has **no dedicated auth**: publishers reuse
   customer pages and there is no self-serve signup (role=PUBLISHER only assignable
   by admin). Fix: dedicated `/publisher/login` + `/publisher/register` with
   publisher branding and a real self-serve signup that creates the account with
   **Immediate PUBLISHER role** (user decision).

Scope decisions (user-approved 2026-08-20): shared fixes **+** dedicated publisher
auth; UX + security fixes only (**no rate limiting**, **no email-based password
reset**); `/publisher/daftar` application form stays illustrative (out of scope).

No D1 migration is required: `users.role` already supports `'PUBLISHER'`, and the
`accounts.id`/`sessions.id` `$defaultFn` fix (2026-08-20, commit `12460dc`) is live.

## Root cause / context (verified)

- Logout: all 4 sign-out call sites use `next-auth/react` client `signOut`; the JWT
  session cookie (`authjs.session-token` / `__Secure-authjs.session-token`) can
  survive on Workers. Separately, `/publisher/dashboard` + `/publisher/submit` live
  OUTSIDE the `(protected)` group → public. Both contribute to "dashboard still
  reachable after logout".
- Login/register actions hardcode `redirectTo: '/library'` and never read
  `callbackUrl`, so `book/[id]/read` deep-link (`/login?callbackUrl=/book/{id}/read`)
  is lost.
- Register/password validation (`minLength=6`, name required) is client-only.
- Duplicate-email + forgot-password responses confirm account existence (enumeration).
- `resetPassword` overwrites a password with **no email confirmation** — a known
  account-takeover vector. **Out of scope by user decision** (flagged in
  Further Considerations; requires email sending infra).
- Publisher pages render customer-branded auth; no publisher-specific Google
  callback URI authorization is verified for `publisher.bukoo.id` (ops step — the
  Google Cloud Console must authorize `https://publisher.bukoo.id/api/auth/callback/google`).

## Component spec

### Phase 1 — Logout/session bug (fix-first)

**1.1 `apps/web/src/app/(auth)/actions.ts` — server `signOut` is already present**
(`nextAuthSignOut({ redirectTo: '/' })`). Keep it; it is the target for all
client call sites.

**1.2 Consolidate client sign-out → server action.** In these client components,
replace `import { signOut } from 'next-auth/react'` with the server action
`import { signOut } from '@/app/(auth)/actions'` (server actions are callable from
client components):
- `apps/web/src/app/(marketing)/Navbar.tsx` (`handleSignOut`)
- `apps/web/src/app/(app)/account/account-sign-out.tsx`
- `apps/web/src/app/admin/_components/admin-sidebar.tsx`
- `apps/web/src/app/publisher/sidebar-client.tsx`

`signOut` server action redirects to `/` (middleware maps PUBLISHER → dashboard).

**1.3 Gate `/publisher/dashboard` + `/publisher/submit` in
`apps/web/src/middleware.ts`.** Both require `user.role === "PUBLISHER"`; else
redirect to `/login` (publisher host) or `/publisher/login` (main host) with
`?callbackUrl=<path>`. Keep URLs identical (no route moves).

**1.4 Fix stale comment** in `apps/web/src/app/publisher/(protected)/layout.tsx`
(the group wraps `books/` only).

### Phase 2 — Shared auth UX + security (both domains)

**2.1 Shared error catalog `apps/web/src/app/(auth)/errors.ts`.** Single
`ERROR_MESSAGES` map with keys for OAuth codes (`OAuthAccountNotLinked`,
`OAuthSignin`, `OAuthCallback`, `OAuthCreateAccount`, `CredentialsSignin`,
`AccessDenied`, `SessionRequired`) plus action codes (`NAME_REQUIRED`,
`EMAIL_INVALID`, `PASSWORD_TOO_SHORT`, `EMAIL_TAKEN`, `RESET_FAILED`,
`RESET_DONE`, `PASSWORDLESS`). Pages map key → Indonesian copy; unknown keys
fall through as raw strings.

**2.2 `callbackUrl` support.**
- `safeCallbackUrl(raw, fallback)`: must start with `/`, not `//`, no `\` or `:`;
  else fallback. Used in actions (server-side, authoritative).
- Login page reads `searchParams.callbackUrl` → hidden input on both forms.
- `signIn` / `signInWithGoogle` / `signUp` accept it as `redirectTo`.
- Middleware appends `?callbackUrl=${pathname}` to protected-route redirects.

**2.3 Role-aware post-login default.** `defaultRedirectForRole(role)` helper:
USER→`/library`, PUBLISHER→`/publisher/dashboard`, ADMIN→`/admin`. Used by
`signIn` (queries user role before sign-in — cheap, login is not hot) and
`signUp`/`signUpPublisher`. Explicit `callbackUrl` always wins. Google keeps
`/library` default (role hop already handled by middleware).

**2.4 Google button pending state.** New client component
`apps/web/src/components/auth/google-button.tsx` using `useFormStatus` (must be a
direct child of the `<form action={signInWithGoogle}>`), `disabled` while pending,
"Memproses…" label + dimmed style. Replaces the plain button in login + register
pages.

**2.5 Server-side validation** in `signUp` (name non-empty, email format,
password ≥ 6) and `resetPassword` (password ≥ 6), redirecting with mapped codes.

**2.6 Anti-enumeration.** Register duplicate → `EMAIL_TAKEN` ("Akun dengan email
ini sudah terdaftar. Silakan masuk."). Forgot-password missing email →
`RESET_FAILED` (generic). Login stays generic "Email atau password salah".

**2.7 Passwordless-account copy** (task.md item 6). In `signIn`'s
`CredentialsSignin` branch, query the user; if `password` is null → `PASSWORDLESS`
("Akun ini terdaftar dengan Google. Silakan masuk menggunakan Google."). Improve
`OAuthAccountNotLinked` copy to a clear "method mismatch" message.

**2.8 `allowDangerousEmailAccountLinking: true` KEPT** (auto-link is product
intent). Recorded as a decision; future hardening (password confirmation before
link) is out of scope.

### Phase 3 — Dedicated publisher auth (`publisher.bukoo.id`)

**3.1 Shared form components** (server components, parameterized copy/links):
- `apps/web/src/components/auth/login-form.tsx` — props `{ error?, message?,
  callbackUrl?, registerHref }`; renders credentials form + Google form +
  banners + register link.
- `apps/web/src/components/auth/register-form.tsx` — props `{ error?, success?,
  email?, callbackUrl?, loginHref, brand: 'customer'|'publisher' }`; renders
  name/email/password + Google + terms links + login link.
Both use existing `auth-label`/`auth-input`/`price-cta-*` classes (customer) or
`pub-fg`/`form-card`/`btn-cta` (publisher) via a small `className`/wrapper prop.

**3.2 Pages.**
- `apps/web/src/app/(auth)/login/page.tsx` + `register/page.tsx` → render shared
  forms with customer branding (behavior preserved + new callbackUrl/error codes).
- NEW `apps/web/src/app/publisher/login/page.tsx` + `register/page.tsx` — publisher
  branding (form-card on forest background, amber accents), default redirect
  `/publisher/dashboard`, Google hidden callbackUrl `/publisher/dashboard`.
  Public (NOT under `(protected)`).

**3.3 `signUpPublisher` action** (in `(auth)/actions.ts` or a publisher action
file): same validation as `signUp`, insert with `role: 'PUBLISHER'` (Immediate
PUBLISHER), auto sign-in → `/publisher/dashboard`; duplicate → `EMAIL_TAKEN`.

**3.4 Middleware** (`apps/web/src/middleware.ts`):
- Publisher host: `/login` → `/publisher/login`, `/register` →
  `/publisher/register` (preserve `?callbackUrl=`).
- Signed-in PUBLISHER on `/publisher/login` or `/publisher/register` →
  `/publisher/dashboard`.

**3.5 Google on publisher domain**: same provider/action; ops prerequisite —
authorize `https://publisher.bukoo.id/api/auth/callback/google` in Google Cloud
Console (manual step, cannot be done in code).

## Layout / styling tokens

- Customer auth: existing `(auth)/layout.tsx` + `redesign.css` classes
  (`.auth-label`, `.auth-input`, `.auth-btn-social`, `.price-cta-btn`).
- Publisher auth: `publisher.css` — `.form-card` (amber-tinted card), `.pub-fg`
  (field + label + focus `--amber`), `.btn-cta` (amber button), `--amber`/
  `--forest-dd` tokens; page centered card on `var(--forest-dd)` background with
  "BUKOO · Publisher Portal" wordmark. Small CSS additions (auth error banner,
  google button) appended to `publisher.css` if the existing classes are
  insufficient.

## Verification plan

1. Repro the logout bug FIRST (`wrangler dev` + prod): Google login → logout →
   confirm `/library` + `/publisher/dashboard` now require login and the session
   cookie is cleared.
2. `npm run typecheck --workspace=web` + `npm run lint --workspace=web` — 0
   errors (web has **no test script** — stated explicitly).
3. `packages/db` untouched — no migration, no schema change.
4. Greps: 0 remaining `next-auth/react` `signOut` imports; 0 hardcoded
   `redirectTo: '/library'` in actions; `/publisher/dashboard` + `/publisher/submit`
   gated in middleware.
5. Manual QA (dev + prod, both domains): credentials + Google login/register on
   `bukoo.id`; publisher-branded `/publisher/login` `/publisher/register` on
   `publisher.bukoo.id`; self-register → immediate dashboard → create a book;
   reader deep-link `?callbackUrl=/book/{id}/read` returns correctly; passwordless
   error copy; Google on publisher domain (after Google Console redirect-URI is
   authorized).
6. Deploy `npm run deploy:prod` from `apps/web` → smoke `https://bukoo.id`,
   `https://publisher.bukoo.id`, `/api/auth/session` → 200.

## Out of scope

- Rate limiting (login/register brute-force) — deferred (user decision).
- Email-based password reset (fixes the no-confirmation reset vector) — deferred
  (user decision; needs MAILCHANNELS email sending).
- `/publisher/daftar` application persistence — stays illustrative.
- Password-confirmation before Google↔email linking.
- AUTH_SECRET rotation (pre-existing open item).
