# Implementation Plan: Fix DSC Search 500 & Reader Load Error

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-fix-dsc-search-reader-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/api` (apps/api) + `@bukoo/mobile` (apps/mobile)
**Ledger**: `.superpowers/sdd/fix-dsc-search-reader/progress.md`

---

## Task 1 — `apps/api/src/routes/books.ts`: fix search 500 + tolerant FTS query

- [x] Add helper `buildFtsQuery(raw: string): string` — split on whitespace, strip FTS5 special chars (`" * ^ ( ) : + -`), drop empty + boolean-operator tokens (`AND|OR|NOT|NEAR`), wrap each token as `"<token>"*`, join with ` AND `, return `''` when no tokens remain.
- [x] Replace `SELECT b.*` with a shared `bookColumns` aliased projection (snake_case → camelCase) covering every field `formatBook`/`isBookAccessible` reads:
  `id, title, author, publisher, description, synopsis, isbn, cover_key AS coverKey, epub_key AS epubKey, genre, tags, language, published_year AS publishedYear, total_pages AS totalPages, read_count AS readCount, rating_average AS ratingAverage, rating_count AS ratingCount, read_time_minutes AS readTimeMinutes, is_published AS isPublished, is_available_offline AS isAvailableOffline, subscription_required AS subscriptionRequired, created_at AS createdAt, updated_at AS updatedAt`.
- [x] Bind `buildFtsQuery(q)` into `MATCH ?`; return `c.json([])` early when the built query is empty.
- [x] Keep `INNER JOIN books_fts f ON b.id = f.id`, `b.is_published = 1`, `ORDER BY rank`, `LIMIT 20`.
- [x] Apply `bookColumns` to the `GET /v1/books` genre branch too (identical 500 confirmed live: `?genre=Fiksi` → `Internal server error`).

## Task 2 — `apps/mobile/src/hooks/api/useBooksApi.ts` + `screens/search/SearchScreen.tsx`: honest error state

- [x] `useSearchBooks` — expose `isError` (and `refetch`) from the TanStack Query result (already returned by the hook; no change needed).
- [x] `SearchScreen` — when `isError && !isSearching`, render "Terjadi kesalahan" state with a retry (reuse existing button/empty styles) instead of "Buku tidak ditemukan".

## Task 3 — `apps/mobile/src/services/bookDownload.ts`: stop swallowing reader errors

- [x] `downloadBookForReading` — remove the `try/catch` that returns `null`; let the underlying error propagate (cache-first behavior unchanged).

## Task 4 — `apps/mobile/src/screens/reading/ReadingScreen.tsx`: surface the real reason

- [x] In `resolveAndLoadBook`, wrap `downloadBookForReading(bookId)` in its own `try/catch`; on failure set `loadError` to the actual error message (e.g. "Sesi berakhir, silakan masuk kembali." / "Download failed with status 401") instead of the generic fallback. Keep generic fallback for the outer catch.

## Task 6 — `apps/mobile/src/screens/reading/ReadingScreen.tsx`: fix local file:// CORS (reader still failed)

- [x] Root cause (device logs): download now succeeds (`[ReadingScreen] Found local cached book path: file:///.../books/dsc-1.epub`) but the WebView bridge `fetch`/XHR on `file://` is blocked from the `about:blank` origin → `EPUB load failed: Network or CORS error loading EPUB URL`.
- [x] `injectBookData`: keep direct URL passthrough for remote `http(s)`; for local `file://` read the EPUB as base64 in 3-byte-aligned byte chunks (245760 B) via `FileSystem.readAsStringAsync(position/length, Base64)`, push each with `__bukooPushChunk`, assemble with `__bukooLoadBookFromChunks('application/epub+zip', locs, targetCfi)` → `data:` URL → `ePub(arrayBuffer)`; unmount guards between async reads.
- [x] Mobile typecheck ✅ / lint ✅.

## Task 5 — Verification

- [x] `npm run typecheck --workspace=@bukoo/api && npm run lint --workspace=@bukoo/api && npm run test --workspace=@bukoo/api`.
- [x] `npm run typecheck --workspace=@bukoo/mobile && npm run lint --workspace=@bukoo/mobile` (mobile has no test script — stated explicitly).
- [x] Live API curls with QA token: `q=Dead`, `q=Dead Smoker`, `q=Dead Smokers` → 200 + 3 dsc rows; `q=xyzzy` → 200 `[]`; injection probe `q=Dead" OR 1=1 --` → safe.
- [x] Cleanup QA user (prod D1) + `/tmp` test files.
- [x] Update ledger + root `task.md` entry.

## Files touched
- `apps/api/src/routes/books.ts`
- `apps/mobile/src/hooks/api/useBooksApi.ts`
- `apps/mobile/src/screens/search/SearchScreen.tsx`
- `apps/mobile/src/services/bookDownload.ts`
- `apps/mobile/src/screens/reading/ReadingScreen.tsx`
