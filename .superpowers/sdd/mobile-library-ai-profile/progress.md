# SDD Ledger — Mobile: library reorder, AI rename + new chat page, Profile calendar & target card

Plan: `docs/superpowers/plans/2026-08-27-mobile-library-ai-profile.md`
Spec: `docs/superpowers/specs/2026-08-27-mobile-library-ai-profile-design.md`
Started: 2026-08-27 · Mode: executing-plans

## Progress

- **Phase A (Dashboard)**: `HomeScreen` — removed `ReadingGoalCard` (Target Membaca) + now-unused `ReadingAnalyticsModal` render/state/import. ✅
- **Phase B (Rak Buku Saya)**: `LibraryScreen` — reordered (Sedang dibaca → Target Membaca → AI card → stats → tabs → list); AI card title `Ai Companion` → `Bukoo Assistant`; count now `allLibraryItems.length` (total, tab/sort-insensitive); sort icon moved from the header into the collection section header row (next to the `Urutkan: …` text). ✅
- **Phase C (fire icons)**: `ReadingGoalCard` — completed 7-day week circles now show a `flame` icon instead of `checkmark`. ✅
- **Phase D (AI)**: `AiCompanionScreen` header → `Bukoo Assistant`; `Rekomendasi AI (Berdasarkan Minat)` → `Rekomendasi Bukoo`; inline chat replaced with a tappable 'Bukoo Assistant' entry card → `navigate('AiChat')`; removed unused `AiChatSection`/`AiSummaryModal` wiring. NEW `TanyaBukooAssistantScreen.tsx` (header 'Tanya Bukoo Assistant', reuses `AiChatSection` in full-screen variant, owns `AiSummaryModal`). `AiChat` registered in `AppNavigator` (modal) + `RootStackParamList`. ✅
- **Phase E (Profile)**: `ProfileScreen` — added `ReadingGoalCard` above the 'Minggu Ini' calendar (tablet: full-width above the header row; phone: between avatar and calendar); enhanced calendar with month/year label, today highlight ring, minutes/day, 3-letter weekday labels. ✅
- **Verify**: `npm run typecheck --workspace=@bukoo/mobile` ✅; `npm run lint --workspace=@bukoo/mobile` ✅ (0 errors); mobile has NO tests (`test` script is a placeholder) — stated explicitly; `get_errors` on all touched files: 0 errors. ✅

## Key decisions / amendments to spec
1. `AiChatSection` gained an optional `isFullScreen` prop so the dedicated chat page fills the screen (default card variant preserved for any other embed).
2. Target card on Profile renders twice conditionally (`isTablet` above the header row, `!isTablet` between avatar and calendar) to preserve the tablet side-by-side avatar|calendar layout while matching the requested phone order (avatar → target → calendar).
3. Weekday labels: `day.dayLabel` (3-letter, e.g. 'Min') instead of the first letter.
4. `AiChat` registered as `presentation: 'modal'`, consistent with the `Ai` route.

## Commits
- Not committed yet — changes in working tree. Suggested: `feat(mobile): library reorder + Bukoo Assistant rename + new chat page + profile calendar enhancements`
