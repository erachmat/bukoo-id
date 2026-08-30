# Implementation Plan — Publisher Tabs Rollout

Superpowers: subagent-driven-development · Spec: `docs/superpowers/specs/2026-08-30-publisher-tabs-rollout-design.md`

## Task 1 — Migration `0012_users_city`
- [ ] `users.city` text nullable in `packages/db/src/schema.ts`
- [ ] `db:generate` → `packages/db/drizzle/0012_*.sql`; rebuild `@bukoo/db`

## Task 2 — Seed extensions
- [ ] Cities pool (ID + foreign, index-aligned to `COUNTRIES`) emitted in users upserts
- [ ] `reading_progress` fabrication: last-day per reader×book pair, `ON CONFLICT(user_id, book_id)`
- [ ] Vary `last_read_at` hour (6–23, evening-weighted) in reader_days upserts

## Task 3 — Query layer
- [ ] `cities` (distinct readers by city, period-scoped)
- [ ] `funnel` 4-step via `reading_progress` join + `hasProgressData` flag
- [ ] `weekdayRhythm` + `hourRhythm` series
- [ ] `bookStats` per book (period + lifetime)
- [ ] Update interface + `EngagementFunnel`

## Task 4 — UI
- [ ] `PageDemografi` real (+ sidebar entry in `sidebar-client.tsx`)
- [ ] `PageWaktu` real (hour bars, weekday bars, session tile)
- [ ] `PageGeo` + city bars
- [ ] `PagePembaca` + funnel + tiles
- [ ] `PageRoyalti` + formula panel + per-title amounts
- [ ] `PagePerforma` + rich `bookStats` table
- [ ] `PageKatalog` + status chips row
- [ ] Overview funnel renders 4-step when data allows
- [ ] Minor `publisher.css` additions if needed

## Task 5 — Verification & rollout
- [ ] typecheck/lint/test (packages/db, apps/web); note db has no test script
- [ ] Local 0012 + seed re-apply + smoke SQLs
- [ ] Commit (only task files) → push → `migrate-d1.yml` apply_remote=true → remote seed
- [ ] Ledger + task.md
