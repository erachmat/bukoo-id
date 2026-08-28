# Design Document: Profile Tablet Layout Fix

**Date**: 2026-08-28
**Status**: Approved (user approved plan 2026-08-28; executing)
**Target Workspace**: `@bukoo/mobile` (apps/mobile)
**Related**: Plan `docs/superpowers/plans/2026-08-28-profile-tablet-layout-fix.md`

---

## 1. Executive Summary

The Profile tab was adapted for tablets on 2026-08-20 (profile header + streak calendar
side-by-side, avatar 90→110, modals ≤440). That adaptation has a layout bug on tablet widths:
the **"Pencapaian" achievements section is nested inside the tablet `profileTopRow` flex row**,
so on tablet the page renders as **three side-by-side columns** (profile · Pencapaian · streak).
The Pencapaian column has no `flex` and keeps its natural (~300px) width, which squeezes the
profile header and the 7-day streak calendar into ~100–170px columns — the calendar days
overflow/clip and the profile column looks crushed. Phones (<600dp) are unaffected because the
row styles are only applied on tablet.

Fix: render **only profile + streak side-by-side** on tablet (matching the original design
intent), with **Pencapaian as a full-width row below**. Phone layout and order stay unchanged
(Profile → Pencapaian → Streak).

## 2. Design Decisions (user-approved)

| Decision | Choice | Rationale |
|---|---|---|
| Root cause | "Pencapaian" nested inside `profileTopRow` | 3-column squeeze on tablet |
| Tablet layout | Profile + streak side-by-side; Pencapaian full-width below | Matches original 2026-08-20 intent |
| Phone layout | Unchanged order: Profile → Pencapaian → Streak | "Phone (<600) unchanged" invariant |
| Streak column share | `flex: 1.3` (profile stays `flex: 1`) | Calendar needs ≥294px at 600dp; 1:1 gives only ~274px |
| Scope | Profile screen only | Home/Library/Community not reported; untouched |

## 3. Component Specs

### 3.1 `ProfileScreen.tsx` — layout composition

Extract three sections into local JSX consts declared before `return` (no duplication):

- `profileSection` — avatar / name / Edit Profil button
  (`styles.profileSection` + `profileSectionTablet` on tablet)
- `pencapaianSection` — achievements stats grid (`styles.sectionContainer`), full-width
- `streakSection` — reading-streak calendar Week/Month
  (`styles.streakSection` + `streakSectionTablet` on tablet)

Render conditionally:

- **Tablet** (`isTablet`):
  `<View style={styles.profileTopRow}>{profileSection}{streakSection}</View>` then
  `{pencapaianSection}` (full-width) below.
- **Phone**:
  `{profileSection}{pencapaianSection}{streakSection}` — exactly the current order.

All modals, Aktivitas menu, and logout button remain outside and unchanged.

### 3.2 Style tokens

- `streakSectionTablet.flex`: `1` → `1.3` so the calendar column keeps ≥294px at 600dp
  (7 day-cols × 36px + paddings). `profileSectionTablet` stays `flex: 1` (avatar/name are
  comfortable at ~238px).
- No other style/layout/color changes.

## 4. Verification Plan

- `npx tsc --noEmit -p apps/mobile/tsconfig.json` → exit 0.
- `npm run lint` (from `apps/mobile`) → 0 errors.
- `npm run test` → stub echo only — **mobile has NO real tests** (stated explicitly).
- Manual QA (device/emulator): Android tablet 600–800dp → profile + calendar side-by-side,
  week/month calendar fully visible with no overflow, Pencapaian full-width below; phone
  <600dp identical to before (order Profile → Pencapaian → Streak).
- Release APK built (`assembleRelease`) and distributed to Firebase `mvp-testers` group.
