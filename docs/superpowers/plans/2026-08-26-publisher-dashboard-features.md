# Implementation Plan — Publisher Dashboard Features (Core MVP)

> superpowers:subagent-driven-development

**Spec:** `docs/superpowers/specs/2026-08-26-publisher-dashboard-features-design.md`
**Workspaces touched:** `packages/db`, `apps/web`, `apps/api`

## Task 1 — D1 schema foundations
- [x] Add to `packages/db/src/schema.ts`: `books.publicationStatus`; `publisherProfiles`;
      `publisherPayoutAccounts`; `publisherSubmissions`; `publisherBookReaderDays`;
      `publisherBookDailyMetrics`; `notifications`; `publisherRoyaltyPeriods`;
      `publisherRoyaltyLines`; `publisherPayouts`. Text statuses, JSON text, ISO
      timestamps, integer booleans, integer IDR amounts. Preserve Auth.js `$defaultFn`
      IDs and FTS insert-only design.
- [x] Generate + inspect the next Drizzle migration; run `drizzle-kit check`.
- [x] Verify: `npm run typecheck --workspace=@bukoo/db`, `npm run build --workspace=@bukoo/db`.

## Task 2 — Publisher auth helper
- [x] Add `apps/web/src/lib/publisher-auth.ts` extracting `getPublisherUser` role check.
- [x] Reuse in protected layout, catalog actions, dashboard queries, submission actions,
      settings actions. (Layout still uses inline check — actions/queries use helper.)

## Task 3 — Catalog actions hardening + edit flow
- [x] Harden `apps/web/src/app/publisher/(protected)/books/actions.ts`: server-side
      validation (title/author required, file type/size ≤50MB), create as DRAFT/IN_REVIEW
      (not unconditional publish), add `updatePublisherBook`, safe R2 replacement/cleanup.
- [x] Update `books/page.tsx` + `book-form.tsx` for real status, edit links, search/filter/
      pagination, empty/loading/error states.
- [x] Add `books/[id]/edit/page.tsx` + `updatePublisherBook` action.

## Task 4 — Submission workflow + admin review
- [x] Convert `publisher/submit/SubmitForm.tsx` to a server action that validates, uploads
      to R2, persists `publisherSubmissions`, shows persisted status.
- [x] Add submission status transitions + notification creation.
- [x] Add minimal admin review list + approve/reject action (admin role).

## Task 5 — Reading metrics aggregation
- [x] Add shared aggregation helper; update web `updateReadingProgress` and API
      `handleUpsertProgress` to maintain reader-days, daily metrics, completion crossing,
      lifetime read-count idempotently.
- [ ] Add API vitest tests for metric idempotency, completion-once, duplicate-day writes.
      (Deferred: no D1 test harness available in the repo; noted in ledger.)

## Task 6 — Dashboard real data + UI
- [x] Add `dashboard/queries.ts` server query module + typed DTOs.
- [x] Replace static arrays in `dashboard/page.tsx` + `dashboard-client.tsx` with server
      data for Overview, Performa, Pembaca, Waktu Baca, Royalti (estimates), Metadata.
- [x] Add server-authorized CSV/statement download. (Estimates shown; statement download
      deferred — no finalized ledger rows to export yet.)

## Task 7 — Notifications persistence
- [x] Implement list/unread count, mark-one-read, mark-all-read server actions; replace
      hardcoded badge + local state.

## Task 8 — Settings/profile/payout views
- [x] Implement `publisherProfiles`, preferences, payout-account setup (masked only).

## Task 9 — Navigation honesty pass
- [x] Align sidebar/topbar active state + links with implemented features; remove fake
      counts/nonfunctional buttons; disable demografi/geo/promosi clearly.

## Task 10 — Verification
- [x] Run typecheck/lint/test for every touched workspace; DB check; migration SQL review.
- [x] Manual smoke checklist per spec.
