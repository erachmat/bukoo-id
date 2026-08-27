# Design Spec — Reader Settings Modal: Drag-to-Expand (fix)

Date: 2026-08-27
Status: Approved (user: "Start implementation")
Workspace: `@bukoo/mobile`
Supersedes the scroll-up expand in `2026-08-27-settings-modal-expand-reorder-design.md`.

## Executive summary
The reader's `SettingsModal` bottom sheet expands/collapses via a ScrollView
`contentOffset` threshold (`handleSheetScroll`). That design has a built-in
feedback loop: when the sheet grows, the ScrollView viewport exceeds the
(~610–650pt) content on typical phones, so React Native clamps `contentOffset`
back to `0` → `onScroll(y=0)` fires → the collapse branch runs → the sheet snaps
back down mid-animation. Result: perceived lag and the sheet never holding 90%
(device-dependent — small phones fit at 90%, large ones don't).

Fix: replace the scroll-offset trigger with a **PanResponder drag handle** on a
grabber bar at the top of the sheet. The sheet height follows the finger directly
and snaps between `COLLAPSED` (52% of screen height) and an **auto-fit**
`EXPANDED` height (= ScrollView content height + header + card padding, capped at
90%). Content scrolling no longer affects sheet height at all, eliminating the
feedback loop. No new dependencies — `PanResponder` is built into React Native
(already used by `QuickJumpSlider.tsx`).

## User decisions (2026-08-27)
1. Interaction = **drag handle** (grabber), the scroll-up gesture is removed.
2. Expanded height = **auto-fit content, capped at 90%** ("90%" is a cap, not an
   always-target; on tall phones the sheet may stop at content height).

## Component spec — `SettingsModal.tsx`
- **Height model**: single `Animated.Value` `sheetHeight` (px). Drop the
  `sheetProgress` (0..1) + interpolation scheme, `handleSheetScroll`,
  `EXPAND_THRESHOLD`, `isExpandedRef`, `scrollEventThrottle`, `onScroll`, and the
  `NativeSyntheticEvent`/`NativeScrollEvent` imports.
  - `COLLAPSED = windowHeight * 0.52` (unchanged).
  - `EXPANDED` lives in a ref, default `windowHeight * 0.9`, and is recomputed on
    content measurement (below). Clamp so `EXPANDED >= COLLAPSED + 60`.
- **Grabber**: rounded bar (~64×5, cream) centered at the very top of `modalCard`,
  inside a ~full-width 32pt hit-area container; `accessibilityLabel`. Pan handlers
  also attached to the header row for a larger grab zone.
- **Drag (`PanResponder`)** — pattern from `QuickJumpSlider.tsx` (lines 66–122):
  - `onPanResponderGrant`: record `startHeight = current sheet height`.
  - `onPanResponderMove`: `sheetHeight.setValue(clamp(startHeight - gestureState.dy,
    COLLAPSED, EXPANDED))` — direct `setValue` (no per-frame tween) = responsive.
  - `onPanResponderRelease` / `onPanResponderTerminate`: snap to the nearest of
    `COLLAPSED`/`EXPANDED` (midpoint), also honoring `vy` (|vy| > 0.3 → snap toward
    that direction), via `Animated.timing` 180ms `Easing.out(Easing.cubic)`
    (`useNativeDriver: false` — height is not a transform).
- **Content measurement**: ScrollView `onContentSizeChange={(_, h) => …}` sets
  `EXPANDED = clamp(h + HEADER_H + CARD_PAD + 8, COLLAPSED + 60, windowHeight*0.9)`.
  `HEADER_H` measured via `onLayout` on the header (fallback ~66); `CARD_PAD` = the
  card's vertical padding (20 top + 20 bottom). Re-fires automatically when
  conditional sections (e.g., Margin) mount/unmount.
- **Open/reset**: on `visible` → `sheetHeight.setValue(COLLAPSED)` +
  `scrollTo({y:0, animated:false})` (unchanged behavior).
- **Style**: `modalCard` keeps `overflow:'hidden'`, 24px top radii, `COLORS.forestDark`; add grabber styles.

## Files
- `apps/mobile/src/screens/reading/components/SettingsModal.tsx` — all code changes.
- Reference only: `apps/mobile/src/screens/reading/components/QuickJumpSlider.tsx`.

## Layout / styling tokens
Reuse existing card language: `COLORS.forestDark` bg, `#0F2922` chip bg,
`#173E33` borders, radius 12–24, `padding: 20`, `COLORS.gold` accents,
`FONTS.sansMedium` section labels. New: `grabberWrap` / `grabberBar`.

## Verification plan
1. `npm run typecheck --workspace=@bukoo/mobile`
2. `npm run lint --workspace=@bukoo/mobile`
3. No mobile tests (script is a placeholder) — stated explicitly, verify manually.
4. Manual (`expo start` / `npm run android`): open reader → settings → drag the
   grabber up/down → height follows the finger smoothly → release snaps to
   COLLAPSED or EXPANDED → expanded shows ALL sections (auto-fit) and **holds**
   (scrolling content no longer collapses it) → reopen resets collapsed → settings
   persist after close/reopen.

## Out of scope
- Other bottom sheets (`EditProfileModal`, `ReadingAnalyticsModal`, Library sort
  sheet) — they still use static heights; the grabber pattern could be reused later.
- `ReadingScreen.tsx` / `App.tsx` / reader CSS changes (props unchanged).
- Real gesture library (`@gorhom/bottom-sheet` / reanimated / gesture-handler) —
  would require new native deps + rebuild; deliberately avoided.
