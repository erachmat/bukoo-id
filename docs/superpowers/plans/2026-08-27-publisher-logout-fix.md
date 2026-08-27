# Implementation Plan — Publisher Logout Lands on Landing Page

superpowers:subagent-driven-development

**Date:** 2026-08-27
**Depends on:** Design spec `docs/superpowers/specs/2026-08-27-publisher-logout-fix-design.md`

## Phase 1 — Artifacts
- [x] Design spec written (`docs/superpowers/specs/2026-08-27-publisher-logout-fix-design.md`)
- [x] This plan + SDD ledger created (`.superpowers/sdd/publisher-logout-fix/progress.md`)
- [x] Root `task.md` updated with a new task entry

## Phase 2 — Middleware marker exception (guaranteed landing page)
- [x] `apps/web/src/app/publisher/sidebar-client.tsx` + `topbar-client.tsx`:
      `redirectTo: "/publisher/daftar"` → `"/publisher/daftar?logout=1"`
- [x] New `apps/web/src/lib/publisher-landing-guard.ts` — pure
      `shouldBouncePublisherFromLanding()` (extracts the former inline condition,
      adds the `logout` marker bypass)
- [x] `apps/web/src/middleware.ts`: import the helper; replace the inline
      publisher-landing bounce with `shouldBouncePublisherFromLanding(...)` using
      `isLogoutLanding = pathname === "/publisher/daftar" && searchParams.get("logout") === "1"`
- [x] New `apps/web/src/app/publisher/daftar/LogoutMarkerCleanup.tsx` (client) +
      render in `page.tsx` — strips `?logout=1` from the address bar

## Phase 3 — Harden cookie clearing (root cause)
- [x] `apps/web/src/app/(auth)/actions.ts` `signOut`: import `cookies` from
      `next/headers`; BEFORE `nextAuthSignOut(...)`, expire
      `__Secure-authjs.session-token`, `__Secure-authjs.csrf-token` (secure) and
      `authjs.session-token`, `authjs.csrf-token` (non-secure) via
      `cookieStore.set(name, "", { path: "/", maxAge: 0, httpOnly: true, secure, sameSite: "lax" })`

## Phase 4 — Tests
- [x] New `apps/web/src/lib/publisher-landing-guard.test.ts` (7 cases): marker
      bypass, role/host/path scoping, unauthenticated, non-publisher pages

## Phase 5 — Verification
- [x] `npx tsc --noEmit` in `apps/web` — clean
- [x] `npx eslint` on all touched files — 0 errors (3 pre-existing warnings)
- [x] `npx vitest run` in `apps/web` — 27 tests pass (incl. 7 new)
- [ ] Manual QA on real `publisher.bukoo.id` post-deploy: logout → `/publisher/daftar`,
      session cleared, clean address bar
- [ ] Regression: customer/admin logout unaffected
