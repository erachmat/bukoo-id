# SDD Ledger — Reader Settings Modal: Expand & Reorder

Plan: `docs/superpowers/plans/2026-08-27-settings-modal-expand-reorder.md`
Spec: `docs/superpowers/specs/2026-08-27-settings-modal-expand-reorder-design.md`
Started: 2026-08-27 · Mode: subagent-driven-development

## Progress
- **Expand-on-scroll (amended → Option A, snap)**: removed the `scrollToEnd`-on-open
  trick; `modalCard` → `Animated.View` whose height animates between
  `COLLAPSED=0.52*H` and `MAX=0.9*H` as a one-shot `Animated.timing` (240ms,
  ease-out) triggered by scroll intent — scroll up past `EXPAND_THRESHOLD` (24px)
  → spring open, scroll back to top → collapse. NOT tied 1:1 to the scroll offset
  (the initial live-growth version caused a scroll-range feedback loop → janky
  "multiple scroll"; replaced same day). On open resets collapsed + scrolls to
  top. ✅
- **Section reorder**: Ukuran Teks → Tema Warna → Jenis Huruf → Jarak Baris →
  Mode Perpindahan Halaman → Rataan Teks (Margin kept last). ✅
- **Theme picker → round swatches**: `themes` now `{id,label,bg,check}` with the
  reader's REAL body colors (#F4F1E8/#FFFFFF/#F5E6C8/#1A1A1A); 44px circles, gold
  ring + checkmark on active, `accessibilityLabel` per swatch, no visible text. ✅
- **Font picker → horizontal chips**: `Sans`/`Serif`/`Spacemono` (Spacemono =
  system monospace relabel, no new dep); single `flex:1` row; new
  `isFontFamilyActive()` matches by family (mirrors `getCssFontFamily`) so default
  `'DM Sans'` now highlights the right chip. ✅
- **Verify**: `npm run typecheck --workspace=@bukoo/mobile` ✅; `npm run lint
  --workspace=@bukoo/mobile` ✅ (0 errors; added stable `sheetHeight` to effect
  deps to clear exhaustive-deps); mobile has NO tests (`test` script placeholder)
  — stated explicitly. ✅

## Key decisions / amendments to spec
1. Spacemono (user decision): relabel existing system `monospace` — no new font
   dependency, no `App.tsx`/reader-CSS change.
2. Expand interaction (user decision, AMENDED 2026-08-27): initially live growth
   (height 1:1 with scroll offset) — but that caused a scroll-range feedback loop
   (sheet height grew the viewport, shrinking max scroll, so the sheet fought the
   drag → janky "multiple scroll"). Replaced with **Option A**: snap on scroll
   intent — one-shot `Animated.timing` COLLAPSED↔MAX triggered past a 24px
   threshold.

## Commits
- Not committed yet — changes in working tree. Suggested:
  `feat(mobile): reader settings modal — scroll-to-expand, reorder, round theme swatches, horizontal font chips`
