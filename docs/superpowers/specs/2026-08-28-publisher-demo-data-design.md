# Publisher Dashboard Demo Data — Design Spec

**Date:** 2026-08-28
**Status:** Approved (plan summary approved by user before this spec; "Start implementation" given)
**Scope:** `packages/db` (seed script only). No schema changes, no `apps/web` code changes.

## Executive summary

The publisher dashboard (`/publisher/dashboard`) is fully real but renders empty states for any
publisher with fewer than 1 book. To communicate the "big picture" to evaluators and stakeholders,
we seed **a demo publisher account on production** (`demo-publisher@bukoo.id`) with:

- 6 published books with real, readable EPUBs and real covers (R2 objects)
- ~60 days of reader-days, daily reading metrics, and geo (country) metrics
- 1 PAID + 1 SCHEDULED payout, a handful of notifications
- Real demo reader users (FK requirement) with a spread of subscription plans
- Royalty settings (`royalty_monthly_pool`) so the Royalti tab produces genuine estimates

Everything is **real DB rows** — zero UI fabrication — honoring the honesty constraint from
`2026-08-26-publisher-dashboard-features-design.md`. Delivery is an **idempotent, deterministic
seed generator** (`seed-demo-publisher.ts`) that emits plain SQL, executed via
`wrangler d1 execute bukoo-db --remote --file=…` (data seed, not schema ⇒ does **not** go through
`migrate-d1.yml`, per AGENTS.md's migration rule which covers schema migrations only).

## Component specs

### 1. `packages/db/src/seed-demo-publisher.ts` (new)

- Exports `buildDemoSeedSql(): string` and `buildDemoUnseedSql(): string` (pure functions + data
  constants so they can be unit-inspected later).
- CLI mode when invoked (`npx tsx packages/db/src/seed-demo-publisher.ts`): writes
  `packages/db/sql/seed-demo-publisher.sql` and `packages/db/sql/unseed-demo-publisher.sql`,
  prints the exact `wrangler` commands to run, plus a pre-flight check command for the
  `demo-publisher@bukoo.id` user (which must be registered manually via `/publisher/register`).
- **Fully static SQL** — no runtime DB access; the publisher id resolves inside SQL via
  `SELECT id FROM users WHERE email='demo-publisher@bukoo.id'`. Fixed deterministic ids:
  `books.id = 'demo-1' … 'demo-6'`, readers `'demo-reader-1' … 'demo-reader-24'`.
- Deterministic PRNG (mulberry32, fixed seed) ⇒ two runs emit **byte-identical SQL** ⇒
  idempotent via `ON CONFLICT DO UPDATE` on every insert.

### 2. Data shape

| Object | Rows | Notes |
|---|---|---|
| `users` (readers) | 24 | `role='USER'`, email `demo-reader-N@demo.bukoo.id`, varied `favorite_genres` |
| `subscriptions` | 12 | maps readers to `plan_BACA`/`plan_PERSONAL`/`plan_PLUS`/`plan_FAMILY`, `status='ACTIVE'`, period ends in the future |
| `books` | 6 | fully published (`is_published=1`, `publication_status='PUBLISHED'`), `author='BUKOO Demo'`, mixed genres/languages/`subscription_required`, real `cover_key`/`epub_key`, `read_count`/`read_time_minutes` consistent with metrics |
| `publisher_book_reader_days` | ~700–900 | PK `(book,user,date)`; per-reader loyalty spread (some 1-day, some 5+ days, mirroring the dashboard's loyalty buckets); `user_id` FK satisfied by the 24 demo readers |
| `publisher_book_daily_metrics` | 360 (6×60) | `read_starts` = reader-days per day per book; `completed_reads`; `reading_seconds` consistent with completions |
| `publisher_book_country_metrics` | ~1200 | reader-days aggregated per `(book,date,country)`; ~8 countries, Indonesia-dominant, `'XX'` tail |
| `publisher_payouts` | 2 | 1 PAID (last month, `external_ref='DEMO-TRX-...'`), 1 SCHEDULED (this month); `royalty_period_id`/`payout_account_id` NULL |
| `notifications` | 4 | kinds `payout`/`review`/`campaign` for the demo publisher |
| `platform_settings` | 2 | `royalty_monthly_pool` / `royalty_rate_bps` via `ON CONFLICT(key) DO NOTHING` (never overwrites real config) |

Date window: 60 UTC days ending **today** (`YYYY-MM-DD` text) ⇒ spans ≥2 months so both
"Bulan ini" and "Bulan lalu" period filters populate.

### 3. R2 assets (executed manually, before seeding)

- EPUBs → `bukoo-assets` bucket: `epubs/demo-{1..3}.epub` from `apps/api/public/books/*.epub`
  (3 distinct titles); `demo-{4..6}.epub` are byte-copies of 1–3 under distinct keys so unseed
  can delete them without touching any real book.
- Covers → generated with ImageMagick (`convert`, solid color + title text, 800×1200 JPEG):
  `covers/demo-{1..6}-cover.jpg`.

## Layout / styling tokens

N/A — no UI changes. Dashboard renders seeded rows through existing queries
(`apps/web/src/app/publisher/dashboard/queries.ts`).

## Constraints honored

1. **FTS5:** books inserts fire the insert-only `books_ai` trigger — safe on D1. The seed and
   unseed SQL contain **zero** `books_fts` DELETE/UPDATE statements (hard-deleted demo books leave
   orphan FTS rows, filtered by the search JOIN's `is_published=1` — documented, harmless).
2. **D1 migrations rule:** data only, applied via `wrangler d1 execute --remote`; `migrate-d1.yml`
   not involved.
3. **Ownership:** all rows attach to `publisher_user_id = demo publisher's users.id` via subquery.
4. **Idempotency & safety:** re-running the seed updates nothing observable; unseed deletes only
   `demo-%` rows + `demo-reader-%` users.
5. **Honesty:** `platform_settings` uses `DO NOTHING`; if real settings already exist they win.

## Verification plan

1. `npm run typecheck --workspace=@bukoo/db` and `npm run lint --workspace=@bukoo/db` pass.
   (`packages/db` has **no test suite** — no tests to run; stating this explicitly per AGENTS.md.)
2. Generated SQL sanity-greps: no `books_fts` mentions; every `INSERT` has `ON CONFLICT`.
3. Pre-flight: verify `demo-publisher@bukoo.id` exists with `role='PUBLISHER'` (wrangler query).
4. After remote execution: row-count query per table; `books_fts` MATCH finds demo books.
5. Manual: log in as demo publisher → all dashboard tabs populated; open a demo book in the web
   reader (EPUB streams, cover renders via `/covers/…`); grants pass for premium books.
6. Idempotency: run seed twice → identical row counts.
