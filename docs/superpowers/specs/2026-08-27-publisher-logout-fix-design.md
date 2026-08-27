# Design Spec — Publisher Logout Lands on Landing Page

**Date:** 2026-08-27
**Status:** Approved (user: "Start implementation")
**Related:** `docs/superpowers/plans/2026-08-27-publisher-logout-fix.md`

## Executive Summary

Logging out from the publisher dashboard (`publisher.bukoo.id`) redirects back to
`/publisher/dashboard` instead of the landing page `/publisher/daftar`.

Root cause: the sign-out server action redirects to `/publisher/daftar`, but
middleware bounces any request to `/publisher/daftar` that still carries a valid
`PUBLISHER` JWT back to the dashboard. JWT session-cookie clearing is flaky on
Cloudflare Workers (documented in `AGENTS.md`), so the bounce fires before the
user reaches the landing page.

Fix (both, per user decision):
1. **Middleware marker exception** — sign out to `/publisher/daftar?logout=1`;
   middleware skips the logged-in-publisher bounce for that marker. Guarantees
   the landing page regardless of cookie-clearing timing.
2. **Harden cookie clearing** — the `signOut` action explicitly expires the
   NextAuth JWT session/CSRF cookies so logout truly logs the user out.

## Component Specs

### `apps/web/src/lib/publisher-landing-guard.ts` (new)
Pure, testable decision helper used by middleware:

```ts
shouldBouncePublisherFromLanding({ isPublisherHost, userRole, pathname, isLogoutLanding }): boolean
```

- Returns `false` on non-publisher hosts.
- Returns `false` when `pathname === "/publisher/daftar"` and `isLogoutLanding` (sign-out marker).
- Otherwise returns `true` only for `userRole === "PUBLISHER"` on `/`, `/daftar`, `/publisher/daftar`.

### `apps/web/src/middleware.ts`
Replace the inline bounce condition (former L39-41) with a call to the helper.
Compute `isLogoutLanding = pathname === "/publisher/daftar" && searchParams.get("logout") === "1"`.

### `apps/web/src/app/(auth)/actions.ts` — `signOut`
Before `nextAuthSignOut` (which throws the redirect), explicitly expire cookies
via `cookies()` from `next/headers`:
- `__Secure-authjs.session-token`, `__Secure-authjs.csrf-token` → `secure: true`
- `authjs.session-token`, `authjs.csrf-token` → `secure: false`

A bare `delete()` omits the `Secure` attribute, so browsers reject clearing a
`__Secure-`-prefixed cookie — use `set(name, "", { maxAge: 0, ... })` instead.

### `apps/web/src/app/publisher/{sidebar-client,topbar-client}.tsx`
Change `redirectTo: "/publisher/daftar"` → `"/publisher/daftar?logout=1"`.

### `apps/web/src/app/publisher/daftar/LogoutMarkerCleanup.tsx` (new) + `page.tsx`
Tiny client component that strips `?logout=1` from the address bar via
`history.replaceState` once the landing page renders.

## Layout / Styling Tokens
None — no UI changes. Behavior/redirect-only fix.

## Security Notes
- `?logout=1` is forgeable by a client, but it only bypasses a cosmetic UX rule
  (signed-in publishers are sent away from a public landing page). No security impact.

## Verification Plan
1. `npx tsc --noEmit` in `apps/web` — clean.
2. `npx eslint` on touched files — 0 errors (pre-existing warnings unchanged).
3. `npx vitest run` — all pass, including new `publisher-landing-guard.test.ts`.
4. Manual on real `publisher.bukoo.id` after deploy: publisher logout →
   `/publisher/daftar`, session cleared, address bar clean.
   (Local/preview hosts don't match `isPublisherHost`, so the exact symptom is
   only reproducible on the real publisher host or via Host-header spoofing.)
5. Regression: customer/admin logout unaffected.
