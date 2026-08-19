# SDD Ledger — Fix DSC Search 500 & Reader Load Error

Plan: `docs/superpowers/plans/2026-08-19-fix-dsc-search-reader.md`
Spec: `docs/superpowers/specs/2026-08-19-fix-dsc-search-reader-design.md`
Started: 2026-08-19 · Mode: subagent-driven-development

## Progress

- **Task 1 (search route fix)**: complete — `buildFtsQuery` (quoted prefix tokens joined with AND) + shared `bookColumns` aliased projection used by `/search` AND the `GET /v1/books` genre branch (which had the identical 500 — confirmed live via `?genre=Fiksi`); empty-query short-circuit. ✅
- **Task 2 (mobile search error state)**: complete — `useSearchBooks` already exposed `isError`/`refetch`; `SearchScreen` now renders "Terjadi kesalahan" + Coba Lagi on error instead of "Buku tidak ditemukan". ✅
- **Task 3 (bookDownload error propagation)**: complete — `downloadBookForReading` no longer swallows errors to `null`. ✅
- **Task 4 (ReadingScreen error surfacing)**: complete — `resolveAndLoadBook` catches download failures and sets `loadError` to the real message (render maps pdf/corrupt/network/timeout to friendly variants, others shown as-is). ✅
- **Task 6 (local file:// CORS)**: complete — device logs showed download OK but `EPUB load failed: Network or CORS error loading EPUB URL` (WebView cannot `fetch(file://)` from `about:blank`). `injectBookData` now reads local files as base64 in 3-byte-aligned chunks and assembles via the existing `__bukooPushChunk`/`__bukooLoadBookFromChunks` bridge → `ePub(arrayBuffer)`. Remote URLs keep direct passthrough. Mobile typecheck ✅ / lint ✅.
- **Task 5 (verification)**: complete —
  - API: typecheck ✅, lint 0 errors (4 pre-existing console warnings in unrelated files), vitest 8/8 ✅.
  - Mobile: typecheck ✅, lint ✅ (no test script — stated explicitly).
  - **Deployed** `bukoo-api` twice: `739bf34d` (search fix) then `c0cfc336` (genre-route fix via shared projection).
  - Live: `q=Dead` → 3, `q=Dead Smoker` → 3, `q=Dead Smokers` → 3, `q=xyzzy` → 0, injection probe `Dead" OR 1=1 --` → 0 (safe). `GET /books?genre=Fiksi` → 3, `?genre=Novel&sort=newest` → 3. `/health` 200, download dsc-1 200 + valid EPUB, detail OK.
  - Cleanup: both QA users + refresh tokens deleted from prod D1; `/tmp` files removed. ✅

## Root causes (verified against production 2026-08-19)

1. **Search `q=Dead` → 500**: raw `SELECT b.*` returns snake_case keys; `formatBook`/`isBookAccessible`
   read camelCase (`book.subscriptionRequired` is `undefined`) → `.toUpperCase()` throws. Confirmed via
   `wrangler tail` (`TypeError: Cannot read properties of undefined (reading 'toUpperCase')`) and live API.
2. **Search `q=Dead Smoker` → `[]`**: FTS5 phrase + `unicode61` no stemming (`smoker` ≠ `smokers`).
   Verified: `'dead smoker'` → 0; `'"dead"* AND "smoker"*'` → 3.
3. **Reader "Gagal memuat buku"**: server healthy (download 200 + valid EPUB w/ QA token); mobile
   `downloadBookForReading` swallows the real error into a generic message.

## Key notes / decisions
- Search fix is server-side only; mobile gets an honest `isError` state so 500s don't render as "no results".
- Reader: no speculative server changes; surface real error, then diagnose device cause via logcat if it still fails.
- QA throwaway user `qa-search-20260819@example.com` created in prod D1 for live verification (cleanup in Task 5).

## Commits
- (pending)
