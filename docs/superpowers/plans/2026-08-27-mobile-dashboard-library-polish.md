# Implementation Plan — Mobile: dashboard/library/AI/profile/reader polish (20 items)

Date: 2026-08-27
Spec: `docs/superpowers/specs/2026-08-27-mobile-dashboard-library-polish-design.md`
Workflow: superpowers:executing-plans
Workspace touched: `@bukoo/mobile`

## Phase 0 — Setup
- [x] 0a. Copy `new-design-mobile/book-02.png` → `apps/mobile/assets/book-02.png`.
- [x] 0b. Create `apps/mobile/src/hooks/useSystemNav.ts` → `useThreeButtonNav()`.

## Phase A — Dashboard (HomeScreen.tsx) — items 1–5
- [x] A1. Remove hero 'Koleksi terbaik' block (`{heroBook && …}`), `heroBook` var, hero styles.
- [x] A2. Verify 'Sedang dibaca' hidden when empty (QuickResumeCard) — make `libraryProgress?.length ? libraryProgress[0] : null` explicit.
- [x] A3. Add 'Trending Minggu ini🔥' section below `QuickResumeCard`; extract shared `renderBookCard`.
- [x] A4. Lower section: title `Rekomendasi` on 'Semua' (item 4); data `editors_choice` on 'Semua', category books otherwise (dedupe).
- [x] A5. `scrollContent` paddingBottom compensated for 3-button tab-bar raise.

## Phase B — Bottom bars on 3-button nav — items 5 & 6
- [x] B1. `MainTabs.tsx`: tab bar `bottom` = `insets.bottom + 14` when `useThreeButtonNav()` (both branches).
- [x] B2. `ReadingScreen.tsx`: reader bottom bar `paddingBottom` = `insets.bottom + 4` when 3-button.

## Phase C — Library (LibraryScreen.tsx) — items 7–12
- [x] C1. Remove `ReadingGoalCard` + dead `ReadingAnalyticsModal`/`analyticsModalVisible` wiring.
- [x] C2. Count badge icon → `book-02.png` Image.
- [x] C3. Merge 'Urutkan: …' + sort icon into one pill button.
- [x] C4. Remove 'MB Offline' card; single row of 3 equal `flex: 1` cards (phone + tablet).
- [x] C5. AI card header: `LogoBukoo` replaces 'AI' pill + sparkles.
- [x] C6. AI card button 'Lanjut Baca' → 'Lihat Detail' (gold bg / white text).

## Phase D — AI page — items 13–16
- [x] D1. `AiCompanionScreen.tsx`: entry-card title → 'Tanya Bukoo Assistant' (item 13).
- [x] D2. Subtitle → new italic greeting (item 14).
- [x] D3. '>' chevron → gold 'Chat Bukoo Assistant' button below subtitle (item 15).
- [x] D4. `AiChatSection.tsx`: `promptChip` paddingVertical 6 → 3 (item 16).

## Phase E — Profile — items 17–18
- [x] E1. `ProfileScreen.tsx`: remove both `ReadingGoalCard` renders + import (item 17).
- [x] E2. `readingGoalService.ts`: add `getMonthLogs(year, month)`.
- [x] E3. `ProfileScreen.tsx`: Week/Month toggle + month grid + prev/next chevrons (item 18).

## Phase F — Reader settings (SettingsModal.tsx) — items 19–20
- [x] F1. Reorder sections (2 extras above the 4); auto `scrollToEnd` on open (item 19).
- [x] F2. Overlay → transparent; `modalCard` maxHeight → ~60% (item 20).

## Verification
- [x] V1. `npm run typecheck --workspace=@bukoo/mobile`
- [x] V2. `npm run lint --workspace=@bukoo/mobile`
- [x] V3. State explicitly: mobile has no tests.
- [x] V4. Update `task.md` + SDD ledger `.superpowers/sdd/mobile-dashboard-library-polish/progress.md`.
