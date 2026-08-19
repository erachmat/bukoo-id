# Design Document: Tablet-Responsive Layouts — 4 Tab Screens

**Date**: 2026-08-20
**Status**: Approved (user approved plan 2026-08-20; executing)
**Target Workspace**: `@bukoo/mobile` (apps/mobile)
**Related**: Plan `docs/superpowers/plans/2026-08-20-tablet-responsive.md`

---

## 1. Executive Summary

The mobile app is phone-first with no responsive infrastructure: every screen lays out at
phone width, hardcoding sizes (avatars, covers, day pills) and full-bleed single columns.
On tablets the content stretches edge-to-edge with oversized cards, and the floating tab bar
spans the full width.

Goal: make the **four tab screens** (Home, Library, Community, Profile) layout cleanly on
tablet-width displays while leaving phones (<600dp) visually unchanged. Introduce a small
shared responsive foundation (breakpoint constant + `useIsTablet` hook + max-width content
container), then adapt each tab screen with a **centered max-width (720) column + light
multi-column** treatment. Orientation stays **portrait-only** (no `app.json` change).

**Non-goals**: no changes to Search, BookDetail, Subscription, AI Companion, Reading, or auth
screens; no landscape support; no redesign of components (only layout adaptation); no API/web/
shared-types changes.

---

## 2. Design Decisions (user-approved)

| Decision | Choice | Rationale |
|---|---|---|
| Scope | 4 tab screens: Home, Library, Community, Profile | Most-visited surfaces; keeps change contained |
| Orientation | Portrait-only | Lowest risk; no reader/tab-bar ripple |
| Layout strategy | Centered max-width (720) + light multi-column | Consistent, clean on tablet, low risk |
| Foundation | Build shared infra (hook + container) | Reusable seam for future screens |
| Breakpoint | `width >= 600` = tablet (Material dp) | Standard Android tablet threshold |
| Max content width | `720` | Comfortable reading measure; centers on 768–1280 tablets |

---

## 3. Component Specs

### 3.1 New: `src/constants/LAYOUT.ts`
- `export const TABLET_BREAKPOINT = 600;`
- `export const MAX_CONTENT_WIDTH = 720;`

### 3.2 New: `src/hooks/useResponsive.ts`
- `useIsTablet(): boolean` — `useWindowDimensions().width >= TABLET_BREAKPOINT`.
- `useResponsive(): { isTablet: boolean; width: number; height: number }` — returns
  `useWindowDimensions()` + `isTablet` (convenience for screens needing width too).
- Re-renders on rotation/resize by construction (portrait-locked, but safe).

### 3.3 New: `src/components/ResponsiveContainer.tsx`
- Props: `{ children: ReactNode; style?: StyleProp<ViewStyle> }`.
- Renders a `View` with `{ width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }`
  merged with `style`.
- **No default horizontal padding** — tab screens already pad each section themselves
  (`paddingHorizontal: 20` / `marginHorizontal: 20`). Phones (<600) are unaffected because
  `maxWidth` > any phone width.
- Usage pattern: wrap the `ScrollView` children of each tab screen inside
  `<ResponsiveContainer>…</ResponsiveContainer>`.

### 3.4 `MainTabs.tsx` — tab bar cap + center
- Call `useIsTablet()` (component is already a function component).
- Phone: unchanged (`left: 16, right: 16`).
- Tablet: `left: 0, right: 0, maxWidth: MAX_CONTENT_WIDTH, marginHorizontal: 'auto'`
  (Yoga auto-margin centering for the capped absolute bar). If auto-margins don't center on
  device, fallback = a custom `tabBar` wrapper that centers an inner pill capped at
  `MAX_CONTENT_WIDTH`. Verify on tablet emulator.

### 3.5 `HomeScreen.tsx`
- Wrap ScrollView content in `<ResponsiveContainer>`.
- A/B `home_layout` grid variant: `numColumns={isTablet ? 3 : 2}`; adjust card `maxWidth`
  (phone `'48%'` → tablet `'31%'`) and `columnWrapperStyle` gap; keep `gridCover`
  `aspectRatio: 150/220`. Grid cards are `flex: 1` so cover width stays `'100%'`.
- Horizontal carousels, hero banner, header, cards: unchanged — merely constrained to 720.

### 3.6 `LibraryScreen.tsx`
- Wrap ScrollView content in `<ResponsiveContainer>`.
- `statsGrid` (currently 2×2): on tablet render 4 stat cards in a **single row**
  (`flexDirection: 'row', gap: …`), phone keeps the 2×2. Implementation: keep two
  `statsRow`s on phone; on tablet render one row of 4 (branch on `isTablet`).

### 3.7 `CommunityScreen.tsx`
- Wrap ScrollView content in `<ResponsiveContainer>`.
- Keep single-column event/post feed (light treatment; reads well at ~680 inner width).

### 3.8 `ProfileScreen.tsx` + modals
- Wrap ScrollView content in `<ResponsiveContainer>`.
- Tablet: `profileSection` (avatar/name/Edit Profil) + `streakSection` **side-by-side**
  (`flexDirection: 'row'`, `flex: 1` each, `gap: 12`, `alignItems: 'flex-start'`).
- Modals: `modalCard` `maxWidth: 340` → `440` on tablet for `EditProfileModal`,
  `ReadingAnalyticsModal`, and the inline modals in `ProfileScreen`.
- Polish: avatar `90 → 110` on tablet.

---

## 4. Layout / Styling Tokens
- No new color/type tokens. New layout constants: `TABLET_BREAKPOINT`, `MAX_CONTENT_WIDTH`
  (both in `src/constants/LAYOUT.ts`).
- No spacing-scale refactor (out of scope); adaptation uses existing ad-hoc paddings.

---

## 5. Verification Plan
1. `npx tsc --noEmit -p apps/mobile/tsconfig.json` → exit 0.
2. `npm run lint` (from `apps/mobile`) → 0 errors/warnings.
3. `npm run test` (from `apps/mobile`) → stub echo — **state explicitly that mobile has NO
   real tests** (do not claim a pass).
4. Manual (device/emulator, portrait):
   - Phone (~390 wide): all four tabs visually unchanged; tab bar `left/right 16`.
   - Tablet (~800–1024 wide): content centered at 720; tab bar capped + centered; Home grid
     3-col; Library stats 4-in-row; Profile header + streak side-by-side; modals ≤440;
     no overflow/clipping.
