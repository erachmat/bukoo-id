# Design Spec — Reader UX & Search Filter Fixes

- **Date:** 2026-08-19
- **Status:** Implemented (user-requested fixes)
- **Scope:** `apps/mobile` only — no API/backend changes, no deploy.

## Items

1. **OLED Black crash** — selecting "OLED Black" throws
   `TypeError: Cannot read property 'bg' of undefined`. Root cause:
   `SettingsModal` theme ids are lowercase (`'oled'`); `ReadingScreen.setTheme`
   capitalizes to `'Oled'`, which is not a key in `themeColors`
   (`Light/Cream/Dark/Sepia`) → `themeColors['Oled'].bg` throws.
   **Fix (per user — "maybe it's okay if it remove")**: remove the `oled` theme
   from the picker; sanitize the `setTheme` wrapper and the persisted-settings
   loader so unknown values fall back to `Cream` instead of crashing.

2. **Remove "Kecerahan Layar"** (brightness) from the reader settings modal.
   **Fix**: remove the brightness adjuster section, the `brightness`/`setBrightness`
   props from `SettingsModal`, and the unused `brightness` state + props in
   `ReadingScreen`.

3. **Genre/category filter not working** — tapping a category chip or choosing a
   genre in the Filter modal did nothing. Root causes:
   - The backend `/books/search` route only filters by FTS `q`; `genre` sent by
     the client was ignored, and the client-side post-filter did **not** handle
     genre.
   - Genre-only browse (chip tapped with empty search box) called
     `/books/search?genre=…` with **no `q`**, which the server rejects (zod
     requires `q` min 2) → 400.
   **Fix**: `booksApi.search` — apply genre client-side (`item.genre?.includes`),
   and route genre-only browsing through `GET /books?genre=…` (catalog endpoint,
     which filters genre server-side).

4. **Top-bar overlap** — the reading-time text (e.g. `1j 20m 45d`) in the reader
   header overlaps the Audio icon. **Fix**: add `flexShrink: 1` to `headerMeta`
   and `headerSubtitle` so the meta texts truncate within the header instead of
   overflowing under the action icons.

## Verification

- `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`
  (no test script — stated explicitly).
- Manual device QA (Metro reload): OLED Black no longer present/crash; brightness
  section gone; genre chips + Filter modal genre actually filter; header time text
  truncates without overlapping the Audio icon.

## Out of scope

- "My Library" manual add (answer/question only — see task.md item 3).
- Any backend changes (none needed).
