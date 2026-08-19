# Implementation Plan: Insert Dead Smokers Club Books (PDF → EPUB)

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-dsc-books-insertion-design.md`
**Mode**: `superpowers:executing-plans` (operational/data task — no app code)
**Targets**: production R2 (`bukoo-assets`) + production D1 (`bukoo-db`)
**Ledger**: `.superpowers/sdd/dsc-books-insertion/progress.md`

---

## Task 1 — Pre-flight

- [x] Confirm `pdftotext` available; calibre NOT installed → used PyMuPDF + ebooklib (no sudo).
- [x] All 3 manuscripts are **text-based** (not scanned): DSC 1 = 192 pp, DSC 2 = 196 pp, DSC 3 = 294 pp.

## Task 2 — Convert PDF → EPUB

- [x] Chapter detection: ALL-CAPS title lines (with optional page-number prefix); dropped title-page/author-name + ad chapters ("ADHAM WHO?", "TELAH TERBIT!", "SEGERA TERBIT").
- [x] DSC 1 → 19 titled chapters; DSC 2 → 22 titled chapters; DSC 3 (no headings) → "Cerita Sebelumnya" + "Bagian N" chunks + tail chapters (ERICK / ABOUT THE SCHOOL / TERIMA KASIH).
- [x] Metadata set in EPUB: title, author (Adham T. Fusama), publisher (fjm Penerbit), ISBN, language id, cover.
- [x] Cover: JPGs/PDFs are **full spreads** → cropped front cover (right ~48%, aspect ~0.68) embedded in EPUB + exported for R2.

## Task 3 — Validate

- [x] All 3 EPUBs: valid ZIP, `mimetype` = `application/epub+zip`, nav/TOC present, cover present, visible text 247k/252k/340k chars.
- [x] Sizes: 180 KB / 245 KB / 216 KB (compact covers 61–123 KB).

## Task 4 — Upload to production R2 (`bukoo-assets`)

- [x] `epubs/dsc-1.epub` · `epubs/dsc-2.epub` · `epubs/dsc-3.epub` (`application/epub+zip`).
- [x] `covers/dsc-1-cover.jpg` · `covers/dsc-2-cover.jpg` · `covers/dsc-3-cover.jpg` (`image/jpeg`).

## Task 5 — Insert production D1 rows (`bukoo-db`)

- [x] `dsc-1` Dead Smokers Club · `dsc-2` Dead Smokers Club 2 · `dsc-3` Dead Smokers Club 3 — all `FREE`, `is_published=1`, `language=ID`, genre `["Fiksi","Novel"]`, ISBNs 978-602-175711-6 / -712-3 / -713-0, total_pages 192/196/294, synopses from back covers. Idempotent `ON CONFLICT(id) DO UPDATE`.

## Task 6 — Verify (production)

- [x] D1: 3 rows present; FTS index populated (`books_fts MATCH 'dead OR smokers OR club'` → 3).
- [x] Covers: `https://bukoo.id/covers/covers/dsc-{1,2,3}-cover.jpg` → 200 `image/jpeg` (exact sizes).
- [x] EPUBs: `https://bukoo.id/covers/epubs/dsc-{1,2,3}.epub` → 200 `application/epub+zip`, `PK\x03\x04` magic, exact sizes.
- [x] API `GET /v1/books/dsc-1/download` → 401 without token (route live, auth enforced).
- [ ] (manual/device) Authenticated mobile flow: detail → Mulai Membaca renders EPUB; offline download works (uses same auth'd pipeline verified in `real-epub-reading`).

## Task 7 — Docs

- [x] `task.md` updated; SDD ledger created.
- [ ] (final) Commit docs.
