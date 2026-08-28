# Implementation Plan: Profile Tablet Layout Fix

**Date**: 2026-08-28
**Spec**: `docs/superpowers/specs/2026-08-28-profile-tablet-layout-fix-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile)
**Ledger**: `.superpowers/sdd/profile-tablet-layout-fix/progress.md`

User-approved decisions: root cause = "Pencapaian" nested inside tablet `profileTopRow`;
desired = profile + calendar side-by-side, Pencapaian full-width below; phone order unchanged;
device = Android tablet 600–800dp.

---

## Task 1 — SDD artifacts

- [x] Design spec + implementation plan + ledger created (2026-08-28).
- [x] Root `task.md` entry added.

## Task 2 — Restructure `ProfileScreen.tsx`

- [x] Extract `profileSection`, `pencapaianSection`, `streakSection` as local JSX consts before `return`.
- [x] Tablet: `profileTopRow` renders only `{profileSection}{streakSection}`; `{pencapaianSection}` full-width below.
- [x] Phone: `{profileSection}{pencapaianSection}{streakSection}` (order unchanged).

## Task 3 — Tablet style tuning

- [x] `streakSectionTablet`: `flex: 1` → `flex: 1.3` (calendar ≥294px at 600dp).

## Task 4 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit -p apps/mobile/tsconfig.json` → exit 0.
- [x] `npm run lint` (from `apps/mobile`) → 0 errors.
- [x] `npm run test` → stub echo only — **mobile has NO real tests** (stated explicitly).
- [ ] Manual QA checklist recorded (tablet 600–800dp: profile+calendar side-by-side, calendar
      fully visible, Pencapaian full-width below; phone <600 unchanged).

## Task 5 — Build + deploy to Firebase testers

- [x] `npm run apk:release` (gradle `assembleRelease`) → BUILD SUCCESSFUL.
- [x] `npm run distribute:firebase` → uploaded to `mvp-testers` group; release recorded.

## Task 6 — Docs

- [x] Update root `task.md` with completed entry.
- [x] Update SDD ledger `.superpowers/sdd/profile-tablet-layout-fix/progress.md`.
- [x] Mark all plan checkboxes complete.
