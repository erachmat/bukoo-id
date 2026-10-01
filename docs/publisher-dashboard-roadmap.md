# Publisher Dashboard Roadmap

**Last updated:** 2026-09-29

**Owner:** Product (Eko Rahmat)

**Status:** Phase 3 and the reading-completion/account-isolation follow-up are locally verified. Production rollout is pending; Phase 4 is next.

## Purpose and handoff

This is the source of truth for continued publisher-dashboard product work. A new Codex task should read this roadmap and the current publisher entries in the repository-root `task.md` before proposing or implementing the next phase. Update both documents as phases move forward; do not rely on chat history for product decisions.

The roadmap prioritizes publisher workflows, metric integrity, and useful UX across the production Bukoo web and mobile reading experience. It does not set delivery dates.

## Current foundation

- **Publisher web:** Publisher registration/login, public showcase, authenticated dashboard, overview and book analytics, catalog/upload workflow, CSV exports, settings, promotion requests, and royalty estimates/history are in place.
- **Book lifecycle:** Draft, submission, internal review, revision, approval/rejection, archive/restore, and bulk catalog operations were implemented and deployed in the 2026-09-27 catalog workflow. The remaining authenticated live visual/smoke check is listed under `Publisher Dashboard Figma Refresh — 2026-09-27` in `task.md`.
- **Team operations:** Catalog review, campaign review, royalty period close, and payout operations belong in Bukoo's internal workspace. Publishers use the publisher portal to submit work and see their own status and outcomes.
- **Mobile reading data:** The mobile app is the source of reader progress. Version 2 syncs use a stable outbox key and atomic D1 updates. Position-only legacy writes receive `426 CLIENT_UPGRADE_REQUIRED`; they cannot change progress or publisher metrics.
- **Web discovery:** Book-detail views and user-initiated app-CTA clicks are recorded with server time. Publisher book analytics and CSV export expose daily aggregates, with anonymous web activity kept unlinked.
- **Metric semantics:** Existing reader-day/read-start aggregates represent distinct reader/book/day activity, not reading sessions. Completion now means time-qualified coverage of every canonical five-word block in the current linear EPUB text; a chapter/page position does not count as completion. Preserve historical aggregate meanings and do not infer session counts from them.

## Product and data decisions

| Area | Decision |
|---|---|
| Product surfaces | Publisher operations stay on the web portal. The mobile app remains a reader app and a source of reading activity; there is no publisher-facing mobile portal in this roadmap. |
| Workspaces | Publisher workflows and Bukoo team workflows remain separate. Internal review and finance actions stay in the team workspace; the publisher sees relevant status, feedback, and next steps in the publisher portal. |
| Publisher accounts | One account per publisher. Member seats and publisher-team roles are out of scope. |
| Privacy | Publisher analytics expose aggregates only. Never return or display individual reader identities or reader-level event histories. |
| Web-to-mobile attribution | Attribute reading activity only when the same signed-in account and same book match, using the most recent eligible web app-CTA click within the prior seven days. Anonymous web activity stays unlinked to reader accounts. |
| Mobile metric integrity | Require a stable `syncBatchId` and coverage v2 contract; deduplicate retries server-side before applying reading-time deltas or aggregate updates. Derive completion from time-qualified visible-text coverage, and preserve historical reader-day definitions. |
| Historical data | Do not fabricate or backfill web page-view or CTA events for periods before tracking exists. Clearly show the start of trustworthy web-event coverage. |
| Royalty language | Keep estimates distinct from closed-period settlement and payout status. Never present an estimate as a finalized amount or a payout as paid before its recorded status supports that claim. |
| Production database | Web and API share the production D1 database `bukoo-db`. Any schema change must follow the repository's manual migration workflow; never apply a production migration directly. |

## Ordered roadmap

### Phase 1 — Operational book lifecycle: shipped baseline

The 2026-09-27 catalog/upload work established the first priority: a publisher can draft, submit, respond to revision requests, see a decision, and manage archived books through a coherent workflow.

**Completion state:** Implementation and production deployment are complete. The authenticated live dashboard/catalog visual check remains open in `task.md`. Address any defects found there before expanding the workflow.

**Acceptance:** Each transition keeps the book and submission state consistent; ownership is checked on every publisher action; decision and revision feedback tells the publisher what to do next; upload and catalog navigation work at desktop and mobile widths.

### Phase 2 — Production reading-data contract and retry safety

- Write a shared metric glossary for the mobile progress event, API handling, aggregate tables, and publisher dashboard labels.
- Add a stable `syncBatchId` to progress-sync requests and persist/detect processed batches server-side so offline retries do not increment reading time or reader-day aggregates twice.
- Preserve the current meaning of existing totals; define duplicate, delayed/stale, malformed, and partially retried behavior. A delayed replay with the same ID is a no-op. A different ID counts as a new delta even when late; progress fields keep last-processed-write behavior because the contract has no client revision/timestamp. Mobile drains its outbox in creation order.
- Require upgraded clients: position-only writes receive 426; malformed IDs return 400; reusing an ID with another account, book, or payload returns 409.
- Add coverage for first delivery, exact/delayed duplicate retry, retry after partial failure, concurrent duplicate delivery, and two distinct batches for the same reader/book.

**Exit criteria:** A replayed batch has no second effect; a new batch still contributes normally; the same definitions appear in API, stored aggregates, exports, and dashboard labels.

**Completion state (2026-09-28):** Implementation and local D1 verification complete. Migration `0017_mean_zeigeist.sql` is additive and reviewed; it creates only the internal retry receipt table. It was exercised by the local Miniflare D1 integration suite. No production migration or deploy was run. For rollout, apply the migration through `migrate-d1.yml`, deploy the API, then release mobile. Receipt rows are retained to deduplicate delayed retries, so storage growth should be monitored.

### Phase 3 — Web discovery and mobile-CTA measurement

- Record one book-detail view per page exposure and each explicit app-CTA click with the canonical book ID and server-received time. The client sends no account ID or event timestamp; signed-in identity comes from the web session.
- Store anonymous views/clicks only in daily aggregate counters. For signed-in CTA clicks, retain only the newest timestamp per account/book, which is the minimum state required for attribution.
- Attribute a mobile reader/book/day only when its authenticated account and canonical book match a CTA click no more than seven days before the first server receipt of its `syncBatchId`. Replay receipts do not create another attribution or aggregate increment.
- Reject ID-less legacy progress syncs with 426 and keep them outside this funnel; they cannot be safely deduplicated for attribution. Existing aggregate definitions remain distinct reader/book/day, not sessions.
- Show each book's earliest stored funnel day and selected period in publisher analytics/export. Do not backfill earlier web events or imply coverage before the first stored day.
- Document the v1 time limitation: progress payloads have no client event time, so server receipt is a proxy. Offline sync can arrive after the actual reading activity.

**Exit criteria:** Tests cover the inclusive seven-day boundary, expired clicks, same/different accounts and books, no click, anonymous events, legacy requests, first delivery/replay, and two distinct progress batches. Publisher response and CSV contain aggregate fields only; loading, empty, error, selected-range, and coverage states are clear.

**Completion state (2026-09-29):** Implemented and locally verified. Migration `0018_faithful_bromley.sql` adds daily discovery counters, one latest signed-in CTA timestamp per account/book, and an attribution flag on Phase 2 receipts. The local Miniflare D1 suite exercised the migration and sync path. Web tracking uses a best-effort beacon/keepalive request that does not block app navigation. No historical data was backfilled. Production migrations and deployment remain pending through the repository workflow.

### Reading completion and account isolation — locally verified follow-up

- Derive completion from the API's EPUB linear-spine word manifest and per-account, per-content-version five-word coverage blocks. Each word needs at least 240,000 microseconds of visible exposure; book position, chapter jumps, and legacy percentage fields cannot complete a book.
- Scope mobile progress, coverage, immutable offline outbox entries, reader settings, reading goals, bookmarks, highlights, and wishlist data to the authenticated account. Keep existing device-global rows without an account owner quarantined instead of assigning them to whichever account logs in next.
- Advance reading progress to epoch 2 on the first coverage-v2 write. Hide epoch-1 progress from reader APIs and publisher completion metrics; retain existing publisher aggregate history. The first v2 write replaces the old position/time snapshot with progress derived from new coverage.
- Require API identity checks when replaying an outbox item. Position-only legacy writes return `426 CLIENT_UPGRADE_REQUIRED`; no legacy update reaches progress or publisher metrics.

**Completion state (2026-10-01):** Implemented and locally verified, including isolated Miniflare D1 migration/sync tests and mobile/API checks. Migrations `0019`–`0021` were reviewed and exercised locally only. No production data was reset, no production migration was applied, and no deployment was run. Production rollout remains pending through `migrate-d1.yml` after review.

### Phase 4 — Publisher insight and action UX

- Present the discovery-to-reading funnel with separate web discovery, CTA, and mobile reading measures; distinguish attributed, anonymous, and unattributed totals.
- Make metric definitions, selected time range, data freshness, and incomplete-coverage states visible wherever a publisher interprets a number.
- Keep publisher navigation focused on overview, catalog, analytics, royalties, promotions, and account/notifications; link each insight to the next useful publisher action.
- Provide consistent loading, empty, error, and narrow-screen states. Preserve aggregate-only output and existing period semantics.

**Exit criteria:** A publisher can explain what each metric counts, its coverage period, and what action to take; browser QA covers desktop and narrow mobile layouts; response data contains no reader identity fields.

### Phase 5 — Campaign request, review, and outcome loop

- Align publisher campaign requests with the internal review workflow and one visible status lifecycle.
- Show actionable review feedback and next steps to the publisher; make approved, rejected, and completed states clear in the portal.
- Define campaign outcome measures from trustworthy events before presenting performance. Use the Phase 3 attribution rules where a campaign outcome depends on web-to-mobile reading.

**Exit criteria:** Publisher and team views agree on request status; unauthorized publishers cannot view or change another publisher's campaign; outcome reports distinguish measured results from unavailable data.

### Phase 6 — Royalty estimate, settlement, and payout transparency

- Present estimates, closed-period amounts, and payout execution as separate states with a plain-language methodology and relevant dates.
- Ensure publishers can identify which amounts are provisional, finalized, payable, paid, or failed, using the authoritative finance status.
- Keep finance actions and sensitive payout details in the internal workflow; expose only the publisher's own appropriate status and masked account details.

**Exit criteria:** A publisher can reconcile an estimate with a closed period and its payout status; status changes and notifications agree; exports use the same definitions as the dashboard.

## Cross-phase acceptance checks

- Enforce publisher ownership and role checks on every read and mutation; add isolation coverage for two publishers.
- Never expose reader IDs, account IDs, or row-level reading events in publisher responses, pages, or exports.
- Test aggregate accuracy for duplicate mobile sync, attribution-window boundaries, period boundaries, and empty/no-coverage states.
- Review responsive layouts and keyboard/accessibility behavior for each changed workflow.
- When a phase changes D1 schema, generate and review migration SQL, validate locally, and use only the manual `migrate-d1.yml` workflow for production application.
- Update this roadmap and `task.md` with verified completion evidence; do not mark a phase done based only on implementation or a local build.

## Explicitly out of scope

- A publisher-facing mobile dashboard or mobile publisher operations.
- Multiple user seats or role management within one publisher account.
- Reader-level identity, contact data, or individual reading histories in publisher analytics.
- Historical web-event reconstruction or fabricated analytics.
- Calling daily reader aggregates “sessions” without a real session definition and source.
- New delivery dates until product planning assigns them.

## Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-09-28 | Prioritize the book publication lifecycle first; continue with data correctness, web discovery attribution, dashboard insight UX, campaigns, then royalties. | Establish a dependable operational foundation, then build publisher-facing insight on trustworthy data. |
| 2026-09-28 | Mobile is the reader activity source, not a publisher portal. | Keep publisher operations in the web workspace while integrating real mobile reading activity. |
| 2026-09-28 | Publisher and Bukoo team workspaces stay separate; one account per publisher. | Keep publisher actions simple and internal review/finance controls in team tools. |
| 2026-09-28 | Publisher-facing metrics are aggregate-only; anonymous web traffic stays unlinked. | Protect reader privacy and avoid unsupported identity joins. |
| 2026-09-28 | Use same-account, same-book, last web CTA within seven days for attribution. | Define a bounded, explainable cross-surface funnel. |
| 2026-09-28 | Keep existing reader-day semantics and add idempotency to mobile progress sync before expanding analytics. | Avoid double-counting retries and misleading “session” claims. |
| 2026-09-28 | Retain receipts for retry-safe batches; legacy position-only writes require a client upgrade. | Delayed retries remain deduplicated, and unsafe progress writes cannot distort completion or publisher metrics. |
| 2026-09-29 | Use first server receipt time for Phase 3 read attribution until the mobile contract includes an event timestamp; keep ID-less syncs out of the funnel. | Avoid claiming offline sync time is the actual reading time or counting unsafe legacy retries. |
| 2026-10-01 | Derive completion from time-qualified linear EPUB text coverage and scope local reading state to the authenticated account. | Chapter jumps and device-global caches must not create false completion or carry one account's history into another. |

---

*This document records product direction and implementation order. It is not a delivery-date commitment. Revisit it when product decisions change or a phase is completed.*
