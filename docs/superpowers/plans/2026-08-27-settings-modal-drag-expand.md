# Implementation Plan — Reader Settings Modal: Drag-to-Expand (fix)

Date: 2026-08-27
Spec: `docs/superpowers/specs/2026-08-27-settings-modal-drag-expand-design.md`
Workflow: superpowers:subagent-driven-development
Workspace touched: `@bukoo/mobile`

File: `apps/mobile/src/screens/reading/components/SettingsModal.tsx` (all code changes).

## Phase 1 — Height model (replace scroll-intent snap)
- [x] 1a. Replace `sheetProgress` (0..1) + interpolation with `sheetHeight =
  useRef(new Animated.Value(COLLAPSED)).current` (px); `modalCard` `height: sheetHeight`.
- [x] 1b. `COLLAPSED = windowHeight*0.52`; `EXPANDED` in `expandedHeightRef`,
  default `windowHeight*0.9`; clamping done inline via `Math.min`/`Math.max`.
- [x] 1c. Remove `handleSheetScroll`, `EXPAND_THRESHOLD`, `isExpandedRef`,
  `animateSheet`, `scrollEventThrottle`, `onScroll`, `NativeSyntheticEvent` /
  `NativeScrollEvent` imports.

## Phase 2 — PanResponder drag + grabber
- [x] 2a. Add `grabberWrap` + `grabberBar` views at the top of `modalCard`
  (rounded 64×5 bar, ~full-width hit area, `accessibilityLabel`); pan handlers
  attached to the grabber wrap AND the header row.
- [x] 2b. `PanResponder` (pattern: `QuickJumpSlider.tsx`): grant → `startHeightRef =
  currentHeight`; move → `sheetHeight.setValue(clamp(startHeight - dy,
  COLLAPSED, EXPANDED))`; release/terminate → snap to nearest (midpoint + `vy`)
  via `Animated.timing` 180ms ease-out.

## Phase 3 — Scroll-up-to-expand + fixed 90% (amended 2026-08-27 v2)
- [x] 3a. Scroll-up to expand restored alongside the drag handle: `onScroll` with
  `scrollEventThrottle=16` → offset > `EXPAND_THRESHOLD` (24) while collapsed →
  one-shot `snapSheet(EXPANDED)`. NO collapse-on-scroll branch (the viewport-clamp
  feedback loop that caused the lag / "never 90%" bug) — collapse is drag-handle-only.
- [x] 3b. `EXPANDED` = fixed `windowHeight*0.9` (auto-fit/content-measurement
  DROPPED per user: "cannot expand to 90%").
- [x] 3c. Keep open-reset (`setValue(COLLAPSED)` + scroll-to-top) + `isExpandedRef`
  / `isAnimatingRef` guards; `stopAnimation()` on drag grant to sync refs.

## Verification
- [x] V1. `npm run typecheck --workspace=@bukoo/mobile`
- [x] V2. `npm run lint --workspace=@bukoo/mobile`
- [x] V3. No mobile tests (placeholder) — stated explicitly.
- [ ] V4. Manual QA (`npm run android`): drag up/down smooth, snap on release,
  expanded holds & shows all sections, reopen resets, settings persist.
- [x] V5. Update `task.md` + SDD ledger `settings-modal-drag-expand`.
