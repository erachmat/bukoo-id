# Retry-safe Mobile Reading Progress Sync — Implementation Plan

**Goal:** Make mobile progress retries idempotent while preserving existing progress and publisher metric semantics, legacy client compatibility, and aggregate-only publisher output.

**Architecture:** Mobile persists an immutable UUID-keyed sync payload in its SQLite outbox before sending. API requests with a valid `syncBatchId` claim a receipt and apply progress plus every existing aggregate in one atomic D1 batch. The receipt binds ID, authenticated user, book, normalized payload, and metric decisions. Requests without an ID keep the legacy behavior; malformed IDs fail before writes. An additive migration creates the receipt table. Existing reader-day and daily metric definitions remain unchanged.

**Tech Stack:** TypeScript, Expo SQLite and Expo Crypto, Hono, Drizzle ORM, Cloudflare D1/Miniflare, Vitest.

## Task 1 — Define and test the shared contract

**Files:**

- Modify `packages/shared-types/src/reading.ts` (or the existing reading DTO module discovered in the package).
- Export the shared progress sync request DTO with `syncBatchId` and the existing wire fields.
- Document reader-day, read-start, reading-seconds, lifetime-minute rounding, completion, country, and publisher privacy semantics beside the DTO.
- Add the new contract to the public shared-types barrel.

**Checks:** shared-types typecheck/build. This workspace has no lint or test script unless the package changes during implementation.

## Task 2 — Add local D1 integration coverage first

**Files:**

- Add an API Workers/Vitest config dedicated to local D1 integration while retaining the existing Node test config.
- Add a migration setup helper that applies the checked-in migrations only to isolated Miniflare D1.
- Add `apps/api/src/routes/reading-progress-sync.test.ts` with endpoint fixtures and assertions for first delivery, exact replay after lost response, distinct IDs, changed payload/scope, malformed/missing ID compatibility, concurrent duplicate delivery, injected mid-batch failure then retry, ownership, and response privacy.

**Checks:** run the focused integration test before implementation and confirm it fails for the missing contract/idempotency behavior; retain all existing API tests.

## Task 3 — Add receipt schema and reviewed migration

**Files:**

- Modify `packages/db/src/schema.ts` with the internal `reading_sync_batches` receipt table and indexes/constraints.
- Generate the additive migration and journal entry with Drizzle.
- Review generated SQL for D1 compatibility; do not add historical data or touch existing aggregates.

**Checks:** `npm run db:check --workspace=@bukoo/db`, inspect SQL, then apply through the integration harness/local D1 only.

## Task 4 — Implement atomic idempotent API path

**Files:**

- Modify `apps/api/src/routes/reading.ts` to validate optional UUIDv4 IDs and normalized payloads, compute a stable payload hash, and use an atomic D1 batch for ID-bearing requests.
- Preserve auth, book ownership/access, subscription, and existing response behavior. Missing IDs use the old path; malformed IDs return `400`; conflicting scope or payload returns `409`.
- Keep receipt writes, progress totals, reader-day rows, daily aggregates, lifetime book counters, and country aggregates in one batch; gate all effects by the receipt attempt token.
- Preserve existing metric calculations, UTC date use, per-batch lifetime-minute floor behavior, and aggregate-only responses.

**Checks:** focused integration scenarios, then the complete API test suite.

## Task 5 — Persist stable mobile outbox IDs

**Files:**

- Add Expo Crypto at the SDK-compatible version for UUID generation.
- Modify `apps/mobile/src/services/readingSync.ts` and local database initialization/migrations to add `localRevision` and outbox identity/revision fields idempotently.
- Snapshot each logical update to SQLite with a new UUID and immutable payload before sending; replay stored JSON and ID unchanged. Upgrade pre-existing queued payloads once before their next attempt.
- Serialize sync work and clear dirty state only when the acknowledged revision is still current and has no newer pending delta.
- Add mobile unit tests for outbox creation, replay identity, fresh logical update IDs, and legacy queue upgrade; replace the placeholder test script with the real suite.

**Checks:** mobile typecheck, lint, and tests.

## Task 6 — Verify all touched workspaces and finish tracking

- Run API typecheck, lint, and tests.
- Run mobile typecheck, lint, and tests.
- Run shared-types typecheck/build; explicitly report absent lint/test scripts.
- Run DB typecheck/build and migration drift check; explicitly report absent lint/test scripts.
- Inspect the final diff for aggregate-only publisher output, no Phase 3 scope, no production deployment, and no unintended historical backfill.
- Only after all checks pass, update the Phase 2 checkboxes in `task.md` and mark Phase 2 complete in `docs/publisher-dashboard-roadmap.md`.

## Self-review

- No production migration or deploy is included.
- The migration creates only a receipt table; historical metric rows remain untouched.
- The no-ID path remains available to older released clients and is explicitly documented as non-idempotent.
- A failed D1 batch cannot strand a committed receipt without its metric writes; replay after a committed batch is a no-op.
- Reader-day and read-start terminology remains aggregate activity terminology, not session terminology.
- Phase 3 and later roadmap work remain out of scope.
