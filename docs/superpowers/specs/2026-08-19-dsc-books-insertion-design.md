# Design Document: Insert Dead Smokers Club Books (PDF → EPUB)

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Targets**: `dsc-publisher/` source files · production R2 (`bukoo-assets`) · production D1 (`bukoo-db`)
**User decision**: convert the manuscript PDFs to **EPUB** so the existing mobile EPUB reader (all settings, highlights, offline) works — no reader/API code changes.

---

## 1. Executive Summary

Publisher **fjm Penerbit** wants to share the **Dead Smokers Club** trilogy by **Adham T. Fusama** on BUKOO:
- **DSC 1** — "Dead Smokers Club" (ISBN 978-602-175711-6)
- **DSC 2** — "Dead Smokers Club 2" (ISBN 978-602-175712-3)
- **DSC 3** — "Dead Smokers Club 3" (ISBN 978-602-175713-0)

Source files (per folder): a manuscript PDF (`Naskah ... .pdf` / `DSC02-Cetak.pdf`) + a cover JPG + a cover PDF.

**Approach**: convert each manuscript PDF → **EPUB** with **calibre** (`ebook-convert`), upload EPUBs + covers to R2, insert 3 published **FREE** book rows into D1. Because these are EPUBs, the app's existing end-to-end EPUB pipeline (auth'd download → local file → reader) works with **no code changes and no API deploy**.

**Non-goals**: no PDF-reader feature work; no schema changes; no API changes; no migration.

---

## 2. Conversion

### 2.1 Pre-flight checks (terminal)
- `which ebook-convert` (calibre) and `which pdftotext` (poppler). Install if missing (prefer non-sudo; else ask user).
- `pdftotext` each PDF and sample the first page: confirm **text-based** (extractable prose). If scanned → stop and flag (OCR would be needed; quality risk).

### 2.2 Convert (per book)
```
ebook-convert "dsc-publisher/DSC 1/Naskah DSC 1 Cet 3.pdf" /tmp/dsc-1.epub \
  --title "Dead Smokers Club" --authors "Adham T. Fusama" \
  --publisher "fjm Penerbit" --isbn "978-602-175711-6" --language id \
  --cover "dsc-publisher/DSC 1/final cover dsc 1.jpg"
```
Same for DSC 2 (`DSC02-Cetak.pdf` → `dsc-2.epub`, ISBN ...712-3, cover `Cover-DSC-2A.jpg`) and DSC 3 (`Naskah DSC 3.pdf` → `dsc-3.epub`, ISBN ...713-0, cover `kover dead smoker 3.jpg`).

### 2.3 Validate each EPUB
- `unzip -t` OK (valid ZIP).
- Contains `mimetype` + at least one content file with real text (grep extracted text length).
- Page/section count is sane for a novel (target ≈ 200–500 pages; record for `totalPages`).

---

## 3. Data Insertion (production)

### 3.1 Upload to R2 (bucket `bukoo-assets`, remote)
| Object | Key |
|---|---|
| `dsc-1.epub` | `epubs/dsc-1.epub` (content-type `application/epub+zip`) |
| `dsc-2.epub` | `epubs/dsc-2.epub` |
| `dsc-3.epub` | `epubs/dsc-3.epub` |
| cover JPG (DSC 1) | `covers/dsc-1-cover.jpg` |
| cover JPG (DSC 2) | `covers/dsc-2-cover.jpg` |
| cover JPG (DSC 3) | `covers/dsc-3-cover.jpg` |

Covers are served by the web worker at `https://bukoo.id/covers/<key>` (existing `getCoverUrl` already builds this).

### 3.2 Insert D1 rows (remote, `wrangler d1 execute bukoo-db --remote`)
Per book (all `is_published = 1`, `subscription_required = 'FREE'`, `language = 'ID'`, `genre = '["Fiksi","Novel"]'`):

| column | DSC 1 | DSC 2 | DSC 3 |
|---|---|---|---|
| id | `dsc-1` | `dsc-2` | `dsc-3` |
| title | `Dead Smokers Club` | `Dead Smokers Club 2` | `Dead Smokers Club 3` |
| author | `Adham T. Fusama` | `Adham T. Fusama` | `Adham T. Fusama` |
| publisher | `fjm Penerbit` | `fjm Penerbit` | `fjm Penerbit` |
| isbn | `978-602-175711-6` | `978-602-175712-3` | `978-602-175713-0` |
| epub_key | `epubs/dsc-1.epub` | `epubs/dsc-2.epub` | `epubs/dsc-3.epub` |
| cover_key | `covers/dsc-1-cover.jpg` | `covers/dsc-2-cover.jpg` | `covers/dsc-3-cover.jpg` |
| synopsis | back-cover text (see §4) | back-cover text | back-cover text |
| totalPages | from EPUB | from EPUB | from EPUB |

Use `INSERT ... ON CONFLICT(id) DO UPDATE` (idempotent — safe to re-run).

---

## 4. Synopsis copy (from back covers)

- **DSC 1**: "Adrian—yang semula hidup sederhana di panti asuhan—tidak menyangka hidupnya berubah setelah diterima di T&T Boarding High School. Di sana ia berteman dengan para siswa eksentrik dan menemukan bakat terpendamnya. Akibat bakat itu, ia diculik sekelompok pria bertopeng dari klub misterius bernama Dead Smokers Club… Babak pertama petualangan sinting Adrian dan teman-temannya."
- **DSC 2**: "Setelah resmi bergabung dengan Dead Smokers Club, Adrian mengalami banyak petualangan sinting dan seru bersama rekan-rekannya. Namun di balik keceriaan, awan mendung datang: aib memalukan, pengkhianatan, krisis kepercayaan, dan rahasia-rahasia menegangkan akan terkuak. Tiga di antara mereka akhirnya angkat kaki dari klub… Waktunya Adrian mengangkat senapan."
- **DSC 3**: "Petualangan Adrian dan Dead Smokers Club mencapai puncaknya! Demi membebaskan Pak Tommy dan meringkus komplotan penjahat, mereka menyusup, menginterogasi, dan melawan—bukan hanya dengan kekuatan fisik, melainkan strategi cerdik dan kerja sama solid. Sebelum melawan musuh, mereka harus membujuk Daniel dan Erick kembali. Kemampuan menembak Adrian menjadi kunci kemenangan."

(To be trimmed to ~2–3 sentences for the app; final copy confirmed during implementation.)

---

## 5. Verification
1. **Local (before prod):** after conversion, load one EPUB locally (`wrangler dev` + a temporary local D1 row) to confirm the reader path accepts it — or, lighter: confirm it's a valid EPUB zip with `PK` magic + `mimetype`.
2. **Remote data check:** `curl https://api.bukoo.id/v1/books/dsc-1` with an auth token → `fileType: EPUB`, `is_accessible: true`, correct metadata.
3. **Remote download check:** `curl -H "Authorization: Bearer <token>" https://api.bukoo.id/v1/books/dsc-1/download` → `200`, `application/epub+zip`, `PK\x03\x04` magic.
4. **Cover check:** `https://bukoo.id/covers/dsc-1-cover.jpg` → 200 image.
5. `GET /v1/books/featured` / search "dead smokers" → books appear (published, FREE).
6. No mobile/API code changed → no tsc/lint/deploy needed. (State explicitly.)

---

## 6. Files / Scope
- **Produced (not committed to repo):** `/tmp/dsc-1.epub`, `/tmp/dsc-2.epub`, `/tmp/dsc-3.epub` → uploaded to R2 only.
- **Repo changes:** none (docs only: this spec + plan + task.md + SDD ledger).
- **Excluded:** PDF-reader feature, schema/migration changes, any app code.
