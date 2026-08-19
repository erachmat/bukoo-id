# SDD Ledger — API Quick Wins: Stale Leftovers, No-ops, Streak Simplification

Plan: `docs/superpowers/plans/2026-08-19-api-cleanup-quick-wins.md`
Spec: `docs/superpowers/specs/2026-08-19-api-cleanup-quick-wins-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (delete NestJS leftover)**: complete — `apps/api/api/index.ts` + `apps/api/api/` dir deleted (uncompilable NestJS/Express leftover importing nonexistent `../src/app.module`). ✅
- **Task 2 (.env.example)**: complete — rewritten as truthful worker-secrets doc: no `PORT`/`DATABASE_URL`/`NODE_ENV`; documents `.dev.vars` for local + `wrangler secret put` for prod (JWT_SECRET, GOOGLE_CLIENT_ID, APPLE_CLIENT_ID, MAILCHANNELS_API_KEY, MAIL_FROM). Real `.env` untouched. ✅
- **Task 3 (.dev.vars gitignore)**: complete — added `.dev.vars` to root `.gitignore`; `git check-ignore apps/api/.dev.vars` → IGNORED. ✅
- **Task 4 (books.ts no-op)**: complete — `ORDER BY b.${orderBy.replace(' ', ' ')}` → `ORDER BY b.${orderBy}` (whitelist interpolation unchanged). ✅
- **Task 5 (streak helper)**: complete — new `apps/api/src/lib/streak.ts` with pure `computeCurrentStreak(rows)` (UTC YYYY-MM-DD; starts today, falls back to yesterday; only `goalMet === true` counts; stops at first gap). ✅
- **Task 6 (goals.ts)**: complete — `/streak/current` now `computeCurrentStreak(allStreaks)`; query unchanged; `desc` still used by the query. ✅
- **Task 7 (streak tests)**: complete — new `apps/api/src/lib/streak.test.ts` (6 tests: consecutive-today / today-not-met→0 / yesterday-start / gap / empty / missing-yesterday→0). ✅
- **Task 8 (verify)**: ✅ `npx tsc --noEmit` exit 0; `npm run lint` 0 errors (4 pre-existing `no-console` warnings in `auth.ts` — not from this change); `npm run test` **14/14 passed** (8 existing + 6 new). Greps: `NestFactory|@nestjs|app.module` → 0 in `apps/api` (excl. node_modules/dist); `DATABASE_URL|pooler.supabase|NODE_ENV=` → 0 in `.env.example`; `orderBy.replace` → 0 in `src`; `apps/api/api/` gone; `.dev.vars` git-ignored.
- **Task 9 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **`.dev.vars` gitignore added** (spec amendment after verification): root `.gitignore` only covered `.env*`; since the fixed `.env.example` instructs `cp .env.example .dev.vars`, real secrets could otherwise be committed.
2. **Streak helper is behavior-preserving by construction** — the new loop is equivalent to the old one for all edge cases (verified by 6 unit tests): today-met→count, today-not-met→0, today-missing→start yesterday, gaps stop, empty→0.
3. **No deploy required** — code-only cleanup; nothing about `/health` or worker startup changed. (Security fixes — mock-token bypass, Apple OIDC — intentionally out of scope per roadmap.)

## Commits
- Not committed yet — changes in working tree (`apps/api/.env.example`, `apps/api/src/routes/books.ts`, `apps/api/src/routes/goals.ts`, new `apps/api/src/lib/streak.ts` + `streak.test.ts`, deleted `apps/api/api/`, root `.gitignore`, docs). Suggested commit: `refactor(api): quick wins — dead NestJS leftover, env docs, streak simplification`.
