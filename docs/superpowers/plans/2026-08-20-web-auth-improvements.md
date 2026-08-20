---
workflow: superpowers:subagent-driven-development
---

# Implementation Plan — Web Auth Overhaul: login/register/Google — 2026-08-20

Spec: `docs/superpowers/specs/2026-08-20-web-auth-improvements-design.md` (user-approved via "Start implementation")
Ledger: `.superpowers/sdd/web-auth-improvements/progress.md`
Scope: `apps/web` only (no DB migration). Deploy: `npm run deploy:prod` from `apps/web`.

## Task 1 — SDD artifacts
- [x] 1.1 Design spec written
- [x] 1.2 Plan written + ledger created
- [x] 1.3 `task.md` updated with this task group

## Task 2 — Phase 1: logout/session bug (fix-first)
- [x] 2.1 Reproduce: dev repro + prod repro checklist for "logout → dashboard still reachable" (cookie + protected routes)
- [x] 2.2 `(auth)/actions.ts`: confirm server `signOut()` (already present) works; no change unless bug found
- [x] 2.3 Replace `next-auth/react` client `signOut` with server action in 4 components:
      `(marketing)/Navbar.tsx`, `(app)/account/account-sign-out.tsx`,
      `admin/_components/admin-sidebar.tsx`, `publisher/sidebar-client.tsx`
- [x] 2.4 `middleware.ts`: gate `/publisher/dashboard` + `/publisher/submit` (PUBLISHER required → `/login` or `/publisher/login` + callbackUrl)
- [x] 2.5 `publisher/(protected)/layout.tsx`: fix stale comment (group wraps `books/` only)
- [x] 2.6 Verify logout bug fixed (cookie cleared; protected routes require login) — local worker smoke: unauthed `/publisher/dashboard` → 307 `/login?callbackUrl=...`

## Task 3 — Phase 2: shared auth UX + security
- [x] 3.1 New `(auth)/errors.ts` shared ERROR_MESSAGES catalog (OAuth + action codes)
- [x] 3.2 `safeCallbackUrl()` helper + role-aware `defaultRedirectForRole()` helper (moved to `src/lib/auth-helpers.ts` — sync helpers can't live in a 'use server' file)
- [x] 3.3 `(auth)/actions.ts`: `signIn` — callbackUrl + role-aware redirect + PASSWORDLESS branch; `signInWithGoogle` — accepts callbackUrl; `signUp` — callbackUrl + server-side validation + EMAIL_TAKEN; `resetPassword` — validation + RESET_FAILED/RESET_DONE codes
- [x] 3.4 New `components/auth/google-button.tsx` (useFormStatus, disabled, "Memproses…")
- [x] 3.5 Login page: callbackUrl hidden input + shared ERROR_MESSAGES + GoogleButton
- [x] 3.6 Register page: shared ERROR_MESSAGES + GoogleButton + callbackUrl
- [x] 3.7 Forgot-password page: shared ERROR_MESSAGES + RESET codes
- [x] 3.8 `middleware.ts`: pass `?callbackUrl=` on protected-route redirects

## Task 4 — Phase 3: dedicated publisher auth
- [x] 4.1 New `components/auth/login-form.tsx` (parameterized: error/message/callbackUrl/registerHref/brand)
- [x] 4.2 New `components/auth/register-form.tsx` (parameterized: error/success/email/callbackUrl/loginHref/brand)
- [x] 4.3 Refactor `(auth)/login/page.tsx` + `register/page.tsx` to render shared forms (customer brand)
- [x] 4.4 New `publisher/login/page.tsx` + `publisher/register/page.tsx` (publisher brand, default `/publisher/dashboard`)
- [x] 4.5 `signUpPublisher` action (immediate PUBLISHER role) + register form wiring
- [x] 4.6 `middleware.ts`: publisher host `/login`→`/publisher/login`, `/register`→`/publisher/register`; PUBLISHER on those pages → dashboard
- [x] 4.7 `publisher.css`: small additions for publisher auth (error banner, google button) if needed

## Task 5 — Verify + bookkeeping
- [x] 5.1 `npm run typecheck --workspace=web` ✅ + `npm run lint --workspace=web` ✅ (0 errors; NO test script — stated)
- [x] 5.2 Greps: no `next-auth/react` signOut; no hardcoded `redirectTo: '/library'` in actions; dashboard/submit gated
- [x] 5.3 Manual QA checklist documented (dev + prod, both domains, Google console redirect-URI note)
- [ ] 5.4 Deploy `npm run deploy:prod` → smoke `bukoo.id`, `publisher.bukoo.id`, `/api/auth/session`
- [x] 5.5 Update AGENTS.md if stale (publisher auth notes); update ledger + `task.md`

## Verification checklist (AGENTS.md)
- [ ] `apps/web`: typecheck ✅ lint ✅ (no test files — stated explicitly)
- [ ] `packages/db`: untouched (no migration, no schema change)
- [ ] `apps/api`: untouched
