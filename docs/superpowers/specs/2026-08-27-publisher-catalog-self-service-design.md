# BUKOO Publisher Catalog Self-Service

**Date:** 2026-08-27
**Status:** Approved for implementation

## Executive Summary

Make the shared publisher catalog usable as it grows: search by title/author, filter by publication/access/language, sort by useful fields, paginate locally, link published books to the storefront, and allow safe self-service publication changes. New and unapproved books remain behind admin review.

## Behavior

- Search is case-insensitive against title and author.
- Filters include publication status, subscription access, and language.
- Sort options include title, author, reads, and most recently updated.
- Pagination uses ten rows per page and resets to page one after filter/sort changes.
- A publisher may unpublish any currently live owned book.
- A publisher may republish only a previously approved book that they took offline. IN_REVIEW, REJECTED, and DRAFT books remain admin-gated.
- Published books expose a storefront link at `/book/[id]`.

## Security and Data

All publication actions verify the authenticated publisher and ownership server-side. No database migration or API change is required. Unpublishing uses the existing `isPublished`/`publicationStatus` fields and does not modify FTS tables.

## Verification

Unit-test filtering, sorting, and pagination. Run web typecheck, lint, and tests. Browser-check both `/publisher/books` and the dashboard Katalog tab, including the publication state transitions and storefront link.
