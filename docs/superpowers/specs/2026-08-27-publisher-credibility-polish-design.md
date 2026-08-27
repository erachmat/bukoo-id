# BUKOO Publisher Credibility & Polish

**Date:** 2026-08-27
**Status:** Approved for implementation

## Executive Summary

Improve the publisher portal's credibility without fabricating business data. Royalty estimates become configurable by an admin and remain explicitly labeled as estimates. Dashboard navigation becomes shareable and refresh-safe, real cover thumbnails replace decorative emoji, duplicate/stub surfaces are removed or made data-backed, book submissions become reachable from admin navigation, and the publisher registration interest form creates a real admin notification.

## Component Specs

- `platform_settings`: D1 key/value storage for admin-entered platform configuration. Only royalty pool and publisher rate are exposed in this pass.
- Admin settings: guarded form for monthly royalty pool (IDR) and publisher rate basis points, with strict numeric validation.
- Publisher dashboard: `tab` and `period` query parameters drive the selected view; metadata completeness is computed from existing book fields.
- Publisher lead form: validated server action creates notifications for all admin users. No new PII table is introduced.
- Existing unavailable demographic, geographic, and reading-time views remain unavailable until their data sources exist.

## Layout and Styling Tokens

Reuse existing admin inline styles and publisher `pds-*` styles. New controls use existing button, panel, KPI, table, and form classes. Cover thumbnails use the existing `.pds-thumb` dimensions and `/covers/<key>` route.

## Data and Security

- Admin settings and lead actions require `getAdminUser()` or equivalent server-side authorization.
- Dashboard queries remain scoped by `publisherUserId`; no publisher receives another publisher's books, metrics, notifications, or payouts.
- Royalty pool and rate are admin-entered values, with pool >= 0 and rate between 0 and 10000 basis points. Default pool remains 0 until configured.
- Migration is additive and contains no FTS5 DELETE or UPDATE operations.

## Verification Plan

- Build/typecheck `@bukoo/db` after schema changes; run `drizzle-kit check` and inspect generated SQL.
- Run web typecheck, lint, and tests where available.
- Browser QA: admin configures royalty values; publisher sees estimate; tab deep links survive refresh; covers and metadata render; lead form creates an admin notification; submission navigation is reachable.
- Complete two-publisher isolation and existing publisher click-through QA.
