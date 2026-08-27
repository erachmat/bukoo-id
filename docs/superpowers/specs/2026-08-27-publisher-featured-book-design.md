# BUKOO Featured Book Program

**Date:** 2026-08-27
**Status:** Approved for implementation

## Executive Summary

Create a real admin-controlled Featured Book program for publisher titles. Admins can feature published books, publishers see the badge in their catalog, and the storefront renders a real-cover featured row from D1. Empty featured inventory renders no fabricated content.

## Behavior

- `featured` is false by default; `featuredAt` records the latest admin promotion time.
- Only published books can be featured.
- Unfeaturing clears `featuredAt`.
- The storefront shows featured, published books ordered newest-featured first, limited to ten.
- Publishers can see featured status but cannot toggle it in this slice.

## Security and Data

Admin actions require server-side admin authorization. Storefront queries filter `isPublished = true` and `featured = true`. No revenue, ranking, or reader counts are invented. Migration is additive and contains no FTS operations.

## Verification

Validate DB build, migration drift, web typecheck/lint/tests, and browser flow: admin feature toggle -> publisher badge -> storefront featured row -> unfeature removes it.
