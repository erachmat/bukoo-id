# Design Spec — Mobile: Library reorder, AI rename + new chat page, Profile calendar & target card

Date: 2026-08-27
Status: Approved (user: "Start implementation")
Scope: `apps/mobile` (Expo/React Native). No new dependencies.

## Executive summary
Eleven user-facing changes across four screens of the mobile app:
1. Remove the 'Target Membaca' card from the Dashboard (Beranda).
2. Reorder 'Rak Buku Saya' so 'Sedang dibaca' comes before 'Target Membaca', and rename the AI card to 'Bukoo Assistant'.
3. Move the Sort control from the page header to near the 'Semua Koleksi' collection list.
4. Make the 'X Buku' count always reflect the total library size (tab/sort insensitive).
5. Use fire icons for completed days in the 'Target Membaca' 7-day week row.
6/7/8. Rename AI Companion page texts to 'Bukoo Assistant' / 'Rekomendasi Bukoo'.
9. Turn 'Tanya AI Companion' into the only entry point to a new full 'Tanya Bukoo Assistant' chat screen (inline chat removed from the AI page).
10. Enhance the Profile 'Minggu Ini' weekly calendar (month label, minutes/day, today highlight, fuller labels).
11. Add the 'Target Membaca' card to the Profile page, above the calendar.

## Component specs

### HomeScreen (Dashboard)
- Remove `<ReadingGoalCard …/>` and the comment `{/* Daily Reading Target & Streak Card */}`.
- Delete now-unused `ReadingAnalyticsModal` render, `analyticsModalVisible` state, and its import.

### LibraryScreen ('Rak Buku Saya')
- New section order: Header → Sedang dibaca → Target Membaca → AI card → stats grid → filter tabs → collection header (+ sort) → book grid.
- AI card title: `Ai Companion` → `Bukoo Assistant` (keep AI badge + sparkles).
- Count badge: `{allLibraryItems.length} Buku`.
- Header keeps only title + count badge. Collection section header row gains the tappable `swap-vertical` sort icon next to the existing `Urutkan: …` indicator text.

### ReadingGoalCard (shared)
- Completed 7-day week circles: `checkmark` → `flame` (fire) icon. Title icon (`flag-outline`) and streak badge unchanged.

### AiCompanionScreen
- Header: `AI Companion & Assistant` → `Bukoo Assistant`.
- Section: `Rekomendasi AI (Berdasarkan Minat)` → `Rekomendasi Bukoo`.
- Replace inline `AiChatSection` block with a tappable entry card labeled `Bukoo Assistant` → `navigation.navigate('AiChat')`.
- Remove `AiChatSection`/`AiSummaryModal` imports, `summaryModalVisible` state, and the summary modal render.

### TanyaBukooAssistantScreen (NEW, route `AiChat`)
- Full-screen chat page: header `Tanya Bukoo Assistant` + back arrow; reuses `AiChatSection`; owns an `AiSummaryModal`; computes `activeBook` via `useUserLibrary()`.

### Navigation
- `AppNavigator.tsx`: register `AiChat` (presentation: modal) → `TanyaBukooAssistantScreen`.
- `types.ts`: add `AiChat: undefined` to `RootStackParamList`.

### ProfileScreen
- Insert `<ReadingGoalCard onOpenAnalytics={() => setShowAnalyticsModal(true)} />` above the 'Minggu Ini' streak calendar (import from `../home/components/ReadingGoalCard`).
- Enhance the streak calendar: month/year header label; today highlighted; minutes per day under each day pill; full weekday labels; spacing polish.

## Layout / styling tokens
Follow existing card pattern: `COLORS.forestDark` bg, `COLORS.forestCard` card bg (`#0F2922`), `COLORS.forestBorder` (`#173E33`) borders, `borderRadius` 18–20, `padding: 16`, `FONTS.serifBold` titles, `COLORS.gold` accents, `COLORS.muted` secondary, `Ionicons` icons, `marginHorizontal: 20` within `ResponsiveContainer`. Tablet (`useIsTablet`) behavior preserved.

## Verification plan
1. `npm run typecheck --workspace=@bukoo/mobile`
2. `npm run lint --workspace=@bukoo/mobile`
3. No tests exist for mobile (`test` script is a placeholder) — state explicitly.
4. Manual: `expo start` → Dashboard, Rak Buku Saya, AI Companion, new chat screen, Profile.

## Out of scope
- 'Ai Companion' strings in `SubscriptionScreen.tsx`; 'AI Reading Assistant' subtitle; chat greeting wording ("BUKOO AI Assistant"); server-vs-local goal storage redundancy.
