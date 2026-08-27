# Design Spec — Mobile: dashboard/library/AI/profile/reader polish (20 items)

Date: 2026-08-27
Status: Approved (user: "Start implementation")
Scope: `apps/mobile` (Expo/React Native). No new dependencies.

## Executive summary
Twenty user-facing changes across five screens plus the reader settings panel of the mobile app:

1. Remove the 'Koleksi terbaik' hero banner from the Dashboard.
2. Hide 'Sedang dibaca' when no books are in reading progress (already satisfied — verify).
3. Add a dedicated 'Trending Minggu ini🔥' horizontal book list below 'Sedang dibaca'.
4. Rename 'Rekomendasi & Trending' → 'Rekomendasi' on the Dashboard.
5. Raise the Dashboard bottom tab bar above the Android system nav bar on 3-button-navigation devices.
6. Raise the Reader bottom bar above the Android system nav bar on 3-button devices.
7. Remove the 'Target membaca' card from 'Rak Buku Saya'.
8. Replace the book icon beside the 'N Buku' count with `book-02.png`.
9. Merge the 'Urutkan:…' text with the sort button into a single control.
10. Remove the 'MB Offline' stat card; render 'Buku selesai' / 'Menit Membaca' / 'Hari Streak' in one equal-width row.
11. Replace the AI icon on the 'Bukoo Assistant' library card with the Bukoo 'B' logo (remove the 'AI' pill).
12. Change the library AI card button 'Lanjut Baca' → 'Lihat Detail' (gold bg, white text).
13. Change the Bukoo Assistant page entry-card title → 'Tanya Bukoo Assistant' (page header unchanged).
14. Change the entry-card subtitle to a new italic greeting.
15. Replace the '>' chevron on the entry card with a gold 'Chat Bukoo Assistant' button (white text).
16. Make the AI chat quick-prompt chips as tall as their text.
17. Remove the 'Target membaca' card from the Profile page.
18. Give the Profile streak calendar a month view (Week/Month toggle, prev/next month).
19. Reader 'Pengaturan Tampilan' defaults to 4 settings (Ukuran Teks, Tema Warna, Jenis Huruf, Jarak Baris); scrolling up reveals 'Mode perpindahan halaman' + 'Rataan Teks'.
20. The settings panel no longer dims/overlays the reader — book text stays visible for live preview.

## Component specs

### HomeScreen (Dashboard) — items 1–5
- Delete the `★ KOLEKSI TERBAIK` hero banner block (`{heroBook && …}`), `heroBook` variable, and hero styles. Keep `trendingBooks`.
- Confirm `QuickResumeCard` hides when empty (already returns `null`).
- Insert a `Trending Minggu ini🔥` section (section title + horizontal `FlatList` of `trendingBooks`) directly after `<QuickResumeCard/>`. Extract a shared `renderBookCard(item)` helper reused by the new row and the lower list to avoid duplicated card markup.
- Lower section header: `Rekomendasi & Trending` / `Trending Minggu ini` → `Rekomendasi` when 'Semua' (else `Buku {kategori}`); lower list shows `editors_choice` when 'Semua' (dedupe — trending already shown above), category books otherwise.
- `scrollContent` `paddingBottom` compensated for the raised tab bar when 3-button nav.

### 3-button nav detection — items 5 & 6
- New hook `useSystemNav.ts`: `useThreeButtonNav()` = `Platform.OS === 'android' && useSafeAreaInsets().bottom >= 32` (gesture ≈24, 3-button ≈48, legacy non-edge-to-edge ≈0).
- `MainTabs.tsx`: tab bar `bottom` = `insets.bottom + 14` when 3-button (both tablet & phone branches).
- `ReadingScreen.tsx`: reader bottom bar `paddingBottom` = `insets.bottom + 4` when 3-button.

### LibraryScreen ('Rak Buku Saya') — items 7–12
- Remove `ReadingGoalCard` render + import; remove now-dead `analyticsModalVisible` state and `ReadingAnalyticsModal` render/import.
- Count badge icon: `Ionicons book-outline` → `<Image source={require('../../../assets/book-02.png')}>` (asset copied from `new-design-mobile/book-02.png`).
- Merge `Urutkan: …` text + `swap-vertical` icon into a single pill `TouchableOpacity` that opens the sort modal.
- Stats: drop the 'MB Offline' card (`storageMb` state + `getStorageUsed()` call); render all remaining 3 cards in one `statsRow` (each `flex: 1`) on phone and tablet.
- AI card header: remove the 'AI' pill and `sparkles` icon; use `<LogoBukoo size={16}/>`.
- AI card button: 'Lanjut Baca' → 'Lihat Detail', styled with the existing `continueButton`/`continueButtonText` (gold bg, white text).

### AiCompanionScreen + AiChatSection — items 13–16
- Entry-card title → 'Tanya Bukoo Assistant' (page header stays 'Bukoo Assistant').
- Subtitle → 'Hai Saya Bukoo Assistant, Asisten personal baca untukmu. Ada yang bisa saya bantu?' with `fontStyle: 'italic'`.
- Replace the `chevron-forward` icon with a gold button 'Chat Bukoo Assistant' (white text, arrow icon) below the subtitle; card and button both `navigation.navigate('AiChat')`.
- `AiChatSection` `promptChip` `paddingVertical` 6 → 3, centered content (height = text only).

### ProfileScreen — items 17–18
- Remove both `ReadingGoalCard` renders (tablet + phone) and the import. Keep `ReadingAnalyticsModal` (still used by the streak row).
- Calendar: add `getMonthLogs(year, month)` to `readingGoalService.ts`; Week/Month toggle in the streak header; month view = 7-column grid (leading blanks), prev/next chevrons, month label; reuse `dayPill*`/`dayNumText*`/`dayMinutesText` styles.

### SettingsModal (reader) — items 19–20
- Reorder sections top→bottom: Mode Perpindahan Halaman, Rataan Teks, Ukuran Teks, Tema Warna, Jenis Huruf, Jarak Baris.
- On open, auto `scrollToEnd` so only the bottom 4 are visible; scrolling up reveals the 2 extras.
- `modalOverlay` bg `rgba(0,0,0,0.6)` → transparent; `modalCard` `maxHeight` 85% → ~60% so the reader WebView shows above the sheet (live preview already wired via the debounced setter effect in `ReadingScreen`).

## Layout / styling tokens
Follow the existing card language: `COLORS.forestDark` bg, `#0F2922` card bg, `#173E33` borders, radius 16–20, `padding: 14–16`, `FONTS.serifBold` titles, `COLORS.gold` (#D4971E) accents, white text on gold buttons, `COLORS.muted` secondary, `Ionicons`, `marginHorizontal: 20` within `ResponsiveContainer`. Tablet behavior preserved.

## Verification plan
1. `npm run typecheck --workspace=@bukoo/mobile`
2. `npm run lint --workspace=@bukoo/mobile`
3. No tests exist for mobile (`test` script is a placeholder) — state explicitly.
4. Manual: `expo start` → Dashboard, Rak Buku Saya, Bukoo Assistant page + chat, Profile, Reader settings (3-button raise on a real device).

## Out of scope
- Web app; `ReadingGoalCard.tsx` file (kept, becomes unused — flag); 'Buku sesuai' relabel (kept 'Buku selesai'); page header 'Bukoo Assistant' stays; 'Margin Halaman' setting stays hidden.
