# SDD Progress — publisher-overview-redesign

Design spec: `docs/superpowers/specs/2026-08-30-publisher-overview-redesign-design.md`
Plan: `docs/superpowers/plans/2026-08-30-publisher-overview-redesign.md`

## Task 1: complete (schema migration)
- `packages/db/src/schema.ts`: `users.age_group` + `users.gender` (nullable text)
- `packages/db/drizzle/0011_dry_guardsmen.sql` generated via drizzle-kit; applied to LOCAL D1 successfully
- `@bukoo/db` rebuilt

## Task 2: complete (period engine)
- `metrics.ts`: `PeriodKey += this_quarter | ytd`; quarter/year bounds in `getPeriodRange`; `getPreviousPeriodRange` (month wraps, quarter -3 months, YTD prior-year mirror, custom = same-length prior window, all_time → null)
- `bucketAgeGroups` / `bucketGenders` helpers
- `metrics.test.ts`: +9 tests (20 total, all pass)

## Task 3: complete (query layer)
- `queries.ts`: `comparison` (readers/seconds/completions/royalty prev-window), `dailyTrend` (daily; monthly rollup when ytd), `genreSplit` (reader-days × book genres), `demographics` (distinct readers → age/gender buckets), `funnel` (readStarts → completedReads)
- `parseGenres` JSON-safe; genre select extended

## Task 4: complete (seed)
- `seed-demo-publisher.ts`: fabricated demographic distributions (age PRNG stream + interleaved F/M pool = 13F/11M, 24 readers), separate PRNG stream so reader-day layout is untouched
- SQL regenerated (deterministic/idempotent); local apply = 1,428 statements OK (after local pre-flight: demo publisher user + subscription plans)

## Task 5+6: complete (UI + CSS)
- `dashboard-client.tsx`: PeriodChips + Kuartal/YTD; KPI delta chips (▲/▼/= with `deltaClass`); `TrendChart`; `GenrePanel` (conic-gradient donut); `DemographicsPanel` (age tracks + gender split); `GeoPanelCompact` (top-5 countries); `FunnelPanel` (opened → completed); top-books grid 1.6fr/1fr; restyled notifications/payouts/premium panels unchanged content
- `publisher.css`: `.pds-grid-3` + `.pds-empty` (chart primitives already existed)

## Task 7: verification
- `npx tsc --noEmit`: packages/db ✓, apps/web ✓
- `npm run lint --workspace=apps/web` ✓ (only pre-existing `<img>` warning on cover thumbs)
- `npm run test --workspace=apps/web`: 67 passed (9 files)
- packages/db: no test/lint scripts (explicitly noted, not silently skipped)
- Local D1 end-to-end: migration + seed applied; `SELECT` smoke: 24 demo readers with demographics, 303 daily metric rows, 6 books with reads
- Remote rollout TODO (user): apply `0011_dry_guardsmen.sql` via manual `migrate-d1.yml` (apply_remote=true) after reviewing dry-run; re-run demo seed against remote (data-only, existing runbook)
