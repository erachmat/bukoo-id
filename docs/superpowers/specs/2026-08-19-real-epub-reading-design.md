# Design Document: Real EPUB Reading (Mobile) — Authenticated Book Access

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/mobile` (apps/mobile) only
**Predecessor**: "Remove All Dummy Ebooks" (commit `a1e6483`) flagged this as the follow-up blocker.

---

## 1. Executive Summary

After the dummy ebooks purge, the mobile reader cannot open real books: the API returns an R2 `epubKey` (not a public `epubUrl`), and the only way to fetch the EPUB is the **authenticated** `GET /v1/books/:id/download` endpoint. The reader's WebView fetches remote URLs with **no Authorization header** (and `epubjs` fetches internally, so we can't inject one), while `bookDownloadService` uses `FileSystem.downloadAsync`/`createDownloadResumable` with **no headers** either.

This task makes real EPUB reading work **without any API/backend change** by:
1. Downloading the EPUB on the **native side with the Bearer token** (via `FileSystem.createDownloadResumable` custom `headers`), then
2. Opening the **local file** in the reader — a path `ReadingScreen` already fully supports (and it gives offline caching for free).

**Non-goals**: no API/DB/schema changes, no signed-URL endpoints (would need S3 sigv4 signing in Workers — unnecessary), no changes to `apps/web`/`apps/api`/`packages/*`.

---

## 2. Architecture

```
BookDetail/Reading (mobile)
   │  book.epubKey (R2 key)  ← GET /v1/books/:id (already works)
   ▼
derive download URL: {API_URL}/books/{bookId}/download
   ▼
ensure fresh access token (SecureStore; ping /users/me triggers 401→refresh)
   ▼
FileSystem.createDownloadResumable(url, cacheDir/bookId.epub,
                                   { headers: { Authorization: Bearer <token> } })
   ▼
local file (validated: magic bytes PK\x03\x04)
   ▼
ReadingScreen opens local file via __bukooLoadBook(file://...)   ← existing path
```

Everything downstream of the local file (epubjs, pagination, highlights, offline list) already exists and is untouched.

---

## 3. Component Specs

### 3.1 `services/api.ts` — expose token + base URL
- **Export `API_URL`** (currently module-private `const`).
- **Add `getAccessToken(): Promise<string | null>`** — reads `ACCESS_TOKEN_KEY` from SecureStore (thin wrapper).
- **Add `ensureFreshAccessToken(): Promise<string | null>`** —
  1. read current token; if none → return null (signed out).
  2. `try { await api.get('/users/me'); } catch {}` — the existing response interceptor transparently refreshes an expired token on 401 and re-writes SecureStore.
  3. re-read token from SecureStore and return it.
  - Rationale: `createDownloadResumable` is outside the axios interceptors, so we must hand it a *fresh* token. A cheap authenticated ping is the most reliable way to force a refresh without duplicating JWT-expiry parsing.

### 3.2 `services/bookDownload.ts` — authenticated download
- **Add `getDownloadUrl(bookId: string): string`** → `` `${API_URL}/books/${bookId}/download` `` (imports exported `API_URL`).
- **Modify `downloadBook(bookId, remoteUrl, onProgress)`**: before creating the resumable, `const token = await ensureFreshAccessToken();` and pass `{ headers: { Authorization: \`Bearer ${token}\` } }` as the `createDownloadResumable` options (currently `{}`). If no token → throw an honest error ("Sesi berakhir, silakan masuk kembali.") so callers show a clear message instead of a silent 401 file.
  - Extension detection stays URL-based (`getExtension` → `.epub` for the `/download` URL). The endpoint always returns `application/epub+zip`, so `.epub` is correct.
- **Add `downloadBookForReading(bookId): Promise<string | null>`** convenience used by the reader:
  1. `remoteUrl = getDownloadUrl(bookId)`
  2. `getLocalBookPath(bookId, remoteUrl)` → if cached & valid, return it.
  3. else `downloadBook(bookId, remoteUrl, cb)` → return local path (or `null` on failure).

### 3.3 `screens/reading/ReadingScreen.tsx` — resolve real books
- **`resolveAndLoadBook` priority (unchanged ordering, new source):**
  1. `localEpubUri` param (already-downloaded / deep link).
  2. `bookDownloadService.getLocalBookPath(bookId, remoteUrl)` cache hit.
  3. `remoteUrl`:
     - if `epubUrl` param is a **public** `http(s)` URL → **stream directly** in WebView (unchanged behavior, keeps support for future public sample URLs / external EPUBs).
     - else (real book with `epubKey`, i.e. no public URL) → `remoteUrl = bookDownloadService.getDownloadUrl(bookId)` and **download-then-open-local** via `downloadBookForReading` (auth'd), with a loading state.
  4. Failure → existing honest `loadError` ("Gagal memuat buku. Periksa koneksi atau unduh kembali."), no demo fallback.
- **Distinguishing "auth URL" vs "public URL"**: treat as public only when `epubUrl` starts with `http(s)://` and is **not** the API host (`api.bukoo.id`). A small helper `isPublicBookUrl(url)`.
- Loading UX: reuse the existing `isLoading`/spinner path while `downloadBookForReading` runs.

### 3.4 `screens/book/BookDetailScreen.tsx` — derive URL from `epubKey`
- In `displayBook`, derive `epubUrl`:
  ```
  epubUrl: book.epubKey
    ? bookDownloadService.getDownloadUrl(book.id)
    : resolveEpubUrl(book.epubUrl || book.fileUrl)
  ```
- Offline "Unduh untuk Dibaca Offline" button then calls the auth'd `download()` (via `useBookDownload` → `downloadBook`) with the correct URL. **No change to the button logic** — it just gets a real URL now.
- `handleOpenReader` passes the same `epubUrl`; ReadingScreen routes auth-URLs to download-then-open.
- Keeps `sampleUrl` gating from the previous task (untouched).

### 3.5 `hooks/useBookDownload.ts` — no change
It already delegates to `bookDownloadService.downloadBook`, which now carries auth headers. (Verify only.)

---

## 4. Edge Cases & Decisions

| Case | Handling |
|---|---|
| Signed-out user | `ensureFreshAccessToken` returns null → download throws honest error; reader shows load error. (Reading already requires login in the app flow.) |
| Expired token | `/users/me` ping triggers the existing refresh interceptor; fresh token re-read from SecureStore. |
| Large EPUB | `createDownloadResumable` streams to disk (no base64-in-JS) — consistent with the earlier Base64 double-memory fix. |
| PDF vs EPUB | Endpoint returns EPUB; URL-derived extension `.epub` is correct. `getLocalBookPath` already purges mismatched caches. |
| Public future sample URL | Still streams directly via WebView (no auth needed) — preserved. |
| Cache invalidation | Fingerprint = local file size (existing `getBookSourceFingerprint`) — re-downloads change size → stale locations discarded. |

---

## 5. Verification Plan
Per AGENTS.md for `apps/mobile`:
1. `npx tsc --noEmit -p apps/mobile/tsconfig.json` → 0 errors.
2. `npm run lint` → 0 errors.
3. `npm run test` → mobile has **no real tests** ("No tests specified for mobile yet") — stated explicitly.
4. **Local API route proof** (validates the endpoint mobile will call): in `apps/api`, insert a test book row into local D1 (`wrangler d1 execute --local`), upload a small sample EPUB to local R2, then run `wrangler dev` and `curl -H "Authorization: Bearer <token>" /v1/books/<id>/download` → expect 200 with `application/epub+zip` + `PK\x03\x04` magic bytes; and 401 without the header.
5. Static check: grep `createDownloadResumable` call now includes `Authorization` header; `getDownloadUrl` used by BookDetail + ReadingScreen.
6. Manual device note: seed a real book + R2 object, open detail → Mulai Membaca → book renders; offline download works; list shows in "Diunduh".

---

## 6. Files Touched
| File | Change |
|---|---|
| `apps/mobile/src/services/api.ts` | export `API_URL`; add `getAccessToken`, `ensureFreshAccessToken` |
| `apps/mobile/src/services/bookDownload.ts` | auth header on `downloadBook`; add `getDownloadUrl`, `downloadBookForReading` |
| `apps/mobile/src/screens/reading/ReadingScreen.tsx` | resolve real-book auth URL → download-then-open; keep public-URL streaming |
| `apps/mobile/src/screens/book/BookDetailScreen.tsx` | derive `epubUrl` from `epubKey` via `getDownloadUrl` |
| `apps/mobile/src/hooks/useBookDownload.ts` | verify only (no change expected) |
