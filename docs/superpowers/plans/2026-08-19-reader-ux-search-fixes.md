# Implementation Plan: Reader UX & Search Filter Fixes

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-reader-ux-search-fixes-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile) only
**Ledger**: `.superpowers/sdd/reader-ux-search-fixes/progress.md`

---

## Task 1 — Remove OLED Black + sanitize theme (crash fix)

- [x] `SettingsModal.tsx`: remove `'oled'` from `ReaderTheme` type and from the `themes` array.
- [x] `ReadingScreen.tsx`: `setTheme` wrapper falls back to `'Cream'` for unknown values; persisted-settings loader sanitizes `parsed.theme` to known themes.

## Task 2 — Remove "Kecerahan Layar" (brightness)

- [x] `SettingsModal.tsx`: remove `brightness`/`setBrightness` from props interface, destructure, and the brightness adjuster JSX section.
- [x] `ReadingScreen.tsx`: remove `brightness` state and the `brightness`/`setBrightness` props passed to `SettingsModal`.

## Task 3 — Genre/category filter actually filters

- [x] `api.ts` `booksApi.search`: genre-only browse (no query text) routes to `GET /books?genre=…` (server 400s `/books/search` without `q`); apply `item.genre?.includes(genre)` client-side for search-with-genre.

## Task 4 — Fix header time-text overlap with Audio icon

- [x] `ReadingScreen.tsx` styles: add `flexShrink: 1` to `headerMeta` and `headerSubtitle` so meta texts truncate instead of overflowing under the action icons.

## Task 5 — Verification

- [x] Mobile typecheck ✅ / lint ✅ (no test script — stated explicitly).
- [ ] Manual device QA (Metro reload): OLED Black gone; no brightness section; genre chips + Filter modal filter correctly; header no longer overlaps Audio icon.

## Files touched
- `apps/mobile/src/screens/reading/components/SettingsModal.tsx`
- `apps/mobile/src/screens/reading/ReadingScreen.tsx`
- `apps/mobile/src/services/api.ts`
