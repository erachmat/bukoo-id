# SDD Ledger — mobile-icon-splash-swap (2026-08-20)

Plan: `docs/superpowers/plans/2026-08-20-mobile-icon-splash-swap.md`
Spec: `docs/superpowers/specs/2026-08-20-mobile-icon-splash-swap-design.md`

## Progress
- Task 1 (SDD artifacts + task.md): complete (spec + plan + ledger created; task.md entry added)
- Task 2 (Expo source assets): complete (`icon.png` 1024 full-bleed; `adaptive-icon.png` 512/1024; new `splash-icon.png` 3720x4096)
- Task 3 (native launcher icons): complete (15 webp files, 5 densities × 3 types; legacy 48–192, foreground 108–432 content 50%)
- Task 4 (native splash logo): complete (5 png files, 288–1152 fit-to-height, aspect 0.904 preserved)
- Task 5 (verification): complete — `identify` all assets ✅; `./gradlew assembleDebug` **BUILD SUCCESSFUL** ✅; typecheck ✅; lint ✅; no test script (stub) — stated
- Task 6 (ledger close-out): complete

## Remaining manual QA
- Cold-launch app on device/emulator: launcher shows rounded icon, splash shows new transparent logo. App icon may need launcher cache refresh (reinstall/`adb shell cmd package compile` or reinstall).

## Notes
- No `expo prebuild` — native splash/manifest are hand-customized.
- Mobile workspace has no test script (stub) — verification is tsc + lint +
  device build.
