# Design Spec — Publisher Dashboard Features (Core MVP)

**Date:** 2026-08-26
**Status:** Approved (user: "Start implementation")
**Workspaces touched:** `packages/db`, `apps/web`, `apps/api`

## Executive summary

The publisher dashboard currently renders illustrative client-side data and several
non-functional tabs. This spec makes the core publisher features genuinely usable
against D1/R2: catalog management with review-before-publish, persisted submissions,
aggregate reading analytics, estimated royalties, metadata management, persisted
notifications, and publisher settings. Demographics, geography, promotions, and team
management remain explicitly out of scope until their data/business contracts exist.

## Scope decisions (user-approved)

1. **Core MVP first** — not every prototype claim at once.
2. **Review-before-publish** — uploads create draft/in-review records; approval
   deliberately publishes. Direct upload no longer forces `isPublished: true`.
3. **Royalties = estimates from reading data** — configurable formula, explicitly
   labeled "estimasi". No finalized payout/settlement integration in this MVP.
4. **Reader insights = aggregate behavior only** — distinct readers, starts/sessions,
   completions, reading seconds. No age/gender/city/province fabrication.
5. **Admin review flow included** — minimal admin list + status transition so
   submissions can complete the lifecycle.
6. **Raw financial credentials excluded** — only masked/reference payout data in D1.

## Status vocabulary

- `books.publicationStatus`: `DRAFT | IN_REVIEW | PUBLISHED | UNPUBLISHED | REJECTED`
  (retain `isPublished` as the public-read compatibility flag).
- `publisherSubmissions.status`: `DRAFT | SUBMITTED | IN_REVIEW | CHANGES_REQUESTED |
  APPROVED | REJECTED | PUBLISHED`.

## Metric definitions

- **Distinct readers**: count of distinct `(userId)` in `publisherBookReaderDays` for a
  period.
- **Reader-days**: rows in `publisherBookReaderDays` (one per `(bookId, userId, date)`).
- **Read starts / sessions**: `publisherBookDailyMetrics.readStarts`.
- **Completions**: `publisherBookDailyMetrics.completedReads` (counted once per
  completion crossing).
- **Reading seconds**: `publisherBookDailyMetrics.readingSeconds`.

## Estimated royalty formula

`Estimate = (book read-seconds / total read-seconds across pool) × configured monthly
pool × publisher rate`. Amounts stored as integer IDR minor units. Zero/unknown revenue
shows "belum tersedia", never fabricated. Formula version recorded in the royalty model.

## Ownership & privacy rules

- Every publisher read/mutation derives the publisher ID from the authenticated session
  and includes an ownership predicate. Publisher A cannot access publisher B's rows.
- No raw bank account numbers in D1 — only masked/reference values.
- No demographic/geographic data collection in this MVP.

## UI states

- Authenticated PUBLISHER dashboard shows real data; logged-out/non-publisher shows the
  public illustrative showcase (unchanged).
- Tabs without a real data source are disabled/clearly marked unavailable, not shown as
  demo data.
- Public `showcase.tsx` remains marketing-only and visibly illustrative.

## Verification plan

1. DB: typecheck/build + `drizzle-kit check`; inspect migration SQL for D1 compatibility
   and no FTS5 DELETE/UPDATE.
2. Web: typecheck + lint (no test script — stated). API: typecheck + lint + vitest.
3. API tests: metric idempotency, completion counted once, ownership isolation, malformed
   input rejection.
4. Manual: publisher login, catalog CRUD, submit/review lifecycle, dashboard tabs,
   metadata export, estimated royalty statement, notification read state, settings
   persistence, logout, non-publisher denial.
