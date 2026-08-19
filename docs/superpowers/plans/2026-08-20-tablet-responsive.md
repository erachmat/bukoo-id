# Implementation Plan: Tablet-Responsive Layouts — 4 Tab Screens

**Date**: 2026-08-20
**Spec**: `docs/superpowers/specs/2026-08-20-tablet-responsive-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile)
**Ledger**: `.superpowers/sdd/tablet-responsive/progress.md`

User-approved decisions: scope = 4 tab screens; portrait-only; centered max-width 720 +
light multi-column; shared infra first; tablet breakpoint = 600.

---

## Task 1 — Shared responsive infrastructure

- [x] Create `apps/mobile/src/constants/LAYOUT.ts` — `TABLET_BREAKPOINT = 600`, `MAX_CONTENT_WIDTH = 720`.
- [x] Create `apps/mobile/src/hooks/useResponsive.ts` — `useIsTablet()` + `useResponsive()` via `useWindowDimensions()`.
- [x] Create `apps/mobile/src/components/ResponsiveContainer.tsx` — centered `View` capped at `MAX_CONTENT_WIDTH`, `style` prop, no default horizontal padding.

## Task 2 — `MainTabs.tsx`: tab bar cap + center

- [x] Import `useIsTablet`; build `tabBarStyle` conditionally: phone `left:16, right:16`; tablet `left:0, right:0, maxWidth: MAX_CONTENT_WIDTH, marginHorizontal: 'auto'`.
- [x] Verify centering technique on tablet; fallback to custom `tabBar` wrapper if needed. (Technique typechecked; manual device confirm in QA.)

## Task 3 — `HomeScreen.tsx`

- [x] Wrap ScrollView children in `<ResponsiveContainer>`.
- [x] Grid variant: `numColumns={isTablet ? 3 : 2}`; card `maxWidth` `'48%'` → `'31%'` on tablet; adjust `columnWrapperStyle` gap; keep `gridCover` aspectRatio.

## Task 4 — `LibraryScreen.tsx`

- [x] Wrap ScrollView children in `<ResponsiveContainer>`.
- [x] `statsGrid`: 4-in-a-row on tablet (single row, 4 `flex:1` cards), 2×2 on phone.

## Task 5 — `CommunityScreen.tsx`

- [x] Wrap ScrollView children in `<ResponsiveContainer>`.
- [x] Keep single-column feed (no further change).

## Task 6 — `ProfileScreen.tsx` + modals

- [x] Wrap ScrollView children in `<ResponsiveContainer>`.
- [x] Tablet: `profileSection` + `streakSection` side-by-side (`flexDirection:'row'`, `flex:1`, `gap:12`).
- [x] Avatar `90 → 110` on tablet.
- [x] `modalCard` `maxWidth: 340 → 440` on tablet: inline modals in `ProfileScreen` (+ `logoutModalCard`). *Refinement: `EditProfileModal`/`ReadingAnalyticsModal` are full-width bottom sheets — no change needed.*

## Task 7 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit -p apps/mobile/tsconfig.json` → exit 0.
- [x] `npm run lint` (from `apps/mobile`) → 0 errors/warnings.
- [x] `npm run test` (from `apps/mobile`) → "No tests specified for mobile yet" (state explicitly — mobile has NO real tests).
- [x] Manual QA checklist recorded (phone unchanged; tablet: 720 centered, tab bar capped, Home 3-col, Library 4-in-row, Profile 2-col, modals ≤440).

## Task 8 — Docs

- [x] Update root `task.md` with completed entry.
- [x] Update SDD ledger `.superpowers/sdd/tablet-responsive/progress.md`.
- [x] Mark all plan checkboxes complete.
