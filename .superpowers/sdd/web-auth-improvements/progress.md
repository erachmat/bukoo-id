# SDD Ledger — web-auth-improvements (2026-08-20)

Spec: `docs/superpowers/specs/2026-08-20-web-auth-improvements-design.md`
Plan: `docs/superpowers/plans/2026-08-20-web-auth-improvements.md`

## Progress

- Task 1 (artifacts): complete (spec + plan + ledger + task.md entry)
- Task 2 (logout bug): complete — 4 client signOut sites → server action; middleware gates `/publisher/dashboard` + `/publisher/submit`; stale comment fixed; verified via build + local worker smoke test (307 on unauthed dashboard/submit)
- Task 3 (shared auth UX/security): complete — `errors.ts` catalog, `safeCallbackUrl`/`defaultRedirectForRole` in `lib/auth-helpers.ts`, callbackUrl support (login/register/google + middleware pass-through), role-aware redirects, GoogleButton pending state, server-side validation, anti-enumeration, passwordless copy
- Task 4 (publisher auth): complete — shared `login-form`/`register-form`, `/publisher/login` + `/publisher/register` branded pages, `signUpPublisher` (immediate PUBLISHER), middleware host redirects, publisher.css additions
- Task 5 (verify + deploy): complete — web typecheck ✅ / lint 0 errors (18 pre-existing warnings) ✅ / `next build` ✅ / `opennextjs-cloudflare build` ✅ / local wrangler dev smoke tests ✅ (pages 200, redirects 307 with callbackUrl) / **DEPLOYED** `npm run deploy:prod` → worker version `f188e0de-1db1-4e81-902f-f9cf380f6a73` live. Prod smoke ✅: bukoo.id /login /register /api/auth/session 200; publisher.bukoo.id /login→/publisher/login 307, /register→/publisher/register 307, /publisher/login 200 (branded); unauthed /publisher/dashboard → 307 /login?callbackUrl=%2Fpublisher%2Fdashboard. AGENTS.md + task.md updated.
- Note: `apps/web/.dev.vars` created (git-ignored) from `.env` for local wrangler dev smoke test — kept for future dev.
