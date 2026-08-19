# Design Document: Remove All Dummy Ebooks (Mobile)

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/mobile` (apps/mobile) only
**Related**: task.md "Mobile Feature Hardening — Real Data, Real Backend" (2026-08-18) removed fake data in profile/reading-goals; this task completes the purge for ebook content.

---

## 1. Executive Summary

The mobile app still ships a large amount of **hardcoded dummy ebook data**: fake catalogs (`MASTER_SAMPLE_BOOKS`, `SAMPLE_STORE_BOOKS`, `DEFAULT_BOOKS_LIST`, `defaultTrending`, `exploreBooks`, `originalBooks`, `BASE_RECOMMENDATIONS`), fake reviews (`DEFAULT_REVIEWS`), bundled sample EPUB assets (`assets/*.epub`), a demo-mode reading fallback (`sample-book.epub` + "Mode Demo" banner), and offline fallback assets. The D1 database `books` table is empty — these hardcoded lists are what users currently see instead of real data.

Goal: purge **all** dummy ebook data from the mobile app so every screen reads from the real API (`apps/api`, `bukoo-db`), with **honest empty states** when the backend has no books. No dummy fallbacks remain.

**Non-goals**: no API/schema changes (no new endpoints, no migrations); no changes to `apps/web`, `apps/api`, or `packages/*`; no deletion of the real publisher source PDFs in the root `sample-books/` folder (those are real source files, not app data).

---

## 2. Inventory of Dummy Ebook Data (mobile only)

| # | File | Symbol / code | Type |
|---|---|---|---|
| 1 | `src/screens/book/BookDetailScreen.tsx` | `MASTER_SAMPLE_BOOKS` (25 fake books, incl. `epubUrl` to GitHub sample EPUBs, `fileUrl` to `/public/books/*.epub`) | Hardcoded catalog + fallback |
| 2 | `src/screens/book/BookDetailScreen.tsx` | `DEFAULT_REVIEWS` (3 fake reviews), `sampleFallback`, `displayBook` merge, hardcoded download fallback URL (`github.com/IDPF/.../georgia-cfi.epub`) | Fake reviews + fallback |
| 3 | `src/screens/book/BookDetailScreen.tsx` | "Baca Sampel" button + `handleOpenReader(isSampleMode)` | Sample flow (dummy today) |
| 4 | `src/screens/store/StoreScreen.tsx` | `SAMPLE_STORE_BOOKS` (~20 books), `isCategoryMatch`, fallback `filter(b => b.section === ...)` | Hardcoded catalog fallback |
| 5 | `src/screens/home/HomeScreen.tsx` | `defaultTrending` (3 books: Moby Dick, Authority, Great Gatsby), `displayTrending` fallback | Hardcoded fallback |
| 6 | `src/screens/library/LibraryScreen.tsx` | `DEFAULT_BOOKS_LIST` (4 books), hardcoded `activeTitle/activeCover/activePercent/activeAuthor/activeBookId` fallbacks, `coverUrl || 'https://covers.openlibrary.org/...'` | Hardcoded fallbacks |
| 7 | `src/screens/search/SearchScreen.tsx` | `exploreBooks` (4), `originalBooks` (BUKOO ORIGINAL list), `data={... : exploreBooks}` fallback, hardcoded cover fallbacks | Hardcoded fallbacks |
| 8 | `src/screens/ai/AiCompanionScreen.tsx` | `BASE_RECOMMENDATIONS` (3 books), `displayRecommendations` fallback, `coverUrl || 'https://covers.openlibrary.org/...'` | Hardcoded fallback |
| 9 | `src/screens/book/components/RelatedBooksCarousel.tsx` | `Object.values(MASTER_SAMPLE_BOOKS)` as "Rekomendasi Serupa" | Dummy source |
| 10 | `src/screens/reading/ReadingScreen.tsx` | `MASTER_SAMPLE_BOOKS` import + fallback URL resolution (2 sites), `OFFLINE_BOOK_ASSETS` (3 bundled epubs), `sample-book.epub` demo fallback + "Mode Demo: Menggunakan sampel buku lokal" banner | Demo/fallback reading |
| 11 | `assets/filsafat-ajaran-islam.epub`, `assets/perlunya-seorang-imam.epub`, `assets/riwayat-rasulullah.epub`, `assets/sample-book.epub` | Bundled sample EPUB files | Assets |
| 12 | `src/screens/reading/ReadingScreen.tsx` | Audio companion demo track with fake metadata (`'Buku Sastra BUKOO'`, `'Penulis Sastra'`, hardcoded cover) | Demo audio (flag only) |
| 13 | `src/navigation/types.ts` | `isSample?: boolean` on `Reading` / `ReadingScreen` params | Keep (Baca Sampel stays) |

---

## 3. Component Specs

### 3.1 `BookDetailScreen.tsx` — real-data only book detail
- **Delete** `MASTER_SAMPLE_BOOKS` entirely.
- **Delete** `DEFAULT_REVIEWS`; seed `userReviews` state as `[]`.
- **Delete** `sampleFallback`; `displayBook` becomes `book` directly (from `GET /v1/books/:id`), keeping `resolveEpubUrl` for `book.epubUrl`/`book.fileUrl`.
- **Baca Sampel (kept, no dummy fallback):** keep the button and the `isSample` reader param, but render the button **only when real sample data exists** — gate on `book.sampleUrl` (a field the backend may provide in future; absent today ⇒ button hidden, no dummy). No hardcoded sample URL anywhere.
- **Delete** the hardcoded `github.com/IDPF/.../georgia-cfi.epub` fallback in the offline-download `onPress`; pass only `displayBook.epubUrl` (already-resolved). If no URL, disable the button (honest).
- Loading/error states stay; error state already renders "Buku tidak ditemukan." — keep, no fallback to a fake book.

### 3.2 `StoreScreen.tsx` — featured books only
- **Delete** `SAMPLE_STORE_BOOKS` and `isCategoryMatch`.
- `displayEditorsChoice/displayTrending/displayNewReleases` = `featuredBooks.editors_choice/trending/new_releases` filtered by category **without** dummy fallback.
- Add **empty state** when all sections are empty: "Belum ada buku — pustaka akan segera hadir" (dark forest theme, consistent with store).

### 3.3 `HomeScreen.tsx` — trending only
- **Delete** `defaultTrending`; `displayTrending` = `featuredData.trending` (no fallback).
- `currentBooksData` uses real `categoryBooks`/`displayTrending`; when both empty → render the existing empty/loading path honestly (hide section rather than show fake books).

### 3.4 `LibraryScreen.tsx` — library only
- **Delete** `DEFAULT_BOOKS_LIST`.
- `allLibraryItems` returns mapped real `books` or `[]` (no fallback).
- **Delete** hardcoded active-book fallbacks (`'Laut Bercerita'`, `'Leila S. Chudori'`, `'laut-bercerita'`, `activePercent = 40`, hardcoded cover). `activeProgress` null ⇒ hide/neutral QuickResume area or show empty text.
- **Delete** `coverUrl || 'https://covers.openlibrary.org/...'` fallbacks (use empty string; render placeholder via existing `avatarPlaceholder`-style pattern or null-checked Image).
- Add empty state for the tab content: "Rak kosong — buku yang kamu baca akan muncul di sini."

### 3.5 `SearchScreen.tsx` — real results only
- **Delete** `exploreBooks` and `originalBooks`.
- Explore strip: `data={genreBooks}` only; when empty, hide the strip (or render a compact empty note).
- **Delete** the BUKOO ORIGINAL section (no real data source exists — it's entirely dummy) or gate it behind a real originals list from API; **decision: remove section** until a real source exists.
- **Delete** hardcoded cover fallbacks (`item.coverUrl || 'https://covers.openlibrary.org/...'`); render `Image` only when URL present.

### 3.6 `AiCompanionScreen.tsx` — recommendations only
- **Delete** `BASE_RECOMMENDATIONS`.
- `displayRecommendations` = `apiRecommendations` mapped (no fallback); when empty → existing honest empty state ("Belum ada rekomendasi — mulai baca untuk personalisasi").
- **Delete** `coverUrl || 'https://covers.openlibrary.org/...'`.

### 3.7 `RelatedBooksCarousel.tsx` — real recommendations API
- Replace `MASTER_SAMPLE_BOOKS` source with `useRecommendedBooks()` (`GET /v1/books/recommendations`, already implemented + hooked in `AiCompanionScreen`).
- `relatedList` = recommendations filtered to exclude `currentBookId`, slice 5.
- When empty or loading → render nothing (return `null`), no placeholder books.

### 3.8 `ReadingScreen.tsx` — no sample/demo fallbacks
- **Delete** `MASTER_SAMPLE_BOOKS` import + both fallback URL resolutions (use `epubUrl`/`localEpubUri` params + downloaded path only).
- **Delete** `OFFLINE_BOOK_ASSETS` (3 bundled epubs) block.
- **Delete** `sample-book.epub` demo fallback + "Mode Demo: Menggunakan sampel buku lokal" banner (`offlineCacheWarning`).
- On failure with no resolvable source → honest `loadError` ("Gagal memuat buku. Periksa koneksi atau unduh kembali.") — no demo fallback.
- Keep `isSample` badge rendering (used by kept Baca Sampel flow).
- **Flag (decision point):** audio companion demo track at ~L1699 (`'Buku Sastra BUKOO'`, `'Penulis Sastra'`, fake cover). Recommend replacing fake metadata with real book title/author from `route.params.title` and no fake cover (or hiding until real narration exists). **Open to user — not an ebook, may be out of scope.**

### 3.9 Bundled assets — delete
- Delete `apps/mobile/assets/filsafat-ajaran-islam.epub`, `perlunya-seorang-imam.epub`, `riwayat-rasulullah.epub`, `sample-book.epub`.

### 3.10 `navigation/types.ts`
- Keep `isSample?: boolean` (Baca Sampel retained). No change.

---

## 4. Layout / Styling Tokens
- No new design tokens. Reuse existing empty-state patterns already in each screen (`styles.emptyContainer`, `Ionicons`, muted text color) and existing section styles.
- Store empty state uses the dark forest + gold palette already defined in `StoreScreen` styles.

---

## 5. Verification Plan
Per AGENTS.md, run for `apps/mobile` (the only touched workspace):
1. `npx tsc --noEmit` (or `npm run typecheck --workspace=@bukoo/mobile`)
2. `npm run lint --workspace=@bukoo/mobile`
3. `npm run test --workspace=@bukoo/mobile` — **mobile has no test script**; state explicitly, don't claim tests pass.

Additional manual checks:
- Grep for `MASTER_SAMPLE_BOOKS|SAMPLE_STORE_BOOKS|DEFAULT_BOOKS_LIST|BASE_RECOMMENDATIONS|defaultTrending|exploreBooks|originalBooks|sample-book|OFFLINE_BOOK_ASSETS|DEFAULT_REVIEWS` in `apps/mobile/src` → **0 hits**.
- Grep for `covers.openlibrary.org` and `images.unsplash.com` in `apps/mobile/src` → **0 hits** (no hardcoded cover URLs).
- Confirm `assets/*.epub` gone.

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| Baca Sampel | Keep button, gate on real `sampleUrl`, no dummy | User-selected; feature surface retained, dummy behavior removed |
| Related books | Rework to `GET /v1/books/recommendations` | User-selected; endpoint + hook already exist |
| BUKOO ORIGINAL section | Remove | Entirely dummy, no real source; re-add when real originals data exists |
| Audio companion demo track | Flag only (default: keep, replace fake title/author with real params) | Not an ebook; out of core scope but fake metadata noted |
