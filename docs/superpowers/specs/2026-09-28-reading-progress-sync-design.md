# Design Spec — Retry-safe Mobile Reading Progress Sync

**Date:** 2026-09-28
**Status:** Implemented — locally verified; production migration/deployment not run
**Scope:** `apps/mobile`, `apps/api`, `packages/db`, `packages/shared-types`, and the publisher metric glossary

## 1. Goal

Make mobile reading-progress delivery idempotent across offline retries, lost responses, partial server failures, and concurrent duplicate requests. Preserve the existing progress and publisher-metric definitions, keep older mobile clients working, and keep publisher-facing data aggregate-only.

## 2. Current flow and failure

`ReadingSync` accumulates seconds in memory, sends a progress request, and only writes an offline row after a network error. The queued JSON has no stable request identity. The API reads `reading_progress`, writes the cumulative total, then updates `publisher_book_reader_days`, `publisher_book_daily_metrics`, `books`, and `publisher_book_country_metrics` in separate D1 operations. A response lost after the writes can therefore cause a retry to add the same seconds again; a failure between writes can leave partial state.

## 3. Contract and compatibility

- New mobile progress-sync payloads include a UUIDv4 `syncBatchId`.
- The mobile client creates a batch when it snapshots one logical progress update into its SQLite outbox. The serialized payload and ID are stored before the HTTP request. Retries resend that exact payload and ID. A later logical update gets a new ID.
- The API scopes each globally unique ID to the authenticated user and URL/body book. It also stores a SHA-256 hash of normalized progress fields. Reuse with another user, book, or payload returns `409` and performs no writes.
- A malformed supplied `syncBatchId` returns `400` and performs no writes. An omitted ID remains accepted for released clients and follows the legacy non-idempotent behavior; it is not silently rejected. Their retries can still repeat effects because the old contract carries no identity.
- A delayed replay with its original ID remains a no-op, even after later batches. A distinct ID is a new update, even if delivered late: its delta is counted and progress fields retain existing last-processed-write behavior. The contract has no client timestamp/revision for discarding a distinct-ID stale snapshot; mobile drains its outbox in creation order.
- A pre-upgrade queued row without an ID receives one UUID once, and the upgraded client persists it before retry. It cannot deduplicate a request that an old client may already have applied before that ID existed.
- Success responses contain no reader identity or row-level analytics. A duplicate with the same ID, scope, and payload returns success without a second write.

## 4. Atomic D1 design

Add an internal `reading_sync_batches` receipt table. `sync_batch_id` is the primary key; each receipt records `user_id`, `book_id`, normalized payload hash, a per-request attempt token, and the metric decision flags needed by the batch. Receipts are retained so delayed offline retries remain deduplicated; no historical rows are backfilled.

For a valid keyed request, the API builds a single `D1Database.batch()`:

1. Insert the receipt with `ON CONFLICT DO NOTHING`; record `is_start` and `is_completion` from the progress state seen inside this serialized batch.
2. Insert the distinct reader-day row only when this request owns the newly inserted receipt; capture whether that insert created a reader-day.
3. Apply the progress upsert, daily metric upsert, book lifetime counters, and country reader-day upsert. Every statement is guarded by the receipt's per-request attempt token. Upserts add deltas atomically.

D1 batches run statements sequentially and atomically. A statement failure rolls back the receipt and every effect, so a retry can claim and apply the batch. A committed batch whose response is lost leaves its receipt; a retry is a no-op. The unique receipt key and attempt token allow only one of concurrent duplicate requests to execute effects. A conflicting payload/scope is detected after the batch and returns `409` without modifying the original receipt.

Book existence, subscription access, and authentication checks stay ahead of this path. The receipt's owner comes only from authenticated context; the book comes from the route or the validated body. Existing publisher isolation continues to use the book's publisher relationship. No publisher query or response includes reader identity.

## 5. Metric glossary — preserve existing meanings

- **Reader-day:** one row per `(book, reader, UTC date)` in `publisher_book_reader_days`; not a reading session.
- **Read start:** `publisher_book_daily_metrics.read_starts` increments by one when the existing progress row is new or the reader-day is new (one increment if both apply). This is an aggregate activity count, not a session count.
- **Reading seconds:** the accepted batch delta adds to `reading_progress.reading_time_seconds` and that UTC date's daily `reading_seconds`. A replay adds zero.
- **Book lifetime reading minutes:** add `floor(batch seconds / 60)` per accepted batch to `books.read_time_minutes`, preserving existing per-batch rounding.
- **Distinct-reader lifetime count:** `books.read_count` increments once per new `(book, reader, UTC date)` row.
- **Completion:** `completed_reads` increments when progress first crosses from below 100 to 100.
- **Country reader-days:** `publisher_book_country_metrics.reader_days` increments once for a new reader-day, using normalized `cf-ipcountry` or `XX`; no IP is stored.
- **Publisher output:** publisher analytics continue to return aggregates and buckets only, never a reader identity or reader-level event history.

## 6. Mobile outbox state

The local SQLite progress row gets a monotonic `localRevision`; each logical progress mutation advances it. Each outbox row stores the revision and `syncBatchId` alongside its request payload. Only one sync operation per `ReadingSync` instance runs at a time. Acknowledging an older row clears `isDirty` only if its revision is still current and no newer unsent delta remains. This prevents an old retry response from erasing a newer local update. Existing queue rows gain these nullable/defaulted columns with idempotent `PRAGMA table_info` checks; old JSON is upgraded once before sending.

## 7. Verification

Use local D1/Miniflare integration tests through the API workspace. Cover first delivery, exact replay, two distinct IDs for one reader/book, same ID with changed payload/scope, malformed ID, legacy missing ID, two concurrent duplicates, and injected statement failure followed by successful retry. Inspect all touched aggregate tables, progress totals, ownership boundaries, and response privacy. Mobile tests cover queued ID persistence, replay of the same ID after a simulated lost response, new ID for a newer revision, and legacy outbox upgrade.

Generate and review the additive Drizzle migration, apply migrations only to isolated local D1 for validation, and run each touched workspace's typecheck/lint/test checklist. Do not apply production D1 migrations or deploy. Update `task.md` and Phase 2 roadmap status only after implementation and verification finish.

## 8. Non-goals

- Phase 3 web discovery events or attribution.
- Backfill, migration-time aggregate edits, or fabricated historical activity.
- Publisher dashboard redesign or new reader-facing product UI.
- Production migration, production seed, or deployment.
