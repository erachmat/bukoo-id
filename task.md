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
  - `[x]` Verification complete: typecheck, lint, test across touched workspaces.
