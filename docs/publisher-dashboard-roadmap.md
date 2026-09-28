# Publisher Dashboard Roadmap

**Last updated:** 2026-09-28

**Owner:** Product (Eko Rahmat)

**Status:** Living roadmap; operational book workflow is shipped, cross-surface measurement is next.

## Purpose and handoff

This is the source of truth for continued publisher-dashboard product work. A new Codex task should read this roadmap and the current publisher entries in the repository-root `task.md` before proposing or implementing the next phase. Update both documents as phases move forward; do not rely on chat history for product decisions.

The roadmap prioritizes publisher workflows, metric integrity, and useful UX across the production Bukoo web and mobile reading experience. It does not set delivery dates.

## Current foundation

- **Publisher web:** Publisher registration/login, public showcase, authenticated dashboard, overview and book analytics, catalog/upload workflow, CSV exports, settings, promotion requests, and royalty estimates/history are in place.
- **Book lifecycle:** Draft, submission, internal review, revision, approval/rejection, archive/restore, and bulk catalog operations were implemented and deployed in the 2026-09-27 catalog workflow. The remaining authenticated live visual/smoke check is listed under `Publisher Dashboard Figma Refresh — 2026-09-27` in `task.md`.
- **Team operations:** Catalog review, campaign review, royalty period close, and payout operations belong in Bukoo's internal workspace. Publishers use the publisher portal to submit work and see their own status and outcomes.
- **Mobile reading data:** The mobile app is the source of reader progress. Progress sync reaches the API and feeds aggregate publisher metrics. Offline retries can resend reading-time deltas; the sync contract needs a stable idempotency key before these metrics can be treated as retry-safe.
- **Web discovery:** Web book details already link readers to the mobile app. Page views and app-CTA clicks are not yet recorded as a publisher-facing discovery funnel.
- **Metric semantics:** Existing reader-day/read-start aggregates represent distinct reader/book/day activity, not reading sessions. Preserve their historical meaning; label them accurately and do not infer session counts from them.

## Product and data decisions

| Area | Decision |
|---|---|
| Product surfaces | Publisher operations stay on the web portal. The mobile app remains a reader app and a source of reading activity; there is no publisher-facing mobile portal in this roadmap. |
| Workspaces | Publisher workflows and Bukoo team workflows remain separate. Internal review and finance actions stay in the team workspace; the publisher sees relevant status, feedback, and next steps in the publisher portal. |
| Publisher accounts | One account per publisher. Member seats and publisher-team roles are out of scope. |
| Privacy | Publisher analytics expose aggregates only. Never return or display individual reader identities or reader-level event histories. |
| Web-to-mobile attribution | Attribute reading activity only when the same signed-in account and same book match, using the most recent eligible web app-CTA click within the prior seven days. Anonymous web activity stays unlinked to reader accounts. |
| Mobile metric integrity | Add a stable `syncBatchId` to the mobile progress-sync contract and deduplicate retries server-side before applying reading-time deltas or aggregate updates. Preserve existing metric history and definitions. |
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
- Preserve the current meaning of existing totals; define how duplicate, stale, malformed, and partially retried batches behave before implementation.
- Add coverage for first delivery, duplicate retry, retry after partial failure, and two distinct batches for the same reader/book.

**Exit criteria:** A replayed batch has no second effect; a new batch still contributes normally; the same definitions appear in API, stored aggregates, exports, and dashboard labels.

### Phase 3 — Web discovery and mobile-CTA measurement

- Record web book-detail views and app-CTA clicks with book and event time; capture account linkage only when the visitor is signed in.
- Attribute a later mobile reading event only to the same account and same book, using the most recent qualifying CTA click within seven days.
- Keep anonymous page views and clicks anonymous. Do not join them to a reader account or treat them as attributed reading activity.
- Keep the event-coverage start date visible to downstream analytics; do not synthesize earlier events.

**Exit criteria:** Tests cover same-account/same-book attribution, last-click precedence, the seven-day boundary, expired clicks, different books/accounts, anonymous activity, and missing event history.

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

---

*This document records product direction and implementation order. It is not a delivery-date commitment. Revisit it when product decisions change or a phase is completed.*
