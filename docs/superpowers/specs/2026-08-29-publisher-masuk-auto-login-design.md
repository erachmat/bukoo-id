# Design Spec — Publisher "Masuk" Auto-Login After Logout

**Date:** 2026-08-29
**Workspaces:** `apps/web`

## Executive summary

After a publisher clicks "Keluar" and lands on the public landing page
(`/publisher/daftar?logout=1`), clicking "Masuk" forwards them to
`/publisher/login?callbackUrl=/publisher/dashboard`, which immediately redirects
to the dashboard — no login prompt. Root cause: the session JWT cookie survives
logout because the `Set-Cookie` expiry headers emitted by the NextAuth
server-action 303 redirect are unreliable on Cloudflare Workers.

Fix: a dedicated `GET/POST /api/logout` route handler that builds the
`Set-Cookie: Max-Age=0` headers itself on its own 303 response (full header
control, no NextAuth internals, `Cache-Control: no-store`), and point the
publisher logout controls at it. The shared `signOut()` server action gains a
fallback so customer/admin logout never silently no-ops.

## Component specs

### 1. `apps/web/src/lib/logout-cookies.ts` (new, pure + testable)

- `clearAuthCookieHeaders(): string[]` — returns four `Set-Cookie` header
  strings expiring: `__Secure-authjs.session-token`, `__Secure-authjs.csrf-token`
  (with `Secure`), `authjs.session-token`, `authjs.csrf-token`. Common attrs:
  `Path=/; Max-Age=0; HttpOnly; SameSite=Lax`.
- `logoutRedirectUrl(rawRedirect: string | null, origin: string): string` —
  sanitizes a `redirectTo` param via `safeCallbackUrl` semantics (same-site
  relative path only) with fallback `/publisher/daftar?logout=1`, resolved
  against `origin` for the `Location` header.
- Also exported: `LOGOUT_COOKIE_NAMES` (for tests) and
  `DEFAULT_LOGOUT_REDIRECT = "/publisher/daftar?logout=1"`.

Rationale for a pure module: the route handler itself is a thin wrapper, and
vitest can cover the cookie/security logic without spinning a worker.

### 2. `apps/web/src/app/api/logout/route.ts` (new)

- Exports `GET` and `POST` (same behavior). `matcher` in `middleware.ts`
  already excludes `/api`, so the handler runs outside the middleware auth.
- Builds a 303 response: `Location: logoutRedirectUrl(...)`,
  `Cache-Control: no-store`, and one `Set-Cookie` per entry from
  `clearAuthCookieHeaders()`.
- Never reads or verifies the session — cookie expiry is unconditional, so it
  is safe for any role and cannot leak state.
- GET is acceptable because there is no server-side session state to revoke
  (JWT strategy — `auth.config.ts`); the only lever is the browser cookie.

### 3. `apps/web/src/app/publisher/sidebar-client.tsx` + `topbar-client.tsx`

- Replace `await signOut({ redirectTo: "/publisher/daftar?logout=1" })` (server
  action via transition) with `window.location.assign("/api/logout")`.
- Keep the disabled/"Keluar..." in-flight state during the transition; use
  `startSignOut` transition as-is but navigate inside it (no awaiting a server
  action).

### 4. `apps/web/src/app/(auth)/actions.ts` — `signOut()` hardening

- Wrap the existing cookie-expiry + `nextAuthSignOut` block so that if
  `nextAuthSignOut` throws anything other than the NextAuth redirect error,
  we still perform a plain `redirect(options?.redirectTo ?? "/")`. The action
  must never silently no-op on Workers.
- No behavior change on the happy path; customer/admin logout flows untouched
  otherwise (regression-checked only).

## Layout / styling tokens

None — no visual changes. Buttons keep existing classes and "Keluar..." state.

## Security considerations

- `redirectTo` is sanitized (no open redirect): only same-site relative paths
  accepted; anything else falls back to the default landing redirect.
- Unconditional cookie expiry cannot be exploited; the route is CSRF-safe
  because it only clears cookies and redirects.
- `?logout=1` landing bypass remains forgeable-but-cosmetic (unchanged from
  2026-08-27 design).

## Verification plan

1. Unit tests (vitest): `clearAuthCookieHeaders` names/attrs/Secure variants;
   `logoutRedirectUrl` sanitization (rejects `//evil.com`, `https:`, `\`,
   empty → default; accepts `/publisher/daftar?logout=1`).
2. `npx tsc --noEmit` in `apps/web` — clean.
3. `npx eslint` on touched files — 0 errors.
4. `npx vitest run` in `apps/web` — existing 27+ tests plus new ones green.
5. Manual QA (post-deploy): login → Keluar → landing → Masuk → login form
   appears (not dashboard). Regression: customer + admin logout, account page
   sign-out.
