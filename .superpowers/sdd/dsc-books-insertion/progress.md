# SDD Ledger — Insert Dead Smokers Club Books (PDF → EPUB)

Plan: `docs/superpowers/plans/2026-08-19-dsc-books-insertion.md`
Spec: `docs/superpowers/specs/2026-08-19-dsc-books-insertion-design.md`
Started: 2026-08-19 · Mode: executing-plans (operational/data task — no app code)

## Progress

- **Task 1 (pre-flight)**: complete — pdftotext present; calibre absent → **PyMuPDF + ebooklib** used (no sudo). All 3 manuscripts text-based (not scanned): 192 / 196 / 294 pp. ✅
- **Task 2 (convert)**: complete — DSC 1 → 19 titled chapters; DSC 2 → 22 titled chapters; DSC 3 (no chapter headings in manuscript) → "Cerita Sebelumnya" + "Bagian N" chunks + tail chapters (ERICK / ABOUT THE SCHOOL / TERIMA KASIH). Metadata (title/author/publisher/ISBN/lang) embedded. Front covers **cropped from full spreads** (right ~48%, portrait ~0.68) and embedded. ✅
- **Task 3 (validate)**: complete — all valid EPUB zips with `mimetype`, nav/TOC, cover; 247k/252k/340k visible text chars; 180/245/216 KB files. ✅
- **Task 4 (R2 upload)**: complete — 3 EPUBs (`epubs/`) + 3 covers (`covers/`) uploaded to **production** `bukoo-assets`. ✅
- **Task 5 (D1 insert)**: complete — 3 rows inserted into **production** `bukoo-db` (FREE, published, ID, genre Fiksi/Novel, ISBNs, synopses, total_pages). Idempotent upsert. ✅
- **Task 6 (verify)**: ✅ D1 rows + FTS (3 rows) confirmed; covers 200 `image/jpeg` at `bukoo.id/covers/covers/...`; EPUBs 200 `application/epub+zip` + `PK\x03\x04` at `bukoo.id/covers/epubs/...`; API download route live (401 unauthenticated). Device E2E left as manual QA (task.md item).
- **Task 7 (docs)**: complete — plan checkboxes ✅, task.md updated, this ledger.

## Key notes / decisions
1. **No calibre**: used PyMuPDF (text extraction, per-page blocks) + ebooklib (EPUB3) in a one-off script (`/tmp/convert_dsc.py`, not committed).
2. **Chapter detection**: ALL-CAPS title at page top (optionally after a page-number line). DSC3 has **no chapter headings** → chunked into ~12-page "Bagian N" sections so TOC/pagination stay usable.
3. **Covers are full spreads** in both JPG and PDF form → front cover cropped from the right ~48% (text-position analysis in cover PDFs confirmed front-cover side).
4. **Back-matter ads dropped** ("ADHAM WHO?", "TELAH TERBIT!", "SEGERA TERBIT"); thanks/excerpt/teaser chapters kept.
5. **total_pages** = original print page counts (192/196/294) as display metadata.
6. **No app/API code changed** — books are EPUBs, so the auth'd EPUB pipeline (`real-epub-reading` task) handles reading + offline download. No deploy needed.
7. **publishedYear left null** (not available from source materials).

## Commits
- (docs-only commit pending — no app code in this task)
