# SDD Ledger — Reader Settings Modal: Drag-to-Expand (fix)

Plan: `docs/superpowers/plans/2026-08-27-settings-modal-drag-expand.md`
Spec: `docs/superpowers/specs/2026-08-27-settings-modal-drag-expand-design.md`
Started: 2026-08-27 · Mode: subagent-driven-development

## Progress
- **Height model**: single `Animated.Value` `sheetHeight` (px) replaces the
  `sheetProgress` + interpolation scheme; `COLLAPSED=0.52*H`, `EXPANDED=0.9*H`
  (fixed — see amendment). ✅
- **PanResponder drag + grabber**: grabber bar (64×5) at top of sheet with
  full-width hit area + header grab zone (claims only on move ≥4px so the close
  button still taps); `setValue` on move, `stopAnimation()` on grant, snap
  between `COLLAPSED`↔`EXPANDED` on release (midpoint + `vy`), 180ms timing snap. ✅
- **Scroll-up to expand (amended v2)**: `onScroll` (throttle 16) — offset > 24px
  while collapsed → one-shot `snapSheet(EXPANDED)`. NO collapse-on-scroll branch
  (the viewport-clamp feedback loop that caused the lag / "never 90%" bug);
  collapse is drag-handle-only. ✅
- **Open/reset**: on `visible` → collapsed + scroll-to-top; `isExpandedRef` /
  `isAnimatingRef` reset. ✅
- **Verify**: `npm run typecheck --workspace=@bukoo/mobile` ✅; `npm run lint
  --workspace=@bukoo/mobile` ✅ (0 errors); mobile has NO tests (`test` script
  placeholder) — stated explicitly. Manual QA (V4) pending user. ✅/pending

## Key decisions / amendments to spec
1. Interaction (user decision): **drag handle** on a grabber bar + **scroll-up to
   expand** both work. The original scroll-offset design had a feedback loop
   (expanding the sheet grows the viewport → RN clamps offset to 0 → a collapse
   branch fired → lag + never holds 90%), so the collapse-on-scroll branch is
   REMOVED; collapse is drag-handle-only.
2. Expanded height (AMENDED v2, 2026-08-27): **fixed 90%** — the auto-fit
   content height (capped 90%) was dropped after the user reported "cannot
   expand to 90%" (auto-fit stopped at content height, ~86% on typical phones).
3. No new deps (`PanResponder` is built-in; pattern from `QuickJumpSlider.tsx`).
4. No `ReadingScreen.tsx` changes (props unchanged).

## Commits
- Pending.
