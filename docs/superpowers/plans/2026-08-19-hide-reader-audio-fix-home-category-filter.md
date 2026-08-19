# Implementation Plan: Hide Reader Audio Icon & Fix Home Category Filter

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-hide-reader-audio-fix-home-category-filter-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile) only
**Ledger**: `.superpowers/sdd/hide-reader-audio-fix-home-category-filter/progress.md`

---

## Task 1 — Hide "Audio book" headset icon in reader top bar

- [x] `ReadingScreen.tsx`: remove the headset `TouchableOpacity` ("Audio Companion Narasi", `Ionicons name="headset-outline"`) from the header action row.
- [x] `ReadingScreen.tsx`: remove the now-unused `audioPlayerService` import.

## Task 2 — Home category filter actually filters

- [x] `HomeScreen.tsx`: change `currentBooksData` so a selected category always shows `categoryBooks` (even when `[]` → empty state), and trending books are shown only under "Semua".
- [x] `HomeScreen.tsx`: make the empty state text reflect the selected category when one is active.

## Task 3 — Verification

- [x] Mobile typecheck ✅ / lint ✅ (no test script — stated explicitly).
- [ ] Manual device QA (Metro reload): headset icon gone from reader header; "Fiksi" filters to Fiksi books; "Agama" shows empty state instead of trending.

## Files touched
- `apps/mobile/src/screens/reading/ReadingScreen.tsx`
- `apps/mobile/src/screens/home/HomeScreen.tsx`
