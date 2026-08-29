# Publisher Demo Data — Implementation Plan

<!-- superpowers:subagent-driven-development -->

Design spec: `docs/superpowers/specs/2026-08-28-publisher-demo-data-design.md`
Approved: 2026-08-28 ("Start implementation")

## Task 1: Seed generator in `packages/db`

- [ ] Create `packages/db/src/seed-demo-publisher.ts`:
  - [ ] `DEMO_*` constants: books (6), readers (24), subscriptions (12), countries, payouts, notifications
  - [ ] `mulberry32` deterministic PRNG, fixed seed
  - [ ] `buildDemoSeedSql()` — pure, emits idempotent SQL (`ON CONFLICT DO UPDATE`; `platform_settings` uses `DO NOTHING`)
  - [ ] `buildDemoUnseedSql()` — deletes only `demo-%` / `demo-reader-%` rows; NO `books_fts` statements
  - [ ] CLI entry (tsx): writes `packages/db/sql/seed-demo-publisher.sql` + `…unseed….sql`, prints wrangler + pre-flight commands
- [ ] `books.publisher_user_id` resolved via `(SELECT id FROM users WHERE email='demo-publisher@bukoo.id')`
- [ ] `publisher_book_reader_days.user_id` FK satisfied by seeded `users` (`demo-reader-N`), inserted *before* metric rows in statement order
- [ ] Consistency: `read_starts` aggregates reader-days; `books.read_count`/`read_time_minutes` match metric sums; royalty math left entirely to dashboard queries
- [ ] Metrics window = 60 UTC days ending today (`YYYY-MM-DD` text dates)

## Task 2: npm scripts + docs (wiring)

- [ ] Add `packages/db/package.json` scripts: `db:seed:demo` (tsx → writes SQL files), `db:seed:demo:sql:check` (grep-style sanity via `node -e` guard in-script is preferred; keep scripts thin)
- [ ] Keep wrangler invocation documented in script output (wrangler lives in `apps/web` devDeps)

## Task 3: R2 assets

- [ ] Generate 6 covers with `convert` (800×1200 JPEG, title text) in a temp dir
- [ ] Upload EPUBs: `epubs/demo-{1..3}.epub` (from `apps/api/public/books/`) + `epubs/demo-{4..6}.epub` (copies) — `--content-type application/epub+zip`
- [ ] Upload covers: `covers/demo-{1..6}-cover.jpg` — `--content-type image/jpeg`
- [ ] Verify objects exist (`wrangler r2 object get` smoke, or dashboard load)

## Task 4: Execute remote seed

- [ ] Pre-flight: `SELECT id, role FROM users WHERE email='demo-publisher@bukoo.id'` (user must exist as PUBLISHER; if missing → stop and ask user to register)
- [ ] `npx wrangler d1 execute bukoo-db --remote --file=packages/db/sql/seed-demo-publisher.sql` (from `apps/web`)
- [ ] Verify counts + `books_fts` MATCH on demo titles; run seed a second time → identical counts

## Task 5: Verification & ledger

- [ ] `npm run typecheck --workspace=@bukoo/db`; `npm run lint --workspace=@bukoo/db` (no tests exist in `packages/db` — noted, not skipped silently)
- [ ] Manual dashboard pass (all tabs) + reader load + catalog visibility + mobile search
- [ ] Update `.superpowers/sdd/publisher-demo-data/progress.md` after each task
- [ ] Mirror completion into root `task.md`
