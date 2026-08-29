# SDD Ledger — publisher-masuk-auto-login

**Spec:** `docs/superpowers/specs/2026-08-29-publisher-masuk-auto-login-design.md`
**Plan:** `docs/superpowers/plans/2026-08-29-publisher-masuk-auto-login.md`

- Task 1 (pure logout helpers): complete — `apps/web/src/lib/logout-cookies.ts`
  (`clearAuthCookieHeaders`, `logoutRedirectUrl`, `LOGOUT_COOKIE_NAMES`,
  `DEFAULT_LOGOUT_REDIRECT`).
- Task 2 (route handler): complete — `apps/web/src/app/api/logout/route.ts`
  GET+POST → hand-built 303 (`Location` sanitized via `logoutRedirectUrl`,
  `Cache-Control: no-store`, one `Set-Cookie: Max-Age=0` per auth cookie).
- Task 3 (publisher logout buttons): complete — `sidebar-client.tsx` +
  `topbar-client.tsx` navigate to `/api/logout` inside the existing
  `startSignOut` transition ("Keluar..." state kept); unused `signOut` imports
  removed.
- Task 4 (signOut action fallback): complete — `(auth)/actions.ts` `signOut`
  falls back to plain `redirect()` when `nextAuthSignOut` throws non-redirect.
- Task 5 (tests): complete — `logout-cookies.test.ts` (10 cases: cookie
  names/attrs/Secure variants, expiry, redirect sanitization incl. `//`,
  scheme, `\`, colon, empty → default).
- Task 6 (verification): complete — `tsc --noEmit` clean; eslint 0 errors
  (3 pre-existing warnings, none on new code); `vitest run` 37/37 (5 files).
  Note: fixed pre-existing compile break in uncommitted web-auth-hardening
  work (`ipHeaders()` — `headers()` is async in Next 16; 5 call sites now
  `await getRequestIp(await ipHeaders())`).
- Task 7 (bookkeeping): complete — plan checkboxes + root `task.md` entry.
- Remaining: deploy preview → prod; manual QA (Keluar → landing → Masuk →
  login form appears; customer/admin logout regression). Also consider
  checking off the long-pending "session cleared" QA item in
  `.superpowers/sdd/publisher-logout-fix/progress.md` after this deploy.
