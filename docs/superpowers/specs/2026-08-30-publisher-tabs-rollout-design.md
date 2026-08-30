# Design Spec — Publisher Dashboard: All-Tab Redesign Rollout + Deeper Analytics

- **Date:** 2026-08-30
- **Task slug:** `publisher-tabs-rollout`
- **Builds on:** `2026-08-30-publisher-overview-redesign-design.md` (overview done; same tokens/primitives)
- **Goal:** Replace the remaining stub tabs (Demografi, Waktu Baca) with REAL data pages, upgrade Royalti/Performa/Geo/Pembaca to mockup-level richness, and add the data they need (city dimension, progress-based funnel, reading-rhythm series).

## 1. Scope

| Tab | Today | After |
|---|---|---|
| Demografi | unreadable stub (`PageUnavailable`), no sidebar entry | REAL: age groups, gender split, top cities, top countries; sidebar entry added |
| Waktu Baca | stub | REAL: 24-hour rhythm bars + weekday bars + avg-session stat |
| Geo | plain country table | country bars + **new city bars** (Indonesia focus) |
| Pembaca | loyalty buckets only | + 4-step funnel (opened → >10% → >50% → completed) + stat tiles |
| Royalti | KPIs + table | + transparent formula panel + per-title royalty amounts (share-based, labeled estimate) |
| Performa | bare title/link list | rich table: reads, minutes, completion %, lifetime per book → analytics link |
| Katalog | `CatalogTable` as-is | + status count chips above table (light touch, no `CatalogTable` API change) |

### Excluded
City-level for real users beyond what they self-enter; heatmap grid (bars suffice for v1); catalog grid view & `CatalogTable` internal changes; promotions tab.

## 2. Data model

### 2.1 Migration `0012_users_city`
`ALTER TABLE users ADD city text;` — nullable, self-entered, aggregated anonymously (same policy as age/gender).

### 2.2 Seed extensions (`seed-demo-publisher.ts`)
- **Cities**: index-aligned pool matching `COUNTRIES` — ID readers get Jakarta/Bandung/Surabaya/Yogyakarta/Medan/Makassar/Denpasar/Semarang rotation; foreign readers get KL/Singapore/Riyadh/Dubai/unknown. 14ID/10M gender pool untouched; separate `demoPrng` stream.
- **`reading_progress`**: one fabricated row per reader×book pair from the schedule's LAST day: `progress_percent` = 100 when `completed`, else 5–85 (PRNG); id `demo-rp-{bookId}-{reader#}`; `ON CONFLICT(user_id, book_id)` (the unique index).
- **Hour variety**: vary `last_read_at` hour (6–23, evening-weighted) per schedule row instead of fixed `T08:xx` so the Waktu tab shows a plausible distribution. Upsert updates timestamps, still idempotent.

## 3. Query layer additions (`PublisherDashboardOverview`)

| Field | Source |
|---|---|
| `cities: {city, readers}[]` | distinct in-period readers grouped by `users.city` (top 8, unknown folded) |
| `funnel` → `{opened, tenPlus, fiftyPlus, completed, hasProgressData}` | opened = distinct reader-book pairs in period; tenPlus/fiftyPlus = same pairs joined to `reading_progress.progress_percent` ≥10/≥50; completed = daily-metric completions (existing). `hasProgressData=false` → UI renders 2-step funnel |
| `weekdayRhythm: {dow, reads}[]` | `strftime('%w', metric_date)` group, in-period daily metrics |
| `hourRhythm: {hour, reads}[]` | `strftime('%H', last_read_at)` group, in-period reader-days |
| `bookStats: {id,title,author,coverKey,subscriptionRequired,lifetimeReads,reads,seconds,completions}[]` | daily metrics grouped per book + lifetime counters |

## 4. UI notes
- Overview funnel gains the >10% / >50% mid-steps when `hasProgressData` (Radikal-Transparansi label "estimasi dari progres baca").
- Waktu: hour bars (0–23) + weekday bars (Sen–Min) + "durasi rata-rata sesi" tile (`totalReadingSeconds / readStarts`).
- Demografi reuses `DemographicsPanel` data + city/country lists; sidebar-client gets `demografi` entry (analyticsNav).
- Royalti per-title amount = `monthlyRoyaltyEstimate × (bookSeconds / totalReadingSeconds)` — computed in the client, labeled "estimasi proporsional".

## 5. Verification
1. `db:generate` → clean 0012; rebuild `@bukoo/db`; typecheck/lint/test (db, web).
2. Local: apply 0012 + re-run seed (idempotent upserts refresh hours/cities/progress); smoke SQLs (cities buckets, progress rows, hour spread).
3. Remote: `migrate-d1.yml` (apply_remote=true) → re-seed `--remote`.
