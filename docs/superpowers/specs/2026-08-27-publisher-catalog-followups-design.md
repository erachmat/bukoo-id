# BUKOO Publisher Catalog Follow-ups

**Date:** 2026-08-27
**Status:** Approved for implementation

## Executive Summary

Protect published catalog content from silent replacement and make large catalog maintenance faster. Replacing an approved EPUB/PDF returns the book to review, while shared catalog bulk controls apply the existing conservative publication policy per owned book.

## Behavior

- EPUB/PDF replacement on a previously approved published or unpublished book sets it to `IN_REVIEW` and not published, creates a linked submission, and notifies the publisher.
- Metadata and cover-only edits do not trigger re-review.
- Bulk publication changes operate only on selected owned books and skip ineligible records.
- Bulk publish is limited to `UNPUBLISHED`; bulk unpublish is limited to live books.
- Bulk delete hard-deletes selected owned books and removes their R2 assets after confirmation.

## Security and Data

All actions authenticate with `getPublisherUser()` and constrain reads/writes by `publisherUserId`. No migration or API change is needed. Publication changes use existing fields and do not touch FTS tables.

## Verification

Unit-test publication policy helpers. Run web typecheck, lint, and tests. Browser-check EPUB replacement review flow, metadata-only edit behavior, and bulk selection/action behavior.
