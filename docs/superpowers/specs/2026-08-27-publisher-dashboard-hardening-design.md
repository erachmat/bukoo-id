# Publisher Dashboard Hardening Design

**Date:** 2026-08-27  
**Status:** Approved for implementation  
**Scope:** `apps/web` publisher dashboard and focused web regression coverage

## Executive Summary

Harden the deployed publisher dashboard around tenant-safe analytics, consistent navigation, responsive access, accessibility, and campaign validation. Preserve the existing public illustrative showcase while ensuring authenticated publisher data remains private and correctly scoped.

## Decisions

- `/publisher/dashboard` remains a public illustrative showcase for logged-out and non-publisher visitors.
- Authenticated dashboard KPIs and estimated royalties use the current calendar month, including the first day.
- Top books rank by lifetime reading activity and are labeled as lifetime metrics.
- Add the smallest viable focused web test harness; do not require a live production D1 database.
- Exclude admin campaign review, finalized royalty settlement, payout execution, demographic/geographic analytics, and unrelated site-wide performance work.

## Functional Requirements

### Analytics correctness

- Every reader-day and daily-metric aggregate must be constrained to books owned by the authenticated publisher.
- Empty catalogs must return zero values without broad metric scans.
- Current-month filters use an inclusive `YYYY-MM-01` lower bound.
- Top five books are ranked by lifetime reading activity, with deterministic tie-breaking.
- Publisher identity comes from the authenticated user/profile; no account may display another publisher's name.
- Royalty remains explicitly an estimate and must not fabricate unavailable revenue.
- Royalty-page totals must match their labels and declared scope.

### Routes and shell

- Keep the public dashboard showcase behavior unchanged and document the intentional exception.
- Protected publisher routes use the canonical publisher authorization boundary.
- Notifications renders inside `DashboardShell` with the correct active tab.
- `/publisher/books` role protection is consistent with the protected layout and submit route.
- The public `/publisher/royalti` policy/calculator page remains distinct from the authenticated dashboard royalty view.

### Responsive and accessible UX

- At phone and tablet widths, users can reach catalog, upload, notifications, settings, and promotions.
- Notification rows are keyboard-accessible controls.
- Avatar menu exposes `aria-haspopup`, `aria-expanded`, and a menu relationship; Escape and outside click dismiss it.
- Pending states remain visible for logout, navigation, and campaign submission.
- Notification failures are visible to the user.
- No text or controls overlap at approximately 390px, 600-820px, or desktop widths.

### Campaign validation

- Dates must be strict `YYYY-MM-DD` values and maintain start/end ordering.
- Budget must be a finite positive integer within a documented maximum.
- Duplicate submission is prevented while pending and errors remain visible at form level.
- Use a D1-supported transaction only if verified; otherwise keep the two writes explicit and define notification failure behavior.

## Technical Approach

- Prefer grouped Drizzle aggregates constrained by publisher-owned book IDs.
- Reuse existing `(bookId, metricDate)` index. Consider an additive `(bookId, readDate)` index only if query evidence warrants it.
- Reuse `getPublisherUser()` for server authorization.
- Extract pure period/aggregation helpers where direct database mocking would be brittle.
- Avoid schema migration unless query performance evidence requires one; inspect any generated migration for D1 and FTS5 constraints.

## Verification Plan

1. Focused tests cover cross-publisher isolation, month-start inclusion, empty catalogs, top-book ordering, publisher identity, and campaign validation.
2. Run web typecheck and lint after each implementation slice.
3. Run typecheck, lint, and test for every touched workspace as required by `AGENTS.md`.
4. Manually test two publishers with separate books and metrics.
5. Check responsive and keyboard behavior at phone, tablet, and desktop widths.
6. Smoke-test both `bukoo.id` and `publisher.bukoo.id` without applying production D1 changes directly.
