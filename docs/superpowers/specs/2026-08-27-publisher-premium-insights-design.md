# BUKOO Publisher Premium Tier Insights

**Date:** 2026-08-27
**Status:** Approved for implementation

## Executive Summary

Help publishers understand premium-reader conversion potential without exposing reader identities. For each owned premium book, aggregate distinct readers by their current subscription tier and show how many are below the required tier versus already eligible.

## Behavior

- Only books with `subscriptionRequired != 'FREE'` are considered.
- A reader's effective tier is `FREE` unless they have an ACTIVE or TRIALING subscription whose plan maps to a higher tier.
- "Below tier" means the reader's current tier cannot access the book per `isBookAccessible`.
- The dashboard shows per-book counts only, never reader identities.
- No premium books renders an honest empty state.

## Security and Privacy

Queries are scoped to the authenticated publisher's owned book IDs. Output is aggregate counts with no user IDs or individual tier data exposed.

## Verification

Unit-test the bucketing logic. Run web typecheck, lint, and tests. Browser-check premium books show tier buckets and the empty state when none exist. No database migration is required.
