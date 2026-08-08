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

- [ ] Phase 3 — Engagement & Cloud Sync (Priority #3)
  - [ ] Create Prisma schema models for `Highlight`, `Bookmark`, and `Note` in `apps/api`.
  - [ ] Generate migration with `--create-only`, review SQL, and validate on Neon branch.
  - [ ] Add API endpoints and mobile sync service for cross-device annotation sync.
  - [ ] Polish inline note bubbles and highlight manager UI.

- [ ] Phase 4 — Visual Polish & Motion (Priority #4)
  - [ ] Refine typography hierarchy, default line-heights, and margin defaults matching Apple Books.
  - [ ] Smooth out page-turn transitions and gesture interactions.
  - [ ] Enhance accessibility (Dynamic Type, screen reader labels) and UI chrome auto-hide timer.

- [ ] Phase 5 — Content Cleanup (PDF Removal)
  - [ ] Remove legacy PDF rendering bridge and canvas code from `ReadingScreen.tsx`.
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



