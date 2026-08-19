---
workflow: superpowers:subagent-driven-development
---

# Implementation Plan — Fix Web Google Login (accounts.id NOT NULL bug) — 2026-08-20

Spec: `docs/superpowers/specs/2026-08-20-web-google-login-fix-design.md` (user-approved via "Start implementation")
Ledger: `.superpowers/sdd/web-google-login-fix/progress.md`
Scope: `packages/db` (schema + dep) + redeploy `apps/web`. **No D1 migration.**

## Task 1 — SDD artifacts
- [x] 1.1 Design spec written
- [x] 1.2 Plan written + ledger created
- [x] 1.3 `task.md` updated with this task group

## Task 2 — Schema fix (`packages/db`)
- [x] 2.1 `src/schema.ts`: import `createId` from `@paralleldrive/cuid2`
- [x] 2.2 `accounts.id` → `text('id').primaryKey().$defaultFn(() => createId())`
- [x] 2.3 `sessions.id` → `text('id').primaryKey().$defaultFn(() => createId())`
- [x] 2.4 `package.json`: add `"@paralleldrive/cuid2": "^2.2.2"` to dependencies
- [x] 2.5 `npm install` at root (lockfile sync; dep already hoisted)
- [x] 2.6 Rebuild: `npm run build --workspace=@bukoo/db` (web imports `dist`)

## Task 3 — Verify (local)
- [x] 3.1 `npm run typecheck --workspace=@bukoo/db` ✅
- [x] 3.2 `npm run db:check` (drizzle-kit check) → "Everything's fine" ✅
- [x] 3.3 `npm run typecheck` + `npm run lint` for `apps/web` ✅ (0 errors; pre-existing warnings only; NO test files — stated)
- [x] 3.4 `npm run typecheck` + `npm run lint` + `npm run test` for `apps/api` ✅ (14/14 tests pass)
- [x] 3.5 SQL proof: `toSQL()` of adapter-style insert (no `id`) now includes generated cuid2 in `params[0]` for both `accounts` and `sessions`

## Task 4 — Deploy + verify (live)
- [x] 4.1 Commit fix (`12460dc`)
- [x] 4.2 `npm run deploy:prod` from `apps/web` → version `71c72e03`, live at `bukoo.id`
- [x] 4.3 Bundle contains fix (`createId` + `defaultFn` in `.open-next` schema chunks)
- [x] 4.4 Smoke test: `/login`, `/register`, `/api/auth/session`, `/library` → 200
- [ ] 4.5 Manual Google login click-through (needs real Google account) → `/library` + `accounts` row created; orphan user (e.g. `baihaqi.r@gmail.com`) re-login succeeds

## Task 5 — Bookkeeping
- [ ] 5.1 Ledger + `task.md` updated (mark 4.5 as user-verification)

## Verification checklist (AGENTS.md)
- [x] `packages/db`: typecheck ✅ build ✅ db:check ✅ (no tests in workspace — stated)
- [x] `apps/web`: typecheck ✅ lint ✅ (no tests in workspace — stated)
- [x] `apps/api`: typecheck ✅ lint ✅ test ✅ 14/14
