# Design Spec — Fix DSC Search 500 & Reader Load Error

- **Date:** 2026-08-19
- **Status:** User-approved (implementation started)
- **Scope:** `apps/api` (search route), `apps/mobile` (search error state, reader error surfacing)
- **Related work:** `dsc-books-insertion` (2026-08-19), `real-epub-reading` (2026-08-19)

## Executive summary

Two device-QA failures were reported against the newly inserted "Dead Smokers Club"
books (`dsc-1/2/3`):

1. **Search "Dead" / "Dead Smoker" returns no results.**
   - Root cause A (blocks `Dead`): `GET /v1/books/search` returns **HTTP 500**. The route
     runs raw SQL `SELECT b.*`, which yields **snake_case** column names, but `formatBook`
     (and transitively `isBookAccessible` in `@bukoo/shared-types`) reads **camelCase**
     fields. `book.subscriptionRequired` is therefore `undefined`, and
     `isBookAccessible(userTier, undefined)` calls `bookRequiredTier.toUpperCase()` →
     `TypeError`. Verified against production via `wrangler tail` (exact stack) and live
     API (`q=Dead` → `{"error":"Internal server error"}`).
   - Root cause B (blocks `Dead Smoker`): the raw query string is bound straight into
     `books_fts MATCH ?`. A bare multi-word string is parsed by FTS5 as a **phrase** and
     `unicode61` does **no stemming**, so `dead smoker` never matches `dead smokers`.
     Verified remotely: `MATCH 'dead smoker'` → 0; `MATCH 'dead OR smoker'` → 3;
     `MATCH '"dead"* AND "smoker"*'` → 3.
   - The mobile `SearchScreen` never reads `isError`, so the 500 renders as
     "Buku tidak ditemukan" (empty state) — making the failure look like "no results".

2. **"Mulai membaca" for Dead Smokers Club shows "Gagal Memuat Buku".**
   - Server side is **proven healthy**: with a valid JWT, `GET /v1/books/dsc-1/download`
     returns HTTP 200, `application/epub+zip`, 180,377 bytes, `PK\x03\x04` magic. D1 rows
     are correct (`epub_key=epubs/dsc-1.epub`, `subscription_required=FREE`,
     `is_published=1`).
   - The mobile reader **swallows the real failure**: `downloadBookForReading` catches
     every error and returns `null`, and `ReadingScreen` then shows a generic
     "Gagal memuat buku. Periksa koneksi atau unduh kembali." — even when the real cause
     is an expired session ("Sesi berakhir, silakan masuk kembali.") or an HTTP 401/404
     from the download endpoint.

## Component specs

### 1. API — `apps/api/src/routes/books.ts`, `GET /v1/books/search`

**Goal:** return matching published books (200) for `Dead`, `Dead Smoker`, `Dead Smokers`,
and sanitize the FTS query so it is tolerant of plurals/partials and safe from operator
injection.

- Replace `SELECT b.*` with an explicit aliased projection (`bookColumns` const) mapping
  every column used by `formatBook`/`isBookAccessible` from snake_case to camelCase:
  `cover_key AS coverKey`, `epub_key AS epubKey`, `published_year AS publishedYear`,
  `total_pages AS totalPages`, `read_count AS readCount`, `rating_average AS ratingAverage`,
  `rating_count AS ratingCount`, `read_time_minutes AS readTimeMinutes`,
  `is_published AS isPublished`, `is_available_offline AS isAvailableOffline`,
  `subscription_required AS subscriptionRequired`, `created_at AS createdAt`,
  `updated_at AS updatedAt` (plus unchanged `id/title/author/publisher/description/
  synopsis/isbn/genre/tags/language`).
- **Same landmine fixed in `GET /v1/books` (genre branch)**: it also used raw `SELECT b.*`
  + `formatBook`, so `?genre=Fiksi` 500'd identically (confirmed live pre-fix). The shared
  `bookColumns` projection is now used by both `/books` (genre) and `/books/search`.
- Keep `INNER JOIN books_fts f ON b.id = f.id`, `b.is_published = 1`, `ORDER BY rank`,
  `LIMIT 20`.
- New helper `buildFtsQuery(raw: string): string`:
  1. split on whitespace;
  2. strip FTS5 operator/special characters (`" * ^ ( ) : + -`);
  3. drop empty tokens and pure boolean operator tokens (`AND|OR|NOT|NEAR`);
  4. wrap each remaining token as `"<token>"*` (quoted + prefix star);
  5. join with ` AND `;
  6. return `''` when no tokens remain.
- Route: if `buildFtsQuery` yields `''`, return `c.json([])` (avoids FTS5 syntax error on
  empty MATCH). Otherwise bind the built query into `MATCH ?`.

### 2. Mobile — search error state

**Files:** `apps/mobile/src/hooks/api/useBooksApi.ts`, `apps/mobile/src/screens/search/SearchScreen.tsx`

- `useSearchBooks` must also expose `isError` (and `refetch`).
- `SearchScreen`: when `isError` is true (and not loading), render a distinct error state
  ("Terjadi kesalahan. Coba lagi." with a retry) instead of the misleading
  "Buku tidak ditemukan" empty state.

### 3. Mobile — reader error surfacing

**Files:** `apps/mobile/src/services/bookDownload.ts`, `apps/mobile/src/screens/reading/ReadingScreen.tsx`

- `downloadBookForReading`: **remove** the `try/catch` that returns `null` on failure so
  the underlying error propagates to the caller (cache-first behavior unchanged).
- `ReadingScreen` `resolveAndLoadBook`: wrap the `downloadBookForReading(bookId)` call in
  its own `try/catch` and set `loadError` to the **actual error message** (e.g.
  "Sesi berakhir, silakan masuk kembali." or "Download failed with status 401") instead of
  the generic fallback. The existing render mapping already turns pdf/corrupt/network/
  timeout messages into the friendly Indonesian variants; other messages are shown as-is.
- **`injectBookData` — local `file://` CORS (found via device logs)**: the download now
  succeeds but the WebView bridge cannot `fetch(file://...)` from its `about:blank` origin
  → `Network or CORS error loading EPUB URL`. For local files, read the EPUB as base64 in
  3-byte-aligned byte chunks (position/length + `EncodingType.Base64`) and push them through
  the existing `__bukooPushChunk`/`__bukooLoadBookFromChunks` bridge functions, which build a
  `data:` URL → `ePub(arrayBuffer)`. Remote `http(s)` URLs keep the direct URL passthrough
  (0 base64 overhead).

## Layout / styling tokens

No visual redesign. Only two added UI strings in `SearchScreen`:
- Error title: `Terjadi kesalahan`
- Error subtitle: `Coba lagi` (retry button reuses existing button styles).

## Verification plan

1. **API local checks:** `npm run typecheck --workspace=@bukoo/api`, `npm run lint --workspace=@bukoo/api`, `npm run test --workspace=@bukoo/api` (vitest).
2. **Live API (QA token):**
   - `q=Dead` → 200, 3 rows (dsc-1/2/3).
   - `q=Dead Smoker` → 200, 3 rows.
   - `q=Dead Smokers` → 200, 3 rows.
   - `q=xyzzy` → 200, `[]`.
   - `q=Dead" OR 1=1 --` → 200, no injection leak (3 rows max, no error).
   - `GET /v1/books?genre=Fiksi` → 200, 3 rows (genre browse no longer 500s).
3. **Mobile checks:** `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile` (no test script — stated explicitly).
4. **Device QA:** search "Dead" → 3 results; tap "Mulai membaca" on Dead Smokers Club → reader opens (or, if it still fails, the real reason is now visible/logged for diagnosis).
5. **Cleanup:** remove QA throwaway user from prod D1; delete `/tmp` test files.

## Out of scope

- Device-side auth refresh hardening (tracked separately if diagnosis confirms it).
- Web (`apps/web`) search — already uses `LIKE` and is unaffected.
- Rebuilding/re-deploying the API worker is required for prod; deployment happens after
  review (the route change is in `apps/api`).
