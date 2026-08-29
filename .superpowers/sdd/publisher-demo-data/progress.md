# SDD Ledger — publisher-demo-data

Plan: `docs/superpowers/plans/2026-08-28-publisher-demo-data.md`
Spec: `docs/superpowers/specs/2026-08-28-publisher-demo-data-design.md`

- Task 1 (seed generator): complete — `packages/db/src/seed-demo-publisher.ts` (typecheck clean, deterministic, idempotent)
- Task 2 (wiring): complete — `db:seed:demo` script, `@types/node` + `tsx` devDeps, tsconfig `types: +"node"`
- Task 3 (R2 assets): complete — 6 EPUBs (`epubs/demo-{1..6}.epub`) + 6 covers (`covers/demo-{1..6}-cover.jpg`) uploaded to `bukoo-assets`
- Task 4 (remote seed): complete 2026-08-28 — applied to prod D1; demo publisher user id `rt3xgyg4sg31ra4me7bpk4bq` (role PUBLISHER). First run: 1471 changes. Idempotency re-run: changes=1427, counts IDENTICAL (656 reader-days / 303 daily / 419 geo). Review clean.
- Task 5 (verification):
  - DB counts ✅ (6 published books, 656/303/419 metrics, 2 payouts, 12 subs, 24 readers, royalty_pool=75000000)
  - FTS ✅ — trigger inserted exactly 6 rows (books_fts rowids 7–12, one per book). ⚠️ Search join MUST be `books.id = books_fts.id` (FTS rowid is sequential, NOT books.rowid — rows 1–6 are the known pre-purge orphans). `MATCH 'filsafat'` → demo-1 + demo-4. Real API search (apps/api/src/routes/books.ts:243) joins on b.id = f.id ✅
  - Live smoke ✅ `https://bukoo.id/covers/covers/demo-1-cover.jpg` → 200 image/jpeg; EPUB 401 unauthenticated (expected, auth-gated)
  - **PENDING (user)**: log in as demo-publisher@bukoo.id → visual pass of all dashboard tabs, /library catalog, reader EPUB render, premium gating
