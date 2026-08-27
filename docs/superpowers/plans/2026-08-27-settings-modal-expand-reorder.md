# Implementation Plan — Reader Settings Modal: Expand & Reorder

Date: 2026-08-27
Spec: `docs/superpowers/specs/2026-08-27-settings-modal-expand-reorder-design.md`
Workflow: superpowers:subagent-driven-development
Workspace touched: `@bukoo/mobile`

File: `apps/mobile/src/screens/reading/components/SettingsModal.tsx` (all changes).

## Phase 1 — Expand-on-scroll (live growth)
- [x] 1a. Remove the `scrollToEnd`-on-open effect; reset ScrollView to `y=0` on open.
- [x] 1b. Add `Animated` + `useWindowDimensions`; card `height` = one-shot
  `Animated.timing` between `COLLAPSED=0.52*H` and `MAX=0.9*H`, triggered by
  scroll intent (`handleSheetScroll`: offset > 24px → expand, ≤ 24px → collapse);
  `scrollEventThrottle={16}`; `modalCard` → `Animated.View`. (Amended: initial
  1:1 scroll-offset growth caused a janky scroll-range feedback loop — replaced
  with snap per user.)
- [x] 1c. On open: reset `isExpandedRef` + `sheetProgress.setValue(0)` +
  `scrollTo({y:0})` so reopening starts collapsed at the top.

## Phase 2 — Reorder + restyle sections
- [x] 2a. Reorder sections: Ukuran Teks, Tema Warna, Jenis Huruf, Jarak Baris,
  Mode Perpindahan Halaman, Rataan Teks (Margin last).
- [x] 2b. Theme → round swatches: `themes` use reader's real bg colors + `check`
  icon color; 44px circles, gold ring + checkmark when active, a11y label, no text.
- [x] 2c. Font → horizontal chips `Sans`/`Serif`/`Spacemono` (relabel only);
  active detection via `isFontFamilyActive()` (family match, mirrors
  `getCssFontFamily`) — fixes default `'DM Sans'` never matching.
- [x] 2d. Styles: replace `themeTile*`/`checkIcon` with `themeDot*`; make
  `fontOptionsRow` horizontal (`flex:1` chips); `modalCard` drop `maxHeight:'60%'`,
  add `overflow:'hidden'`.

## Verification
- [x] V1. `npm run typecheck --workspace=@bukoo/mobile` ✅
- [x] V2. `npm run lint --workspace=@bukoo/mobile` ✅ (0 errors; fixed one
  `exhaustive-deps` warning by adding stable `sheetHeight` to deps)
- [x] V3. Mobile has no tests (placeholder) — stated explicitly.
- [ ] V4. Manual QA in Expo Go: section order, round swatches, horizontal chips,
  expand-on-scroll, active states, settings persist after close/reopen.
- [x] V5. Update `task.md` + SDD ledger `settings-modal-expand-reorder`.
