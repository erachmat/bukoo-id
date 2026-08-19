# Implementation Plan: Real EPUB Reading (Mobile)

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-real-epub-reading-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile) only — no API/backend changes
**Ledger**: `.superpowers/sdd/real-epub-reading/progress.md`

---

## Task 1 — `services/api.ts`: export API_URL + token helpers

- [x] Export `API_URL` (currently module-private `const`).
- [x] Add `getAccessToken(): Promise<string | null>` — read `ACCESS_TOKEN_KEY` from SecureStore.
- [x] Add `ensureFreshAccessToken(): Promise<string | null>` — ping `api.get('/users/me')` (triggers 401→refresh via existing interceptor), re-read token, return; null when signed out.

## Task 2 — `services/bookDownload.ts`: authenticated download

- [x] `getDownloadUrl(bookId: string): string` → `${API_URL}/books/${bookId}/download`.
- [x] `downloadBook`: fetch `ensureFreshAccessToken()`; pass `{ headers: { Authorization: Bearer <token> } }` to `createDownloadResumable`; throw honest error when signed out.
- [x] `downloadBookForReading(bookId): Promise<string | null>` — cache-check → auth download → local path.

## Task 3 — `screens/reading/ReadingScreen.tsx`: resolve real books

- [x] Helper `isPublicBookUrl(url)` — http(s) and not the API host.
- [x] `resolveAndLoadBook`: public `epubUrl` → stream as today; else derive auth URL via `getDownloadUrl(bookId)` → `downloadBookForReading` → open local; keep honest loadError.
- [x] Surface download-in-progress via existing loading state.

## Task 4 — `screens/book/BookDetailScreen.tsx`: derive URL from epubKey

- [x] `displayBook.epubUrl` = `book.epubKey ? getDownloadUrl(book.id) : resolveEpubUrl(book.epubUrl || book.fileUrl)`.
- [x] Offline download button + reader both use the auth'd URL (no button-logic change).

## Task 5 — Verify

- [x] `npx tsc --noEmit -p apps/mobile/tsconfig.json` → 0 errors.
- [x] `npm run lint` → 0 errors.
- [x] `npm run test` → "No tests specified for mobile yet" (state explicitly).
- [x] Local API route proof: seed test book in local D1 + R2, `wrangler dev`, `curl` download → 200 EPUB magic bytes; 401 without token.
- [x] Static checks: `createDownloadResumable` includes `Authorization`; `getDownloadUrl` used in BookDetail + ReadingScreen.

## Task 6 — Docs

- [x] Update `task.md` (new entry, check off follow-up #14 from remove-dummy-ebooks).
- [x] Update SDD ledger `.superpowers/sdd/real-epub-reading/progress.md`.
