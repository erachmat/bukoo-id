# Implementation Plan: Remove All Dummy Ebooks (Mobile)

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-remove-dummy-ebooks-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile) only
**Ledger**: `.superpowers/sdd/remove-dummy-ebooks/progress.md`

---

## Task 1 — `BookDetailScreen.tsx`: real-data-only detail

- [x] Delete `MASTER_SAMPLE_BOOKS` (lines ~25–354).
- [x] Delete `DEFAULT_REVIEWS`; `useState<UserReview[]>([])`.
- [x] Delete `sampleFallback`; `displayBook = book` (keep `resolveEpubUrl`).
- [x] Gate "Baca Sampel" button on `book.sampleUrl` (hidden otherwise); keep `isSample` param + `handleOpenReader`.
- [x] Remove hardcoded `github.com/IDPF/...` fallback in offline download `onPress`; disable download when no `epubUrl`.

## Task 2 — `StoreScreen.tsx`: featured only

- [x] Delete `SAMPLE_STORE_BOOKS` + `isCategoryMatch`.
- [x] Section lists = API data only (no fallback); add empty state when all empty.

## Task 3 — `HomeScreen.tsx`: trending only

- [x] Delete `defaultTrending`; `displayTrending` = `featuredData.trending`; hide section when empty.
- [x] (superset) Hero banner de-hardcoded from 'Atomic Habit' → real featured book, hidden when empty.

## Task 4 — `LibraryScreen.tsx`: library only

- [x] Delete `DEFAULT_BOOKS_LIST`; `allLibraryItems` returns `[]` when no books.
- [x] Delete hardcoded active-book fallbacks (`'Laut Bercerita'` etc.) and cover URL fallbacks; add empty state.

## Task 5 — `SearchScreen.tsx`: real results only

- [x] Delete `exploreBooks` + `originalBooks`; explore strip uses `genreBooks` only.
- [x] Remove BUKOO ORIGINAL section.
- [x] Remove hardcoded cover fallbacks.

## Task 6 — `AiCompanionScreen.tsx`: recommendations only

- [x] Delete `BASE_RECOMMENDATIONS`; use `apiRecommendations` only; remove cover fallback.
- [x] (superset) Remove `BOOK_KNOWLEDGE_BASE` dummy AI insights; honest fallback only.
- [x] (superset) `QuickResumeCard` `DEFAULT_ACTIVE_BOOK` removed; card hidden without real data.

## Task 7 — `RelatedBooksCarousel.tsx`: real API

- [x] Use `useRecommendedBooks()`; filter out `currentBookId`; render nothing when empty/loading.

## Task 8 — `ReadingScreen.tsx`: no sample/demo fallbacks

- [x] Remove `MASTER_SAMPLE_BOOKS` import + 2 fallback resolutions.
- [x] Remove `OFFLINE_BOOK_ASSETS` block.
- [x] Remove `sample-book.epub` demo fallback + "Mode Demo" banner.
- [x] Clean audio companion demo track fake metadata (use real `route.params.title`, drop fake author/cover).

## Task 9 — Delete bundled assets

- [x] Delete `apps/mobile/assets/filsafat-ajaran-islam.epub`, `perlunya-seorang-imam.epub`, `riwayat-rasulullah.epub`, `sample-book.epub`.

## Task 10 — Verify

- [x] `npm run typecheck --workspace=@bukoo/mobile` (or `npx tsc --noEmit`).
- [x] `npm run lint --workspace=@bukoo/mobile`.
- [x] `npm run test --workspace=@bukoo/mobile` — expect "no test script"; state explicitly.
- [x] Grep: `MASTER_SAMPLE_BOOKS|SAMPLE_STORE_BOOKS|DEFAULT_BOOKS_LIST|BASE_RECOMMENDATIONS|defaultTrending|exploreBooks|originalBooks|sample-book|OFFLINE_BOOK_ASSETS|DEFAULT_REVIEWS` in `apps/mobile/src` → 0 hits.
- [x] Grep: `covers.openlibrary.org|images.unsplash.com` in `apps/mobile/src` → 0 hits.
- [x] Confirm `apps/mobile/assets/*.epub` gone.

## Task 11 — Docs

- [x] Update `task.md` with new completed entry.
- [x] Update SDD ledger `.superpowers/sdd/remove-dummy-ebooks/progress.md`.
