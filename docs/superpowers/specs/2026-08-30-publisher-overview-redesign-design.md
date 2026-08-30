# Design Spec — Publisher Dashboard Overview Redesign (Mockup Parity)

- **Date:** 2026-08-30
- **Task slug:** `publisher-overview-redesign`
- **Reference mockup:** `BUKOO-Publisher-Dashboard-Mizan-3.html` (repo root)
- **Scope:** Overview tab of `/publisher/dashboard` only. All data remains **real** (D1 via Drizzle); demographic data is **fabricated in the demo seed** so every chart renders for `demo-publisher@bukoo.id`.

## 1. Executive summary

Rebuild `PageOverview` in `apps/web/src/app/publisher/dashboard/dashboard-client.tsx` to mirror the mockup's layout & components while keeping every number data-driven:

- KPI row (4 cards) with **period-over-period deltas** (▲/▼/flat vs equivalent previous period).
- **Trend bar chart** — daily bars for month/quarter periods, monthly rollup for YTD (CSS only).
- **Top books** ranked list (existing `topBooks`).
- **Genre donut** (CSS conic-gradient) from reader-days × `books.genre`.
- **Engagement funnel** (opened → >10% → >50% → completed) from daily metrics.
- **Geo bars** (country-level; existing `geo[]`).
- **Demographics** — age groups + gender split from new nullable `users.age_group` / `users.gender` columns (fabricated for demo readers, null → graceful empty state for real readers).
- Retained & restyled: notifications, payouts, premium insights.

### Explicit exclusions
Other dashboard tabs, city/province geo (no schema source), rating/ulasan funnel stage (no ratings fact tied to publisher metrics), chart libraries (pure CSS/SVG), print/PDF export.

## 2. Data model changes

### 2.1 Migration `0011_users_demographics` (packages/db)
```
ALTER TABLE `users` ADD `age_group` text;      -- '13-17'|'18-24'|'25-34'|'35-44'|'45-54'|'55+'|NULL
ALTER TABLE `users` ADD `gender` text;         -- 'F'|'M'|NULL
```
Nullable by design — real readers carry no demographic fields; queries treat NULL as "unknown" and UI shows an empty-state.

### 2.2 Seed (`packages/db/src/seed-demo-publisher.ts`)
- Deterministic assignment of `age_group`/`gender` to `demo-reader-1..24` via the existing PRNG weights (bimodal youth-heavy: 13-17 20%, 18-24 38%, 25-34 22%, 35-44 12%, 45-54 5%, 55+ 3%; gender 54% F / 46% M).
- Emit as additional `ON CONFLICT(id) DO UPDATE SET age_group=…, gender=…` clauses in the existing users upserts (idempotent, `demo-reader-*` only).

## 3. Query layer (`queries.ts` — `getPublisherDashboardOverview`)

New fields on `PublisherDashboardOverview`:

| Field | Shape | Source |
|---|---|---|
| `comparison` | `{ current: number; previous: number \| null; metric: 'reads'|'readers'|'seconds'|'royalty' }` per KPI | previous equivalent period (e.g. last_month for this_month; prior month-range for last_month; null for all_time) |
| `dailyTrend` | `{ date: string; reads: number; seconds: number; completions: number }[]` | daily aggregate over `publisherBookDailyMetrics` in period |
| `genreSplit` | `{ genre: string; readerDays: number }[]` | JS-side: per-book reader-days joined to `books.genre` JSON arrays (split book-days across its genres) |
| `demographics` | `{ ageGroups: {label,count}[]; gender: {female,male,unknown} }` | distinct readers via `publisherBookReaderDays` → `users.age_group`/`gender` |
| `funnel` | `{ opened; tenPercent; fiftyPercent; completed }` | daily metrics + reader-day-derived completion (opened ≥ any reader-day; >10%/>50% approximated from cumulative seconds vs pages-read scaling) |

⚠️ Funnel terms `>10%` / `>50%` are approximations from `readStarts` vs `completedReads` scaling; will be documented in the panel label as per Radikal-Transparansi convention. Final design keeps funnel rooted in `readStarts` / `completedReads` only (no >50% if data can't support it).

## 4. UI component spec (dashboard-client.tsx)

| Component | Source data | Visual |
|---|---|---|
| `PageOverview` header | publisherName, period.label | greeting + period + CTA (+ Upload Buku Baru) |
| `PeriodChips` | existed | add `this_quarter`, `ytd` chips |
| KPI cards | overview fields + `comparison` | 4 cards: Pembaca, Estimasi Royalti, Waktu Baca (mnt), Judul Aktif; delta chip ▲/▼/– vs previous period |
| `TrendChart` | `dailyTrend` | CSS flex bars proportional to max value; monthly bucket labels when period is YTD |
| `TopBooksCard` | `topBooks` | rank badge + cover thumb + reads/minutes |
| `GenreDonut` | `genreSplit` | conic-gradient circle + legend |
| `FunnelPanel` | `funnel` | horizontal tracks with % width |
| `DemogPanel` | `demographics` | horizontal tracks + gender split track |
| `GeoPanel` | `geo` | horizontal tracks per country code, top 6 + `Lainnya` |
| Notifications, Payouts, PremiumInsights | existing | restyled into `pds-grid` rows |

## 5. Styling tokens

Reuse existing `--pds-*` tokens in `apps/web/src/app/publisher/publisher.css` (teal/amber/coral/sky/mint/lavender). New utility classes ONLY (no duplicates):
- `.pds-chart` / `.pds-cbar` / `.pds-cval` / `.pds-cmon`
- `.pds-donut` / `.pds-donut-legend`
- `.pds-track-row` / `.pds-track` / `.pds-track-fill`
- `.pds-perc` / `.pds-perc-up` / `.pds-perc-down`
- `.pds-empty` (consistent zero-data state)
- `.pds-spark-*` variants if space requires

## 6. Verification plan

1. `npm run --workspace=@bukoo/db build`, `npm run --workspace=@bukoo/db db:generate` (no leftover diffs), `npx tsc --noEmit` for packages/db, packages/shared-types, apps/api, apps/web.
2. `npm run lint --workspace=<each>`, `npm run test --workspace=<each>`.
3. `npx tsx packages/db/src/seed-demo-publisher.ts` → SQL regenerates deterministically — verify unseed remains safe (no new table deps) and `age_group`/`gender` clauses only touch `demo-reader-*` ids.
4. Local: `npx wrangler d1 execute bukoo-db --local --file=packages/db/sql/seed-demo-publisher.sql`, `wrangler dev -c apps/web/wrangler.jsonc` → visit `/publisher/dashboard` as demo-publisher@bukoo.id (or session vars) → assert every panel renders with real numbers (not mockup placeholder text).
5. `metrics.test.ts` extended for `this_quarter` / `ytd` ranges + ⇠ same-period-previous offsets.

## 7. Rollout

- PR merges → CI `ci.yml` (turbo lint/typecheck/test).
- Schema migration to REMOTE goes **only** through `.github/workflows/migrate-d1.yml` (manual `apply_remote=true` after reviewing the generated `--remote --dry-run` SQL in CI output) — **never** via wrangler remote from laptops (AGENTS.md hard rule).
- Demo seed applied via the existing app-script under `apps/web` (`npm run seed:demo` package script — already used for the Aug demo data; re-run regenerates identity, no destructive changes).
