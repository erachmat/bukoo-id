# Publisher Dashboard Features Design

## Executive Summary

Extend the publisher portal with honest period filters, a shared owned-book catalog, per-book analytics, privacy-safe reader retention, admin campaign review, and a manual payout ledger. No demographic data or fabricated settlement amounts are introduced.

## Component Specs

- Dashboard queries resolve `this_month`, `last_month`, `all_time`, and validated custom dates with inclusive starts and exclusive ends.
- Catalog rendering is shared by the dashboard and `/publisher/books`, with publisher ownership enforced server-side.
- Book analytics aggregates daily starts, seconds, completions, unique reader-days, and retention buckets without exposing reader identity.
- Admin campaign review accepts only `SUBMITTED`/`IN_REVIEW`, records reviewer and note, and notifies the owning publisher.
- Royalti shows estimates separately from rows recorded in `publisherPayouts`; empty settlement data remains empty.

## Verification Plan

Run web typecheck, lint, and tests. Run database package typecheck/build and `drizzle-kit check` because existing database contracts are consumed. Perform authenticated browser QA for period links, catalog ownership, analytics, campaign decisions, notifications, and payout empty state.
