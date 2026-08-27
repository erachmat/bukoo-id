# Publisher Dashboard Hardening Implementation Plan

> superpowers:subagent-driven-development

**Spec:** `docs/superpowers/specs/2026-08-27-publisher-dashboard-hardening-design.md`  
**Status:** Approved for implementation

## Task 1: Establish focused test seams

- [ ] Add the smallest Vitest configuration and `test` script for `apps/web`.
- [ ] Extract pure period, metric-scope, and top-book aggregation helpers where needed.
- [ ] Add regression tests for publisher isolation, inclusive month start, empty catalogs, ranking, identity, and campaign validation.

## Task 2: Fix dashboard data correctness

- [ ] Scope reader-day and daily-metric queries to authenticated publisher-owned book IDs.
- [ ] Use inclusive current-month boundaries and explicit ISO date semantics.
- [ ] Replace full-row book loading and per-book metric queries with selected columns and grouped aggregates.
- [ ] Return lifetime-ranked top five books with deterministic ordering.
- [ ] Populate publisher name from authenticated/profile data.
- [ ] Fix Royalti card totals so displayed values match their labels and scope.
- [ ] Remove the hardcoded `Gramedia Pustaka Utama` shell fallback.

## Task 3: Align authorization and page shells

- [ ] Preserve and document the public dashboard showcase exception.
- [ ] Tighten middleware role checks for the `/publisher/books` prefix.
- [ ] Correct stale protected-layout and repository documentation comments.
- [ ] Wrap notifications in `DashboardShell` and reuse the canonical publisher guard.
- [ ] Keep the public `/publisher/royalti` policy page distinct from dashboard royalty estimates.

## Task 4: Improve responsive and accessible interactions

- [ ] Add compact mobile navigation while preserving existing desktop navigation.
- [ ] Keep all implemented publisher destinations reachable on phone, tablet, and desktop.
- [ ] Add avatar-menu ARIA wiring, Escape handling, outside-click dismissal, and focus behavior.
- [ ] Make notification rows keyboard-accessible and expose action failures.
- [ ] Preserve visible pending states for logout and navigation actions.

## Task 5: Harden promotion submission

- [ ] Validate strict ISO dates, ordering, and a finite positive integer budget maximum on the server.
- [ ] Prevent duplicate submissions and provide durable form-level errors.
- [ ] Verify whether a D1 transaction is supported before using one; otherwise define partial-notification failure behavior.

## Task 6: Verify and release

- [ ] Run focused web tests after each slice.
- [ ] Run `npm run typecheck --workspace=apps/web` and `npm run lint --workspace=apps/web`.
- [ ] Run typecheck, lint, and test for every touched workspace; state any missing test script explicitly.
- [ ] Perform two-publisher data isolation QA and responsive/accessibility QA.
- [ ] Smoke-test both production domains; deploy only through the existing CI workflow.
