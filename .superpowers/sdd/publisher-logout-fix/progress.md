# SDD Ledger — publisher-logout-fix

- Task 1 (topbar logout): complete — `<form action>` wrapper removed in
  `apps/web/src/app/publisher/topbar-client.tsx`; direct `onClick` →
  `signOut({ redirectTo: "/publisher/daftar" })`.
- Task 2 (sidebar logout): complete — same fix in
  `apps/web/src/app/publisher/sidebar-client.tsx` footer button.
- Task 3 (verification): complete — web typecheck ✅; lint **0 errors** (26 pre-existing
  warnings, none on changed lines) ✅; tests: `apps/web` has **no test script** (stated);
  greps: `<form action={async` / `redirectTo: "/publisher/login"` → 0 hits in publisher files ✅.
- Task 4 (bookkeeping): complete — plan checkboxes + root `task.md` updated.
- Deploy: complete — `npm run deploy:prod` → worker version `21b5555c-dc84-4cac-bd4d-fb9cc00719e3`
  live on bukoo.id + publisher.bukoo.id (2026-08-26). Smoke: `/`, `/publisher/login`,
  `/publisher/daftar`, `/api/auth/session` → 200; unauthed dashboard renders public showcase.
- Remaining: manual smoke QA (login → Keluar → `/publisher/daftar`, session cleared).

---

## Follow-up — 2026-08-27: Logout still landed on `/publisher/dashboard` instead of the landing page

**Spec:** `docs/superpowers/specs/2026-08-27-publisher-logout-fix-design.md`
**Plan:** `docs/superpowers/plans/2026-08-27-publisher-logout-fix.md`

- Task A (middleware marker exception): complete — both sign-out controls now
  redirect to `/publisher/daftar?logout=1`; new pure helper
  `apps/web/src/lib/publisher-landing-guard.ts` (`shouldBouncePublisherFromLanding`)
  wired into `middleware.ts` so the sign-out marker bypasses the
  logged-in-publisher bounce; `apps/web/src/app/publisher/daftar/LogoutMarkerCleanup.tsx`
  strips the marker from the address bar.
- Task B (cookie hardening): complete — `(auth)/actions.ts` `signOut` explicitly
  expires `__Secure-authjs.session-token` / `authjs.session-token` (+ CSRF
  variants) before the NextAuth redirect (JWT cookie clearing is flaky on
  Workers per AGENTS.md).
- Task C (verification): code-level complete — web typecheck ✅; web lint 0 errors
  (3 pre-existing warnings) ✅; web tests 27/27 ✅ (incl. new
  `publisher-landing-guard.test.ts`, 7 cases).
- Remaining: manual publisher-host QA on `publisher.bukoo.id` post-deploy
  (logout → `/publisher/daftar`, session cleared, clean address bar); regression
  on customer/admin logout.
