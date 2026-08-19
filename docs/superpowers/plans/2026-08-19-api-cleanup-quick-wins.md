# Implementation Plan: API Quick Wins — Stale Leftovers, No-ops, Streak Simplification

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-api-cleanup-quick-wins-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/api` (apps/api) only
**Ledger**: `.superpowers/sdd/api-cleanup-quick-wins/progress.md`

---

## Task 1 — Delete NestJS leftover

- [x] Delete `apps/api/api/index.ts` and the now-empty `apps/api/api/` directory.

## Task 2 — `.env.example`: truthful worker-secrets doc

- [x] Rewrite `apps/api/.env.example` (`.dev.vars` for local, `wrangler secret put` for prod; no `PORT`/`DATABASE_URL`/`NODE_ENV`).
- [x] Real `.env` untouched.

## Task 3 — Root `.gitignore`: ignore `.dev.vars`

- [x] Add `.dev.vars` to root `.gitignore` (verified currently NOT ignored).
- [x] `git check-ignore apps/api/.dev.vars` → ignored.

## Task 4 — `books.ts`: remove no-op replace

- [x] L128 `ORDER BY b.${orderBy.replace(' ', ' ')}` → `ORDER BY b.${orderBy}`.

## Task 5 — New `src/lib/streak.ts` helper

- [x] Create pure `computeCurrentStreak(rows)` (UTC YYYY-MM-DD; starts today, falls back to yesterday; only goalMet=true counts).

## Task 6 — `goals.ts`: use helper in `/streak/current`

- [x] Replace the convoluted loop with `computeCurrentStreak(allStreaks)`; query unchanged; keep `desc` import used elsewhere (verify).

## Task 7 — New `src/lib/streak.test.ts`

- [x] Vitest: consecutive-today / today-not-met→0 / yesterday-start / gap / empty / missing-yesterday→0 (6 tests).

## Task 8 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit` (apps/api) → exit 0.
- [x] `npm run lint` (apps/api) → 0 errors.
- [x] `npm run test` (apps/api) → existing 8 + new 6 = 14 passing.
- [x] Grep `app.module|NestFactory|@nestjs` in apps/api → 0 hits.
- [x] Grep `DATABASE_URL|pooler.supabase|NODE_ENV=` in apps/api/.env.example → 0 hits.
- [x] Grep `orderBy.replace` in apps/api/src → 0 hits.
- [x] `apps/api/api/` gone; `git check-ignore apps/api/.dev.vars` → ignored.

## Task 9 — Docs

- [x] Update root `task.md` with completed entry.
- [x] Update SDD ledger `.superpowers/sdd/api-cleanup-quick-wins/progress.md`.
- [x] Mark all plan checkboxes complete.
