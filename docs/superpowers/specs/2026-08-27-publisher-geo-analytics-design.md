# BUKOO Publisher Geo Analytics

**Date:** 2026-08-27
**Status:** Approved for implementation

## Executive Summary

Complete the publisher country analytics pipeline using country-level aggregates only. Cloudflare's `CF-IPCountry` header is normalized and stored as ISO alpha-2 on daily book aggregates. Publishers see only aggregated reader-days for their own books. No IP address, age, gender, or city is stored or displayed.

## Components

- Catch-up D1 migration for the existing `publisher_book_country_metrics` schema.
- API and web reading-progress wiring for `CF-IPCountry`.
- Publisher dashboard country aggregate query scoped to owned books and selected period.
- Reachable `Sebaran Geografis` dashboard tab with an honest empty state.

## Security and Privacy

Country is read from Cloudflare's request header and normalized to `XX` when absent or invalid. Only `bookId`, date, country code, and reader-day count are persisted. Every dashboard query is constrained by the authenticated publisher's owned book IDs.

## Verification

Inspect the migration for table/index creation only. Run DB, API, and web checks. Test country normalization and grouped output. Verify the geo tab remains empty until new reads arrive and never exposes raw location data.
