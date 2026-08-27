# SDD Ledger — Mobile: dashboard/library/AI/profile/reader polish (20 items)

Plan: `docs/superpowers/plans/2026-08-27-mobile-dashboard-library-polish.md`
Spec: `docs/superpowers/specs/2026-08-27-mobile-dashboard-library-polish-design.md`
Started: 2026-08-27 · Mode: executing-plans

## Progress

- **Phase 0 (setup)**: copied `new-design-mobile/book-02.png` → `apps/mobile/assets/book-02.png`; new hook `apps/mobile/src/hooks/useSystemNav.ts` (`useThreeButtonNav()` = Android && bottom inset ≥ 32). ✅
- **Phase A (Dashboard, HomeScreen.tsx)**: removed hero 'Koleksi terbaik' banner + `heroBook` + hero styles; added dedicated 'Trending Minggu ini🔥' row below `QuickResumeCard` (shared `renderHorizontalBookCard`); lower section → 'Rekomendasi' (editors_choice on 'Semua', category books otherwise); 'Sedang dibaca' hide verified (QuickResumeCard already returns null); `scrollContent` padding compensates for the 3-button tab-bar raise. ✅
- **Phase B (3-button bars)**: `MainTabs.tsx` tab bar `bottom = insets.bottom + 14` when 3-button (both branches); `ReadingScreen.tsx` reader bottom bar `paddingBottom = insets.bottom + 4` when 3-button. ✅
- **Phase C (Library, LibraryScreen.tsx)**: removed `ReadingGoalCard` + dead `ReadingAnalyticsModal`/`analyticsModalVisible`; count icon → `book-02.png`; merged 'Urutkan:…' + sort icon into one pill button; removed 'MB Offline' stat + `storageMb`/`getStorageUsed()`; 3 stat cards in one equal-width `statsRow` (dropped isTablet 2×2 branch + unused `isTablet`); AI card header → `LogoBukoo` (removed 'AI' pill + sparkles); AI card button 'Lanjut Baca' → 'Lihat Detail' (gold bg, white text via `continueButton`). ✅
- **Phase D (AI page)**: `AiCompanionScreen.tsx` entry-card title → 'Tanya Bukoo Assistant' (header unchanged); subtitle → italic 'Hai Saya Bukoo Assistant, Asisten personal baca untukmu. Ada yang bisa saya bantu?'; '>' chevron → gold 'Chat Bukoo Assistant' button (white text) below subtitle (outer card converted to View to avoid nested touchables); `AiChatSection.tsx` prompt chips `paddingVertical` 6 → 3 (height = text). ✅
- **Phase E (Profile)**: removed both `ReadingGoalCard` renders + import (kept `ReadingAnalyticsModal` — still used by streak row); `readingGoalService.getMonthLogs(year, month)` added; Profile streak card gained Week/Month toggle + month grid (leading blanks, prev/next chevrons, weekday header) reusing `dayPill*`/`dayNumText*`/`dayMinutesText`. ✅
- **Phase F (Reader settings, SettingsModal.tsx)**: reordered sections (Mode Perpindahan Halaman, Rataan Teks above; Ukuran Teks, Tema Warna, Jenis Huruf, Jarak Baris below); auto `scrollToEnd` on open so only the 4 core settings show, scrolling up reveals the 2 extras; overlay → transparent + `maxHeight` 60% for live reader preview. ✅
- **Verify**: `npm run typecheck --workspace=@bukoo/mobile` ✅ (fixed one `noImplicitReturns` in the new effect); `npm run lint --workspace=@bukoo/mobile` ✅ (0 errors); mobile has NO tests (`test` script is a placeholder) — stated explicitly; `get_errors` on all 10 touched files: 0 errors. ✅

## Key decisions / amendments to spec
1. 3-button nav (user decision): RAISE app bottom bars above the Android system nav bar (keep visible), not hide. Detection via `useSafeAreaInsets().bottom >= 32` — no new dependency.
2. Dashboard trending (user decision): dedicated 'Trending Minggu ini🔥' row below 'Sedang dibaca'; lower 'Rekomendasi' section shows `editors_choice` on 'Semua' (dedupe — no repeated trending).
3. Item 13 (user decision): only the entry-card title changed → 'Tanya Bukoo Assistant'; page header stays 'Bukoo Assistant'.
4. Item 11 (user decision): 'AI' pill removed; only the Bukoo 'B' logo (`LogoBukoo`) on the library AI card.
5. Entry-card outer element changed `TouchableOpacity` → `View` so the nested 'Chat Bukoo Assistant' button is the single tappable control.
6. Library kept label 'Buku selesai' (user typed 'Buku sesuai', but no such metric exists — the card shows finished-book count). Flagged.
7. `ReadingGoalCard.tsx` now unused across the app (removed from Library + Profile) — file kept, flagged.

## Commits
- Not committed yet — changes in working tree. Suggested: `feat(mobile): dashboard/library/AI/profile/reader polish (20 UI items)`
