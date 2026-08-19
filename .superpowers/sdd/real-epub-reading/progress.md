# SDD Ledger — Real EPUB Reading (Mobile)

Plan: `docs/superpowers/plans/2026-08-19-real-epub-reading.md`
Spec: `docs/superpowers/specs/2026-08-19-real-epub-reading-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (api.ts helpers)**: complete — `API_URL` exported; `getAccessToken()` + `ensureFreshAccessToken()` added (`/users/me` ping forces the existing 401→refresh interceptor, then re-reads SecureStore). ✅
- **Task 2 (bookDownload auth)**: complete — `getDownloadUrl(bookId)` → `${API_URL}/books/${bookId}/download`; `downloadBook` now attaches `Authorization: Bearer <fresh token>` to `createDownloadResumable` and throws an honest "Sesi berakhir" error when signed out; `downloadBookForReading` (cache-first) added. ✅
- **Task 3 (ReadingScreen)**: complete — `isPublicBookUrl()` helper; public URLs still stream directly in the WebView; real books (auth-protected) now download natively then open locally; honest loadError retained. ✅
- **Task 4 (BookDetail)**: complete — `epubUrl` derived from `epubKey` via `getDownloadUrl(book.id)` (auth'd source shared by reader + offline download). ✅
- **Task 5 (verify)**: ✅
  - `npx tsc --noEmit -p apps/mobile/tsconfig.json` exit 0.
  - `npm run lint` exit 0.
  - `npm run test` = "No tests specified for mobile yet" (stated explicitly — no real mobile tests).
  - **Local API route proof** (the exact endpoint mobile calls): seeded test book `real-epub-test` in local D1 (`bukoo-db`) + EPUB in local R2 (`bukoo-assets`), ran `wrangler dev` with test `JWT_SECRET`, minted a jose HS256 token (sub `user_qa`): **no token → 401** · **with token → 200 `application/epub+zip` + `PK\x03\x04` magic bytes** · **missing book → 404**. Test row + R2 object + temp files cleaned up afterwards.
  - Static checks: `Authorization` header present on `createDownloadResumable`; `getDownloadUrl` used in BookDetail + ReadingScreen; `downloadBookForReading` used in ReadingScreen.
- **Task 6 (docs)**: complete — plan checkboxes ✅, `task.md` updated (follow-up #14 from remove-dummy-ebooks checked off + new entry), this ledger.

## Notes / decisions
- **No API/backend changes** — the auth-protected `GET /v1/books/:id/download` endpoint already existed; only the mobile download path was missing auth.
- `ensureFreshAccessToken` deliberately avoids JWT-expiry parsing — the `/users/me` ping through the axios interceptor is the single source of truth for token freshness.
- Public (non-API-host) URLs still stream via the WebView — preserves future public sample URLs.
- Manual device E2E (real seeded book → Mulai Membaca) remains a QA step for a device build; all static + local-route verification passes here.

## Commits
- `0120ee8` — `feat(mobile): real EPUB reading via authenticated download` (9 files, +310/−9), committed 2026-08-19.
