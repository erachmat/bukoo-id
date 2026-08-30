# SDD Progress — publisher-tabs-rollout

Spec: `docs/superpowers/specs/2026-08-30-publisher-tabs-rollout-design.md`
Plan: `docs/superpowers/plans/2026-08-30-publisher-tabs-rollout.md`
Commit: `ef7751f` (pushed to main; CI/deploy-web/deploy-api green)

## Task 1: complete — Migration 0012
- `users.city` text nullable → `packages/db/drizzle/0012_clear_mauler.sql`; `@bukoo/db` rebuilt; applied LOCAL + REMOTE via `migrate-d1.yml` (apply_remote=true)

## Task 2: complete — Seed
- Cities: ID readers rotate 8 Indonesian cities; foreign map KL/Singapura/New York/Riyadh/Dubai — 14 distinct cities
- `reading_progress`: 75 fabricated rows (1/reader×book pair, from schedule's last day; completed→100%, else 5–85%; avg 54%) keyed `ON CONFLICT(user_id, book_id)`
- Reader-day `last_read_at` now evening-weighted 06–22 (45% at 20–22) → 17 distinct hours for the rhythm chart
- Regenerated SQL: 1,503 statements; idempotent re-run verified

## Task 3: complete — Query layer (`queries.ts`)
- `cities` (distinct readers top-8 + "Lainnya"), `weekdayRhythm` (strftime %w), `hourRhythm` (strftime %H of last_read_at), `bookStats` (per-book period reads/seconds/completions + lifetime)
- `funnel` → `{opened, tenPlus, fiftyPlus, completed, hasProgressData}` — mid-steps from `reading_progress.progress_percent` matched to in-period (user,book) pairs; falls back to 2-step when no progress data

## Task 4: complete — UI
- `PageDemografi` NEW (age bars, city bars, country bars, 4 KPIs incl. dominant age group + top city) + sidebar entry 🧬 between Waktu Baca and Sebaran
- `PageWaktu` NEW (hour bars 00–23 with peak highlight, weekday bars Sen–Min, session-length + peak-hour + total-hours KPIs)
- `PageGeo` upgraded (country % bars + city bars, 2-col grid)
- `PagePembaca` upgraded (4 KPIs, 4-step funnel w/ progress tag, retention buckets)
- `PageRoyalti` upgraded (per-title proportional royalty amounts + transparent formula panel)
- `PagePerforma` upgraded (bookStats table: tier, period reads, hours, completion %, cumulative, status chip, analytics link)
- `PageKatalog` + status count chips
- Overview funnel → `FunnelPanelFourStep`
- `publisher.css`: `.pds-grid-2col`, `.pds-flex-chips`
- Old `PageUnavailable` + 2-step `FunnelPanel` removed

## Task 5: verification
- `tsc --noEmit`: packages/db ✅, apps/web ✅ · lint 0 errors (29 pre-existing warnings) · tests 67/67 ✅ (packages/db has no test/lint scripts — noted)
- Local D1: 0012 + reseed OK — 14 cities, 75 progress rows (avg 54%), 17 distinct hours
- Remote: 0012 applied, seed re-applied — 14 cities / 75 progress rows confirmed; Deploy Web success
- Remaining (user): visual pass of the new tabs logged in as demo-publisher@bukoo.id
