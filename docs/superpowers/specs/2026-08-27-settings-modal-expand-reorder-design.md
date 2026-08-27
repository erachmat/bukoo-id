# Design Spec — Reader Settings Modal: Expand & Reorder

Date: 2026-08-27
Status: Approved (user: "Start implementation")
Workspace: `@bukoo/mobile`

## Executive summary
Rework the reader's `SettingsModal` bottom sheet:
1. **Scroll-up to expand** — the sheet starts collapsed (≈52% of screen height,
   top ~3 sections) and grows 1:1 with the scroll offset up to ≈90%, so dragging
   the sheet upward reveals the remaining settings. No gesture library — built on
   the existing `ScrollView` + `Animated` (`useNativeDriver: false`).
2. **Reorder settings** top→bottom: Ukuran Teks, Tema Warna, Jenis Huruf,
   Jarak Baris, Mode Perpindahan Halaman, Rataan Teks (Margin kept last).
3. **Tema Warna** → round color swatches only (no text labels); swatch colors
   mirror the reader's real theme backgrounds.
4. **Jenis Huruf** → horizontal chips labeled `Sans`, `Serif`, `Spacemono`
   (Spacemono = relabel of the existing system monospace — no new font).

## Component spec — `SettingsModal.tsx`
- **Expand logic (amended → Option A, snap)**: card `height` animates as a
  one-shot `Animated.timing` between `COLLAPSED = windowHeight*0.52` and
  `MAX = windowHeight*0.9` (240ms, ease-out), triggered by scroll intent via
  ScrollView `onScroll` (`scrollEventThrottle=16`): offset > `EXPAND_THRESHOLD`
  (24px) → expand; ≤ threshold → collapse. NOT tied 1:1 to the scroll offset
  (that first approach caused a scroll-range feedback loop → janky "multiple
  scroll"). On open: reset `sheetProgress` to 0 + `scrollTo({y:0})`.
- **Section order** (ScrollView children): Ukuran Teks, Tema Warna, Jenis Huruf,
  Jarak Baris, Mode Perpindahan Halaman, Rataan Teks, Margin Halaman (if prop).
- **Theme picker**: `themes` entries `{ id, label, bg, check }` — `bg` =
  reader's real body colors (`#F4F1E8` cream, `#FFFFFF` light, `#F5E6C8` sepia,
  `#1A1A1A` dark), `check` = icon color on the dot; 44px circles
  (`borderRadius: 22`), gold 2px ring when active + `Ionicons checkmark`;
  `accessibilityLabel="Tema <label>"` (no visible text).
- **Font picker**: `fontFamilies` = Sans(`DMSans-Regular`), Serif
  (`PlayfairDisplay-Regular`), Spacemono(`monospace`); one row of `flex: 1` chips.
  Active check via `isFontFamilyActive(selected, value)` that matches **by family**
  (mirrors `getCssFontFamily()` in ReadingScreen) — fixes the pre-existing bug where
  the default/persisted `'DM Sans'` never matched a chip.

## Layout / styling tokens
Existing card language preserved: `COLORS.forestDark` bg, `#0F2922` chip bg,
`#173E33` borders, radius 12–24, `padding: 20`, `COLORS.gold` accents,
`FONTS.sansMedium` section labels. New styles: `themeDot`/`themeDotActive`
(replaces `themeTile*`/`checkIcon`), horizontal `fontOptionsRow`/`fontChip`
(`flexDirection:'row'`, `flex:1`, `alignItems:'center'`), `modalCard` drops
`maxHeight:'60%'` (height now Animated) + adds `overflow:'hidden'`.

## Verification plan
1. `npm run typecheck --workspace=@bukoo/mobile`
2. `npm run lint --workspace=@bukoo/mobile`
3. No mobile tests (script is a placeholder) — stated explicitly, verify manually.
4. Manual (`expo start`): open reader → settings → section order, round swatches,
   horizontal chips, expand-on-scroll, active states, persistence after reopen.

## Out of scope
- Real Space Mono font (relabel only, per user decision).
- `ReadingScreen.tsx` / `App.tsx` / reader CSS changes.
- Web app.
