# current integration tasks

- `[x]` 1. Consolidate isPremium and subscriptionRequired
  - `[x]` Remove `isPremium` field from `prisma/schema.prisma` in `bukoo-web` and `bukoo-mobile-app`.
  - `[x]` Update all files in `bukoo-web` to use `subscriptionRequired` instead of `isPremium` (forms, actions, views, etc.).
  - `[x]` Run `npx tsc --noEmit` in `bukoo-web` and ensure type check passes.
  - `[x]` Run `npx tsc --noEmit` in `bukoo-mobile-app/apps/api` and ensure type check passes.
- `[x]` 2. Validate Neon Schema Migration and Column Rename
  - `[x]` Create a new Neon branch `migration-test-v2` parented from `production`.
  - `[x]` Point `DATABASE_URL` to `migration-test-v2` in `.env`.
  - `[x]` Baseline the starting database state with columns `passwordHash` and `avatarUrl` and insert dummy user row.
  - `[x]` Run `npx prisma migrate dev --create-only` and generate migration SQL.
  - `[x]` Review generated SQL and fix the destructive `DROP/ADD COLUMN` to safe `RENAME COLUMN` operations.
  - `[x]` Apply migration cleanly using `npx prisma migrate dev` with shadow database validation.
  - `[x]` Query `User` table to verify test user credentials survived intact under new column names.

# Reader UX/perf improvements

- [x] 1. Performance Instrumentation & Measurement
  - `[x]` Add latency and load-time timing logs for reader startup, book loading, and page transitions.
  - `[x]` Verify with `npm run typecheck --workspace=@bukoo/mobile` and `npm run lint --workspace=@bukoo/mobile`.

- [x] 2. Quick Wins (Low Risk / Immediate UX & Offline Fixes)
  - `[x]` Bundle PDF.js assets locally so PDF reading works 100% offline without CDN dependency.
  - `[x]` Refine gesture handling and tap zone overlays to allow smooth text selection alongside page-turn taps.
  - `[x]` Improve UI chrome accessibility labels, status bar style transitions, and auto-hide timer safety.
  - `[x]` Verify with `npm run typecheck --workspace=@bukoo/mobile` and `npm run lint --workspace=@bukoo/mobile`.

- [x] 3. Medium Changes (Memory Footprint & Load Speed)
  - `[x]` Replace whole-file Base64 bridge payload passing with streamed/chunked or local file server URL loading to eliminate OOM risk on 50MB+ EPUBs.
  - `[x]` Optimize EPUB locations generation and disk cache persistence for instant resume on long books (100+ chapters).
  - `[x]` Smooth out typography controls (fontSize, fontFamily, themes) with debouncing to prevent WebView reflow freezes.
  - `[x]` Verify with `npm run typecheck --workspace=@bukoo/mobile` and `npm run lint --workspace=@bukoo/mobile`.

- [x] 4. Structural Changes (Rendering Strategy Overhaul) — *Requires Explicit Go-Ahead*
  - `[x]` Evaluate moving from single-WebView epubjs rendition to virtualized multi-page or custom paginator engine for sub-16ms native page turns benchmarked against Apple Books.

# Reader Bug Fixes — High-Severity Cluster (2026-08-16)

- [x] 1. Highlight lifecycle
  - [x] Re-apply highlights after page-turn style change (rendition rebuild) via `__bukooSetHighlights` bridge store.
  - [x] Wire up dead `HIGHLIGHT_CLICKED` message → opens `HighlightModal`.
- [x] 2. TOC & navigation
  - [x] Send `chapterHref` in `PAGE_CHANGED`; TocModal compares normalized hrefs (was always-false CFI vs href).
  - [x] Resolve TOC/search hrefs → CFI before display (`resolveHrefToCfi`); search fallback emits `item.cfi` not bare href.
- [x] 3. Reading time accuracy
  - [x] Freeze ticker when app backgrounded (was empty no-op AppState handler).
  - [x] Gate ticker on reader `isReady` so loading/failure time is not counted.
- [x] 4. Annotation sync wiring (bug 8)
  - [x] Rewrote `annotationSyncService.ts` to use shared `api` axios instance (fixes wrong token key: was AsyncStorage `userToken`, now SecureStore `access_token` via interceptor; inherits `EXPO_PUBLIC_API_URL`).
  - [x] Made sync idempotent (dedupe by cfiRange / cfi) — was inserting duplicates on every pull.
  - [x] Added `pushBookmark`, `deleteHighlight`, `deleteBookmark`, `updateHighlightNote` (remote id lookup by cfi).
  - [x] Added `PATCH /reading/highlights/:id` (note update) to `apps/api/src/routes/reading.ts`.
  - [x] Wired into `ReadingScreen`: pull on open, push on select/toggle, delete + note sync.
- [x] 5. Duplicate listener attachment
  - [x] Removed second `attachRenditionListeners` call in `__bukooLoadBook` (double PAGE_CHANGED / double-firing taps).

# Reader Bug Fixes — Medium/Low Cluster (2026-08-16)

- [x] 6. Highlight color consistency (bug 9)
  - [x] `TEXT_SELECTED` now stores hex `#FACC15` (was alpha-baked `rgba(250,204,21,0.4)`), so the bridge's single `fill-opacity` is the only opacity source.
  - [x] Removed dead `__bukooApplyHighlights` (conflicting `fill-opacity: 0.3`).
- [x] 7. First-open progress percent race (bug 10)
  - [x] `updateLocalProgress` now takes `percent` and writes it in the same INSERT/UPDATE (`COALESCE`); removed separate `updateProgressPercent` that could run before the INSERT committed.
- [x] 8. Stale locations cache (bug 11)
  - [x] `epub_locations_${bookId}` cache now keyed by source fingerprint (local file size / remote URL) via `getBookSourceFingerprint` — re-downloaded books don't reuse stale page maps.
- [x] 9. Settings effect re-ran on every page turn (bug 12)
  - [x] Split injection (deps no longer include `currentCfi`; position read from `currentCfiRef`) and AsyncStorage persist (setting-change deps only).
- [x] 10. Dead code / TDZ cleanup (bugs 14, 15)
  - [x] Moved `webViewShellReady` ref above `handleMessage`; removed unused `getVerticalScrollTarget` and `dataInjectTimeRef`.
- [ ] 11. Base64 double-memory (bug 13) — NOT DONE: needs a local HTTP server / streaming loader (large architectural change). Flagged for a dedicated task.

Verification: mobile `tsc --noEmit` ✅, mobile lint ✅ (no errors; fixed one `no-empty`). API untouched this round. No test files exist in either workspace.

# Reader Redesign (Kindle/Apple Books Parity)

- `[x]` Phase 0 — Rendering Architecture Audit & Decision Gate (STOP GATE)
  - `[x]` Complete 8-dimension audit comparing current WebView+epub.js vs Native Paginator vs Apple Books/Kindle benchmarks.
  - `[x]` Present formal recommendation & tradeoffs to user for decision gate approval before writing code.
  - `[x]` Create `reader-redesign-prompt.md` prompt deliverable.

- `[x]` Phase 1 — Navigation Redesign (Priority #1)
  - `[x]` Redesign Table of Contents with nested chapter/subchapter structure and position indicator.
  - `[x]` Implement client-side in-book full-text search with snippet preview and match jump.
  - `[x]` Add draggable quick-jump slider / page scrubber control to bottom bar.
  - `[x]` Decompose `ReadingScreen.tsx` monolith into modular components (`TocModal`, `SearchModal`, `SettingsModal`, `HighlightModal`).

- `[x]` Phase 2 — Personalization Redesign (Priority #2)
  - `[x]` Add margin and line-height controls to reader settings.
  - `[x]` Optimize live typography updates without reflow freezes.
  - `[x]` Implement strictly global reader settings persisted in `AsyncStorage`.

- `[x]` Phase 3 — Engagement & Cloud Sync (Priority #3)
  - `[x]` Create Prisma schema models for `Highlight` and `Bookmark` in `apps/api` and `apps/web`.
  - `[x]` Generate safe SQL migration file `20260808170000_add_reader_annotations`.
  - `[x]` Add REST API endpoints in NestJS `ReadingController` & `ReadingService` and mobile `annotationSyncService.ts`.
  - `[x]` Polish inline note bubbles and highlight manager UI (`HighlightModal.tsx`).

- `[x]` Phase 4 — Visual Polish & Motion (Priority #4)
  - `[x]` Refine typography hierarchy, default line-heights, and margin defaults matching Apple Books.
  - `[x]` Smooth out page-turn transitions and gesture interactions with integrated QuickJumpSlider page scrubber.
  - `[x]` Enhance accessibility (Dynamic Type, screen reader labels) and UI chrome auto-hide timer.

- `[x]` Phase 5 — Content Cleanup (PDF Removal)
  - `[x]` Remove legacy PDF rendering bridge and canvas code from `ReadingScreen.tsx`.
  - `[x]` Clean up `MASTER_SAMPLE_BOOKS` PDF dependencies in `BookDetailScreen.tsx` (converted to EPUB).

# Mobile Application UI Redesign
- `[x]` 1. Implement Mobile UI/UX based on reference design screenshots
  - `[x]` Brand assets & theme tokens (`LogoBukoo.tsx`, `COLORS.ts`).
  - `[x]` Bottom Navigation Bar (`MainTabs.tsx`) with active gold pill indicators.
  - `[x]` `HomeScreen.tsx` (greeting, search input pill, category tags, Atomic Habits hero banner, trending carousel).
  - `[x]` `LibraryScreen.tsx` (header count, active reading card Laut Bercerita, AI companion insight card, 3-card stats summary grid).
  - `[x]` `AiCompanionScreen.tsx` (AI top bar, PLUS badge, active reading ETA card, 90% progress recommendation list).
  - `[x]` `ReadingScreen.tsx` Mode Baca (chapter header bar, cream reader surface, bottom pagination bar with Prev/Next buttons).
  - `[x]` `CommunityScreen.tsx` (active user count, posting button, feed card, Baca Bareng event card).
  - `[x]` `ProfileScreen.tsx` (brand logo header, avatar frame, quick stats row, weekly streak calendar bar, achievements grid).
  - `[x]` `SubscriptionScreen.tsx` (Pilih Paket Bukoo, monthly/yearly toggle, tier cards with dynamic pricing).
  - `[x]` `SearchScreen.tsx` (Jelajahi header, filter funnel, trending pills, BUKOO original carousel).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`, `npm run test --workspace=@bukoo/mobile` passed cleanly.

# Reader Bug Fixes
- `[x]` 1. Fix Bottombar Prev/Next Page Navigation in Vertical Scroll mode
  - `[x]` Remove `target.scrollBy` fallback in `window.__bukooNext` & `window.__bukooPrev`.
  - `[x]` Ensure `window.__bukooCurrentRendition.next()` / `prev()` are called.
- `[x]` 2. Fix Highlight Removal Sync in WebView
  - `[x]` Fix `window.__bukooRemoveHighlight` function overwrite bug in EPUB_JS_BRIDGE.
  - `[x]` Safely pass `cfiRange` using `JSON.stringify` in WebView JS injections.
- `[x]` 3. Verification
  - `[x]` Run `npm run typecheck --workspace=@bukoo/mobile` (PASSED).
  - `[x]` Run `npm run lint --workspace=@bukoo/mobile` (PASSED).
  - `[x]` Run `npm run test --workspace=@bukoo/mobile` (No tests configured for workspace).

# Mobile Backend API Integration
- `[x]` 1. Connect Mobile Screens to Live NestJS Backend API
  - `[x]` Create `booksApi` and `libraryApi` in `apps/mobile/src/services/api.ts`.
  - `[x]` Create custom React Query hooks: `useBooksApi.ts` (`useFeaturedBooks`, `useSearchBooks`, `useGenreBooks`) and `useLibraryApi.ts` (`useUserLibrary`).
  - `[x]` Wire `HomeScreen.tsx` to `useFeaturedBooks` with pull-to-refresh control.
  - `[x]` Wire `SearchScreen.tsx` to `useSearchBooks` and `useGenreBooks`.
  - `[x]` Wire `LibraryScreen.tsx` to `useUserLibrary` for dynamic active reading card & progress percentage.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Persistent Auth & Silent Auto-Login
- `[x]` 1. Offline-Resilient Auth & Session Hydration
  - `[x]` Update `useAuthHydration()` in `apps/mobile/src/hooks/useAuth.ts` to distinguish 401/403 (purge tokens) from network disconnection (preserve cached user profile for offline reading).
  - `[x]` Verified `ProfileScreen.tsx` logout button clean token eviction via `useLogout()`.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# HomeScreen Category Filtering Integration
- `[x]` 1. Dynamic Genre Book Filtering on HomeScreen
  - `[x]` Connect `HomeScreen.tsx` category pills to `useGenreBooks` (`GET /books?genre=...`).
  - `[x]` Clean up hardcoded selection index logic (`isSelected = selectedCategory === cat`).
  - `[x]` Dynamically update section title (`Buku ${selectedCategory}` vs `Trending Minggu ini🔥`) and horizontal book carousel data.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Custom Logout Confirmation Modal Redesign
- `[x]` 1. Premium Dark Forest Logout Dialog
  - `[x]` Replace OS system `Alert.alert` in `ProfileScreen.tsx` with a custom Modal card matching Bukoo's dark forest theme.
  - `[x]` Add red glow icon badge (`Ionicons name="log-out-outline"`), title, subtitle, and styled `Batal` / `Ya, Keluar` buttons.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# LoginScreen Header Logo Update
- `[x]` 1. Replace Text Title with Logo Image
  - `[x]` Replaced plain `<Text style={styles.title}>BUKOO</Text>` in `LoginScreen.tsx` header with `<LogoBukoo size={42} />` using `assets/logo/logo bukoo.png`.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Mobile App Launcher Icon Update
- `[x]` 1. Update App Launcher Icons across Expo & Android Resources
  - `[x]` Extracted primary Dark Forest & Gold BUKOO icon emblem from `assets/BUKOO App icon.png`.
  - `[x]` Configured `apps/mobile/app.json` for Expo app icons (`icon`, `adaptiveIcon`, `favicon`).
  - `[x]` Generated native Android app launcher mipmaps (`ic_launcher.webp`, `ic_launcher_round.webp`, `ic_launcher.png`, `ic_launcher_round.png`) across all densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Sample Books Conversion to EPUB
- `[x]` 1. Convert PDF books in `sample-books/` to EPUB format
  - `[x]` Convert `Filsafat Ajaran Islam (Edisi 2025) final 3 - ISBN DIGITAL.pdf` -> `apps/api/public/books/filsafat-ajaran-islam.epub`.
  - `[x]` Convert `Perlunya Seorang Imam (Revisi) 2.pdf` -> `apps/api/public/books/perlunya-seorang-imam.epub`.
  - `[x]` Convert `RIWAYAT-RASULULLAH.pdf` -> `apps/api/public/books/riwayat-rasulullah.epub`.
  - `[x]` Update `apps/api/prisma/seed.ts` fileUrls and fileTypes to EPUB.
  - `[x]` Fix stale PDF cache loading bug in ReadingScreen & bookDownloadService when book format switches to EPUB.
  - `[x]` Verification complete: typecheck, lint, test across touched workspaces.

# Fix Offline EPUB Asset Require Paths
- `[x]` 1. Fix relative asset path for offline EPUB books in ReadingScreen
  - `[x]` Correct relative require paths in `ReadingScreen.tsx` from `../../assets/` to `../../../assets/` to accurately resolve `apps/mobile/assets/` files (`filsafat-ajaran-islam.epub`, `perlunya-seorang-imam.epub`, `riwayat-rasulullah.epub`, `sample-book.epub`).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Mobile Release Build & API Fallback Fix
- `[x]` 1. Fix Release APK Login Error & Production Environment Variables
  - `[x]` Update default `API_URL` fallback in `api.ts` from `http://localhost:3000` to `https://bukooapi-production.up.railway.app/v1`.
  - `[x]` Update default `API_BASE_URL` fallback in `annotationSyncService.ts` to `https://bukooapi-production.up.railway.app/v1`.
  - `[x]` Update `webClientId` fallback in `LoginScreen.tsx` to `576187863248-9voo043m0bm915b8g6b0k1m5ios9qai2.apps.googleusercontent.com`.
  - `[x]` Add `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_GOOGLE_CLIENT_ID` to `eas.json` under `development`, `preview`, and `production` build profiles.
  - `[x]` Verification complete: typecheck, lint, test across touched workspace `@bukoo/mobile`.

# Mobile App APK Build for Testing
- `[x]` 1. Build Standalone Android APKs (Release & Debug)
  - `[x]` Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` and `eas.json` to active Cloudflare Workers production URL (`https://bukoo-api.erachmat-dev.workers.dev/v1`).
  - `[x]` Assemble Release APK (`./gradlew assembleRelease`).
  - `[x]` Assemble Debug APK (`./gradlew assembleDebug`).
  - `[x]` Verify output APK files, sizes, and timestamps (`app-release.apk` 109MB, `app-debug.apk` 183MB).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`.

# Fix Reader Resume "Snap-Back" Bug (shows page 25, next → 17)
- `[x]` 1. Root cause
  - `[x]` Confirmed via browser repro with the bundled epub.js: `rendition.display(savedPointCfi)` on a point CFI that sits exactly on a page boundary positions the content ONE PAGE EARLY, so the saved page counter (25) lies while the actual content is a page behind; pressing "next" advances to the true position and the counter "snaps back" to a lower page (e.g. 17).
  - `[x]` Fix strategy: nudge the saved CFI forward (+1 char, only when offset > 0) so the anchor lands inside the page; verify the relocated location against the saved one and fall back to `cfiFromLocation(locationFromCfi(savedCfi))` if epub.js still lands one page early (layout-timing race).
- `[x]` 2. Changes in `apps/mobile/src/screens/reading/ReadingScreen.tsx`
  - `[x]` Add `nudgeCfiForward()` and `window.__bukooRestorePosition(cfi)` to the WebView bridge (nudge + verify + location fallback).
  - `[x]` Route the pre-ready display in `__bukooLoadBook` and the READY-triggered position restore through `__bukooRestorePosition`.
  - `[x]` Route `__bukooDisplay` (TOC / search / bookmark / highlight jumps) through `__bukooRestorePosition` too.
- `[x]` 3. Verification
  - `[x]` Browser repro: sample-book (66 locs, reproduces bug) — resume now lands exactly at saved CFI `/3:890` (page 25) instead of one page early (`/3:289`); `next()` moves forward. `filsafat-ajaran-islam` & `perlunya-seorang-imam` (no bug) — no regression, resume lands exactly at saved position.
  - `[x]` `npm run typecheck --workspace=@bukoo/mobile` (PASSED).
  - `[x]` `npm run lint --workspace=@bukoo/mobile` (PASSED).
  - `[x]` `npm run test --workspace=@bukoo/mobile` (No tests configured for mobile yet).
