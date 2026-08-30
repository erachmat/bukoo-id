# Implementation Plan — Publisher Overview Redesign

Superpowers: subagent-driven-development · Spec: `docs/superpowers/specs/2026-08-30-publisher-overview-redesign-design.md`

## Task 1 — Schema migration `0011_users_demographics`
- [x] Add `age_group`/`gender` text (nullable) to users in `packages/db/src/schema.ts`
- [x] `npm run db:generate` (from packages/db) → `packages/db/drizzle/0011_dry_guardsmen.sql`
- [x] `npm run --workspace=@bukoo/db build`

## Task 2 — Period engine (`apps/web/src/app/publisher/dashboard/metrics.ts`)
- [x] `PeriodKey += 'this_quarter' | 'ytd'`
- [x] `getPeriodRange` branch for this_quarter (quarter bounds) & ytd (Jan 1 → now)
- [x] `parsePeriodKey` accepts new keys
- [x] `getPreviousPeriodRange(range)` (mirror window shifted back one cycle)
- [x] Extend `metrics.test.ts` (20 tests passing)

## Task 3 — Query layer (`queries.ts`)
- [x] `dailyTrend`: group by metricDate (monthly rollup for ytd)
- [x] `genreSplit`: per-book reader-days × `books.genre` arrays (JS)
- [x] `demographics`: distinct readers → users.age_group/gender buckets
- [x] `comparison`: same aggregates over previous period (royalty via same formula)
- [x] `funnel`: from readStarts / completions
- [x] Update `PublisherDashboardOverview` interface

## Task 4 — Seed demographics
- [x] `seed-demo-publisher.ts` — fabricated age_group/gender distributions (separate PRNG stream; 13F/11M)
- [x] Regenerate SQL files (deterministic/idempotent, demo-reader-* only)

## Task 5 — UI rewrite (`dashboard-client.tsx`)
- [x] PeriodChips += quarter + YTD
- [x] KPI row with delta chips
- [x] TrendChart (CSS bars)
- [x] TopBooksCard (rank gold/silver/bronze)
- [x] GenreDonut (conic-gradient)
- [x] FunnelPanel
- [x] DemogPanel, GeoPanelCompact
- [x] Restyle notifications/payouts/premium panels (content preserved)

## Task 6 — CSS primitives (`publisher.css`)
- [x] `.pds-grid-3`, `.pds-empty` (bars/donut/tracks already existed from earlier pass)

## Task 7 — Verification
- [x] typecheck → lint → test: `packages/db`, `apps/web` (db has no test/lint scripts — noted)
- [x] Local D1: migration + seed applied; smoke SELECTs confirm demographics/trend/genre data present
- [ ] NOTE (user): UI walkthrough via `wrangler dev` needs an authenticated publisher session
- [x] SDD ledger `.superpowers/sdd/publisher-overview-redesign/progress.md`
- [ ] `task.md` check-off
- [ ] REMOTE (manual, user-run): apply `0011_dry_guardsmen.sql` via `migrate-d1.yml` (dry-run review → apply_remote=true); re-run demo seed against remote D1
