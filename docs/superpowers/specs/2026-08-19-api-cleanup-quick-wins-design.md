# Design Document: API Quick Wins — Stale Leftovers, No-ops, Streak Simplification

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/api` (apps/api) only
**Related**: Roadmap "BUKOO Tech-Debt Cleanup & Performance" (Task 3). Phase A quick wins, parallel
to Task 1 (mobile) and Task 2 (web).

---

## 1. Executive Summary

The API (`apps/api`, Hono + Cloudflare Worker) is lean and healthy, but carries three categories
of cleanup targets: **(a)** a stale NestJS leftover entrypoint that can never compile, **(b)** a
stale `.env.example` documenting a Supabase/Postgres/Port setup the worker no longer uses, and
**(c)** two code smells — a no-op string replace in the books query and a convoluted date-parsing
loop in the goals streak computation.

Goal: remove dead code, make the env docs truthful, and simplify the streak logic with **identical
behavior** (guarded by a focused unit test). No API contract or behavior change. No deploy
required (worker code changes only for readability-equivalent output; the streak refactor is
verified behavior-preserving).

**Non-goals**: no schema/migration changes; no endpoint shape changes; no security fixes (mock
token bypass / Apple OIDC verification are a separate future roadmap — explicitly out of scope for
this cleanup task); no changes to `apps/web`, `apps/mobile`, or `packages/*`.

---

## 2. Inventory

| # | File | What | Type |
|---|---|---|---|
| 1 | `apps/api/api/index.ts` (only file in `apps/api/api/`) | NestJS/Express leftover importing `../src/app.module` (does not exist) — can never compile; excluded from tsconfig (`include: ["src/**/*"]`) | Dead code |
| 2 | `apps/api/.env.example` | Documents `PORT`, `DATABASE_URL` (Supabase pooler), `NODE_ENV` — none used by the worker. Real config = `wrangler.jsonc` bindings + `wrangler secret put` secrets (`JWT_SECRET`, `GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID`, `MAILCHANNELS_API_KEY`, `MAIL_FROM`) | Stale artifact |
| 3 | `apps/api/src/routes/books.ts` (L128) | `ORDER BY b.${orderBy.replace(' ', ' ')}` — `replace(' ', ' ')` is a **no-op** (replaces space with space). `orderBy` comes from a fixed whitelist (L116–119), so interpolation is safe | Code smell |
| 4 | `apps/api/src/routes/goals.ts` `/streak/current` | Convoluted loop mixing string-date parsing, a "skip today" branch, and inline re-checks; hard to reason about (and untested) | Code smell |

---

## 3. Component Specs

### 3.1 Delete `apps/api/api/` — NestJS leftover
- Delete `apps/api/api/index.ts` and the now-empty `apps/api/api/` directory.
- Verified: tsconfig includes only `src/**/*`; nothing imports `api/`; `package.json` entry is
  `src/index.ts` (`wrangler.jsonc` `main`). No other files in the dir.

### 3.2 `apps/api/.env.example` — truthful worker env docs
Replace content (the worker reads **no** `.env`; local secrets go in `.dev.vars`, prod secrets via
`wrangler secret put`) with:
```
# BUKOO API — Cloudflare Worker (Hono)
# This worker does NOT read .env. Config comes from wrangler.jsonc (bindings) +
# secrets. For LOCAL dev, copy this file to `.dev.vars` and fill real values
# (wrangler dev reads `.dev.vars`; it is git-ignored). For PRODUCTION, set each
# secret via: wrangler secret put <NAME>

# --- Secrets (mirrors the wrangler secret put list) ---
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
APPLE_CLIENT_ID=your-apple-client-id
MAILCHANNELS_API_KEY=your-mailchannels-api-key
MAIL_FROM=noreply@bukoo.id

# Bindings DB / BUKOO_STORAGE / AI come from wrangler.jsonc — no env vars needed.
```
- The existing real `.env` (local file) is **untouched** (may hold local values; never print/edit).
- **Add `.dev.vars` to the root `.gitignore`** (verified: NOT currently ignored — only `.env*`
  variants are). Since the fixed example tells users to `cp .env.example .dev.vars` and fill real
  secrets, this prevents accidental secret commits. Wrangler auto-ignores it for its own file
  watching, but git needs the explicit entry.

### 3.3 `books.ts` — remove no-op replace
- L128: `ORDER BY b.${orderBy.replace(' ', ' ')}` → `ORDER BY b.${orderBy}`.
- `orderBy` remains the fixed whitelist from L116–119 (`id ASC` / `rating_count DESC` /
  `created_at DESC` / `rating_average DESC`) — no injection surface, no behavior change.

### 3.4 `goals.ts` — simplify `/streak/current`
Extract the streak computation into a **pure, exported helper** and have the route call it:

- **New file `apps/api/src/lib/streak.ts`**:
```ts
export interface StreakRowLike {
  date: string; // YYYY-MM-DD (UTC)
  goalMet: boolean;
}

/**
 * Consecutive-day reading streak ending today — or yesterday if today has no
 * record yet. Only days that have a record AND goalMet === true count.
 */
export function computeCurrentStreak(rows: StreakRowLike[]): number {
  const metByDate = new Map<string, boolean>();
  for (const row of rows) {
    if (!metByDate.has(row.date)) metByDate.set(row.date, row.goalMet);
  }

  const cursor = new Date(); // UTC today
  if (!metByDate.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  for (;;) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if (metByDate.get(dateStr) !== true) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
```
- **`goals.ts` `/streak/current`** becomes:
```ts
const allStreaks = await db.select().from(readingStreaks)
  .where(eq(readingStreaks.userId, userId))
  .orderBy(desc(readingStreaks.date));

return c.json({ currentStreak: computeCurrentStreak(allStreaks) });
```
- Query is unchanged; only the loop is replaced. `goalMet` is `boolean` in the schema
  (`integer('goal_met', { mode: 'boolean' })`), so the helper type aligns directly.
- **New test `apps/api/src/lib/streak.test.ts`** (vitest, picked up by `include: ['src/**/*.test.ts']`):
  - consecutive goalMet days ending today → N
  - today present with goalMet=false → 0
  - today missing but yesterday+day-before met → 2 (starts from yesterday)
  - gap breaks the streak (today met, yesterday missing) → 1
  - empty rows → 0
  - today+yesterday missing, older met → 0 (does not skip over a missing yesterday)
  - (helper is pure; uses UTC date strings, no DB needed)

Behavior equivalence notes (edge cases the old loop handled, preserved):
- Today with a record but goal not met → 0.
- Today without a record → start from yesterday.
- Any missing/not-met day inside the run → stop counting.

---

## 4. Layout / Styling Tokens
- N/A — backend only, no UI.

---

## 5. Verification Plan
Per AGENTS.md, run for `apps/api` (the only touched workspace):
1. `npx tsc --noEmit` (from `apps/api`).
2. `npm run lint` (from `apps/api`).
3. `npm run test` (from `apps/api`) — existing 8 tests **must still pass**; new `streak.test.ts`
   adds 6 more (expect 14 passing).

Additional manual checks:
- Grep for `app.module|NestFactory|@nestjs` in `apps/api` → 0 hits.
- Grep for `DATABASE_URL|pooler.supabase|NODE_ENV=` in `apps/api/.env.example` → 0 hits.
- Grep `orderBy.replace` in `apps/api/src` → 0 hits.
- Confirm `apps/api/api/` directory gone.
- `git check-ignore apps/api/.dev.vars` → ignored (root `.gitignore` updated).
- No deploy required (code-only cleanup; nothing about `/health` or startup changes).

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| NestJS leftover | Delete `apps/api/api/` entirely | Dead, uncompilable, excluded from tsconfig; nothing imports it |
| `.env.example` | Rewrite as truthful worker-secrets doc (`.dev.vars` / `wrangler secret put`) | Removes Supabase/Port misinformation; real `.env` untouched |
| `orderBy.replace(' ', ' ')` | Remove no-op | Readability only; whitelist interpolation unchanged |
| Streak loop | Extract pure `computeCurrentStreak()` + unit tests | Simplifies a fragile, untested algorithm while proving behavior is preserved |
| Scope guard | No security fixes, no schema changes, no endpoint changes | Keeps this a pure cleanup task; security is a separate future roadmap item |
