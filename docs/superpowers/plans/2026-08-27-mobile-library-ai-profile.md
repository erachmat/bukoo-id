# Implementation Plan — Mobile: library reorder, AI rename + new chat page, Profile calendar & target card

Date: 2026-08-27
Spec: `docs/superpowers/specs/2026-08-27-mobile-library-ai-profile-design.md`
Workflow: superpowers:executing-plans
Workspace touched: `@bukoo/mobile`

## Phase A — Dashboard: remove Target Membaca card
File: `apps/mobile/src/screens/home/HomeScreen.tsx`
- [x] A1. Remove `<ReadingGoalCard onOpenAnalytics={() => setAnalyticsModalVisible(true)} />` + its comment.
- [x] A2. Remove `ReadingAnalyticsModal` render (~lines 314-316), `analyticsModalVisible` state (~line 44), and the import (~line 20).

## Phase B — Rak Buku Saya (LibraryScreen.tsx)
File: `apps/mobile/src/screens/library/LibraryScreen.tsx`
- [x] B1. Reorder: move `ReadingGoalCard` block to AFTER the "Sedang dibaca" card.
- [x] B2. AI card title `Ai Companion` → `Bukoo Assistant`.
- [x] B3. Count: `{sortedBooks.length} Buku` → `{allLibraryItems.length} Buku`.
- [x] B4. Remove sort icon from header; add sort icon button beside `sortIndicatorText` in the collection section header row.

## Phase C — Target Membaca card fire icons
File: `apps/mobile/src/screens/home/components/ReadingGoalCard.tsx`
- [x] C1. Completed 7-day week circle icon: `checkmark` → `flame`.

## Phase D — AI Companion texts + new chat page
Files: `AiCompanionScreen.tsx`, NEW `TanyaBukooAssistantScreen.tsx`, `AppNavigator.tsx`, `types.ts`
- [x] D1. AiCompanionScreen header → `Bukoo Assistant` (line 73).
- [x] D2. `Rekomendasi AI (Berdasarkan Minat)` → `Rekomendasi Bukoo` (line 149).
- [x] D3. Replace inline chat block with tappable 'Bukoo Assistant' entry card → `navigate('AiChat')`.
- [x] D4. Remove `AiChatSection`/`AiSummaryModal` imports, `summaryModalVisible` state, `AiSummaryModal` render.
- [x] D5. Create `TanyaBukooAssistantScreen.tsx` (header 'Tanya Bukoo Assistant', reuses `AiChatSection`, owns `AiSummaryModal`, `activeBook` via `useUserLibrary()`).
- [x] D6. Register `AiChat` in `AppNavigator.tsx` + add `AiChat: undefined` to `RootStackParamList` in `types.ts`.

## Phase E — Profile: add Target card + enhance calendar
File: `apps/mobile/src/screens/profile/ProfileScreen.tsx`
- [x] E1. Import `ReadingGoalCard`; insert above the 'Minggu Ini' calendar, wired to `setShowAnalyticsModal(true)`.
- [x] E2. Enhance streak calendar: month/year label; today highlight; minutes/day; fuller weekday labels; spacing polish.

## Verification
- [x] V1. `npm run typecheck --workspace=@bukoo/mobile`
- [x] V2. `npm run lint --workspace=@bukoo/mobile`
- [x] V3. State explicitly: mobile has no tests.
- [x] V4. Update `task.md` + SDD ledger `.superpowers/sdd/mobile-library-ai-profile/progress.md`.
