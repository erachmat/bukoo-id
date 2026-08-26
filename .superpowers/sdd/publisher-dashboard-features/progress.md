# SDD Ledger — Publisher Dashboard Features

Spec: `docs/superpowers/specs/2026-08-26-publisher-dashboard-features-design.md`
Plan: `docs/superpowers/plans/2026-08-26-publisher-dashboard-features.md`

## Progress

- Task 1 (D1 schema): complete — publisher tables + `books.publicationStatus`; migration `0005_last_the_renegades.sql` generated; `drizzle-kit check` clean; DB build/typecheck pass, no FTS5 operations.
- Task 2 (publisher auth helper): complete — `apps/web/src/lib/publisher-auth.ts` (`getPublisherUser`, `getAdminUser`); used in catalog + submission actions.
- Task 3 (catalog actions + edit): complete — server-side validation (≤50MB, EPUB/PDF, image types), create as IN_REVIEW (not unconditional publish), `updatePublisherBook`, safe R2 cleanup, edit page `books/[id]/edit`.
- Task 4 (submission + admin review): complete — `SubmitForm` posts real files via server action → `publisherSubmissions`; admin review list `/admin/submissions` + setujui/tolak/minta-revisi.
- Task 5 (reading metrics): complete — `packages/db/src/publisher-metrics.ts` (`recordPublisherReadingMetric`); wired into web `updateReadingProgress` + API `handleUpsertProgress`; idempotent reader-days/daily-metrics/completion. (No D1 test harness for a pure unit test — API suite caveat noted.)
- Task 6 (dashboard data + UI): complete — `dashboard/queries.ts` server query; Overview/Royalti/Performa/Metadata fed by real data; estimates clearly labeled; demografi/geo/promosi marked unavailable.
- Task 7 (notifications): complete — `publisher/notifications` server page + client with mark-read/mark-all; sidebar+shell route wired.
- Task 8 (settings/profile/payout): complete — `publisher/settings` profile + masked payout account.
- Task 9 (navigation honesty): complete — removed fake counts, routed katalog/notifikasi/pengaturan, disabled uncollected-data tabs, footer updated.
- Task 10 (verification): complete — web typecheck ✅ / lint 0 errors (26 pre-existing warnings) ✅ / web no test script (stated); api typecheck ✅ / lint 0 errors (4 pre-existing warnings) ✅ / tests 14/14 ✅; db typecheck+build+`drizzle-kit check` ✅.

## Verification notes
- Web has **no test script** (stated explicitly, AGENTS.md rule).
- Migration `0005_last_the_renegades.sql` must be applied to production D1 ONLY via the sanctioned `.github/workflows/migrate-d1.yml` workflow after `--remote --dry-run` review. NOT auto-applied in this task.
- Deploy requires: migration apply + `npm run deploy:prod` from `apps/web`; `apps/api` needs redeploy for the metrics aggregation on reading updates.
