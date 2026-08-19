# SDD Ledger — Remove All Dummy Ebooks (Mobile)

Plan: `docs/superpowers/plans/2026-08-19-remove-dummy-ebooks.md`
Spec: `docs/superpowers/specs/2026-08-19-remove-dummy-ebooks-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (BookDetailScreen)**: complete — `MASTER_SAMPLE_BOOKS` (25 fake books), `DEFAULT_REVIEWS`, `sampleFallback`, hardcoded GitHub EPUB fallback all removed; `displayBook = book` (real API) with `coverUrl` mapped from R2 `coverKey`; Baca Sampel button gated on `book.sampleUrl`; offline download disabled when no `epubUrl`. ✅
- **Task 2 (StoreScreen)**: complete — `SAMPLE_STORE_BOOKS` removed; sections fed only from `/books/featured` with `coverKey`→URL mapping; honest empty state added. `isCategoryMatch` retained (genre filter for the category pills — not dummy data; spec's "delete isCategoryMatch" amended). ✅
- **Task 3 (HomeScreen)**: complete — `defaultTrending` removed; hero banner de-hardcoded ('Atomic Habit' → real first trending book, hidden when empty); trending/category books mapped from `coverKey`; empty state added. ✅
- **Task 4 (LibraryScreen)**: complete — `DEFAULT_BOOKS_LIST` + hardcoded 'Laut Bercerita' active-book fallbacks removed; active card gated on real progress; `coverKey`→URL; existing empty state retained. ✅
- **Task 5 (SearchScreen)**: complete — `exploreBooks`/`originalBooks` removed; BUKOO ORIGINAL section removed (entirely dummy); explore strip uses real `genreBooks` (hidden when empty); cover fallbacks removed. ✅
- **Task 6 (AiCompanionScreen)**: complete — `BASE_RECOMMENDATIONS` removed; real `/books/recommendations` only; empty state added. **Superset**: `BOOK_KNOWLEDGE_BASE` (canned dummy-book AI insights for Laskar Pelangi/Bumi Manusia/Laut Bercerita/Filsafat Ajaran Islam) removed from `aiCompanionService.ts` — `getBookInsight` now always returns the honest "not available" insight; dummy defaults in `AiChatSection`/`AiSummaryModal` cleaned. ✅
- **Task 7 (RelatedBooksCarousel)**: complete — re-sourced from `useRecommendedBooks()` (real `/v1/books/recommendations`), filters current book, renders nothing when empty. ✅
- **Task 8 (ReadingScreen)**: complete — `MASTER_SAMPLE_BOOKS` import + fallback URL resolutions, `OFFLINE_BOOK_ASSETS` (3 bundled epubs), `sample-book.epub` demo fallback + "Mode Demo" banner all removed; honest load error when no resolvable source; audio companion demo track fake metadata cleaned (real title, no fake author/cover). ✅
- **Task 9 (delete assets)**: complete — deleted `filsafat-ajaran-islam.epub`, `perlunya-seorang-imam.epub`, `riwayat-rasulullah.epub`, `sample-book.epub` from `apps/mobile/assets`. (Old copies remain only in transient `android/app/build/` outputs — regenerated on next build.) ✅
- **Task 10 (verify)**: ✅ `npx tsc --noEmit -p apps/mobile/tsconfig.json` exit 0; `npm run lint` exit 0 (0 errors/warnings); `npm run test` = "No tests specified for mobile yet" (stated explicitly — mobile has NO real tests). Greps: all dummy symbols + `covers.openlibrary.org`/`images.unsplash.com` → **0 hits** in `apps/mobile/src`; no `.epub` assets remain.
- **Task 11 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **Added `apps/mobile/src/services/coverUrl.ts`** (`getCoverUrl(coverKey)` → `https://bukoo.id/covers/<key>`): the API books routes return R2 `coverKey`, not `coverUrl` — without this, real books had no covers after dummy URLs were removed. Mirrors the API's own `buildCoverUrl` and web's `getCoverUrl`.
2. **Kept `isCategoryMatch` in StoreScreen** (spec said delete): it's genre-filtering logic for the category pills, not dummy data; works on real `genre` arrays. Removing it would break category filtering.
3. **Superset removals** (beyond spec inventory): HomeScreen hero banner ('Atomic Habit' hardcode), `QuickResumeCard.DEFAULT_ACTIVE_BOOK` ('Bumi Manusia' fallback), `aiCompanionService.BOOK_KNOWLEDGE_BASE` (canned insights for the removed dummy books), dummy default titles in AI components — all dummy ebook content, removed per "remove ALL dummy ebooks".
4. **`isSample` param + Baca Sampel flow kept** (per user decision) — button hidden until backend provides a real `sampleUrl`.
5. **Known follow-ups (not blockers)**: real EPUB reading in mobile needs an auth'd source — the API's `GET /v1/books/:id/download` requires auth and the reader/download pipeline (`FileSystem.downloadAsync`, epubjs WebView) sends none; real books today have `epubKey` only, so reading shows the honest "Gagal memuat buku" error until that pipeline is built. Covers now work via `coverKey` → `bukoo.id/covers/`.

## Commits
- Work is uncommitted on disk (no commit range yet).
