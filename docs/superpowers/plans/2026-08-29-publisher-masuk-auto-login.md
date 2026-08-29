# Implementation Plan — Publisher "Masuk" Auto-Login After Logout

superpowers:subagent-driven-development

**Date:** 2026-08-29
**Depends on:** Design spec `docs/superpowers/specs/2026-08-29-publisher-masuk-auto-login-design.md`
**Workspaces touched:** `apps/web`

## Task 1 — Pure logout helpers
- [x] New `apps/web/src/lib/logout-cookies.ts`:
      `clearAuthCookieHeaders(): string[]` (4 cookies, `Path=/; Max-Age=0;
      HttpOnly; SameSite=Lax`, `Secure` on `__Secure-` variants),
      `logoutRedirectUrl(raw, origin)` (safeCallbackUrl semantics, default
      `/publisher/daftar?logout=1`), exported `LOGOUT_COOKIE_NAMES`,
      `DEFAULT_LOGOUT_REDIRECT`.

## Task 2 — Route handler
- [x] New `apps/web/src/app/api/logout/route.ts`: `GET` + `POST` → 303 with
      `Location: logoutRedirectUrl(searchParams.redirectTo, origin)`,
      `Cache-Control: no-store`, one `Set-Cookie` per
      `clearAuthCookieHeaders()` entry.

## Task 3 — Publisher logout buttons
- [x] `apps/web/src/app/publisher/sidebar-client.tsx`: replace
      `await signOut({ redirectTo: ... })` with
      `window.location.assign("/api/logout")` inside the existing
      `startSignOut` transition; keep "Keluar..." state; remove unused import.
- [x] `apps/web/src/app/publisher/topbar-client.tsx`: same replacement.

## Task 4 — signOut action fallback
- [x] `apps/web/src/app/(auth)/actions.ts` `signOut()`: wrap
      `nextAuthSignOut` so a non-redirect failure still performs
      `redirect(options?.redirectTo ?? "/")` — never silently no-op on Workers.
- [x] Incidental (pre-existing uncommitted web-auth-hardening code did not
      compile): `ipHeaders()` now awaits `headers()` (async in Next 16) and
      its 5 call sites use `await getRequestIp(await ipHeaders())`.

## Task 5 — Tests
- [x] New `apps/web/src/lib/logout-cookies.test.ts`: cookie names/attrs/Secure
      variants; redirect sanitization (`//evil.com`, `https:`/scheme, `\`,
      colon, empty → default; valid relative paths pass).

## Task 6 — Verification
- [x] `npm run typecheck --workspace=apps/web` → clean (`npx tsc --noEmit`)
- [x] `npx eslint` on touched files → 0 errors (3 pre-existing warnings)
- [x] `npx vitest run` → 37/37 pass (5 files, incl. 10 new logout tests)
- [ ] Manual QA post-deploy: Keluar → landing → Masuk → login form appears;
      customer/admin logout regression.

## Task 7 — Bookkeeping
- [x] SDD ledger `.superpowers/sdd/publisher-masuk-auto-login/progress.md`
- [x] Root `task.md` entry
