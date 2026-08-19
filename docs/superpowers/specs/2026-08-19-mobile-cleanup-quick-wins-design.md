# Design Document: Mobile Quick Wins — Dead Code, Fake Data, Stale Artifacts

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/mobile` (apps/mobile) only
**Related**: Roadmap "BUKOO Tech-Debt Cleanup & Performance" (Task 1). Follows the pattern of
`2026-08-19-remove-dummy-ebooks` (dummy *ebook* purge) — this task completes the purge of
*non-ebook* dead code, fake stats, and stale artifacts.

---

## 1. Executive Summary

The mobile app still carries **dead code** (unregistered `StoreScreen`), **fake user data**
(hardcoded Profile stats, a hardcoded user-name fallback `'Baihaqi'`), **diagnostic console
noise** (`[Perf]`/`[WebView Diagnostic]` logs in the reader), and a **stale `.env.example`**
(Supabase vars that are no longer used). None of these are real features — they are leftovers
that mislead users (fake stats) and clutter the codebase.

Goal: remove all of the above from `apps/mobile` so every number shown is derived from real
local/backend data, with honest empty/zero states when there is no data. **No behavior change
to real features** (reading, search, community, AI, auth, notifications all untouched).

**Non-goals**: no API/schema changes; no changes to `apps/web`, `apps/api`, or `packages/*`;
no new features (e.g. a real "followers" system is NOT in scope — the stat is simply removed);
no refactoring of `ReadingScreen` beyond deleting the diagnostic logs (the monolith split is a
separate roadmap task).

---

## 2. Inventory

| # | File | What | Type |
|---|---|---|---|
| 1 | `src/screens/store/StoreScreen.tsx` (388 LOC, entire `store/` dir) | Unregistered store screen — never imported by any navigator (verified: only self-reference in `src/`) | Dead code |
| 2 | `src/screens/profile/ProfileScreen.tsx` | Hardcoded stats: quick-stats row `47` Selesai / `312` jam baca / `128` Follower; streak title `"Agustus Week 1"` + 7 fake day pills (`isActive = dayNum <= 6`); streak count `21`; Pencapaian grid `47` Buku selesai / `312` Jam Membaca / `21` Hari Streak | Fake data |
| 3 | `src/screens/home/HomeScreen.tsx` (L114) | `user?.name \|\| 'Baihaqi'` — invented persona fallback | Fake data |
| 4 | `src/screens/reading/ReadingScreen.tsx` (L140, L148) | `[WebView Diagnostic]` payload-length logs inside the embedded JS bridge string | Diagnostic noise |
| 5 | `src/screens/reading/ReadingScreen.tsx` (L~1499, L~1532, L~1581) | `[Perf]` TTFF / page-turn latency / shell-ready logs in `handleMessage` (READY / PAGE_CHANGED / SHELL_READY cases) | Diagnostic noise |
| 6 | `.env.example` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` (unused in `src/`), and `GOOGLE_CLIENT_ID` (misnamed — code reads `EXPO_PUBLIC_GOOGLE_CLIENT_ID`) | Stale artifacts |
| 7 | `src/services/userProfileService.ts` (L32–38) + `src/screens/profile/components/EditProfileModal.tsx` (L44) | Favorite-genre fallback defaults to `['Fiksi', 'Agama']` when no saved data | Decision point (see §3.6) |

---

## 3. Component Specs

### 3.1 `StoreScreen.tsx` — delete (dead code)
- Delete `apps/mobile/src/screens/store/StoreScreen.tsx` and the now-empty `store/` directory.
- Verified safe: no imports of `StoreScreen` (or `store/*`) anywhere in `src/`; `StoreScreen`'s
  feature surface (genre-filtered featured catalog) is fully covered by `HomeScreen`
  category pills + `SearchScreen` genre browse. Imports it uses (`ShimmerPlaceholder`,
  `getCoverUrl`, `api`, `useAuthStore`, etc.) are all used elsewhere — no orphaned deps to clean.

### 3.2 `ProfileScreen.tsx` — real data for all stats
Replace every hardcoded number with values from existing local services (same sources the
`LibraryScreen` 4-stat grid uses — consistent, real, offline-safe):

| UI element | Current (fake) | Real source |
|---|---|---|
| Quick stats — Selesai | `47` | `readingSync.getFinishedBooksCount()` |
| Quick stats — jam baca | `312` | `Math.round(readingSync.getTotalReadingMinutes() / 60)` |
| Quick stats — Follower | `128` | **No data source → remove the stat** (see Decision Log) |
| Streak count | `21` | `readingGoalService.getGoalsState().streakDays` |
| Streak week title | `"Agustus Week 1"` | Static `"Minggu Ini"` (chevrons have no handlers — remove them) |
| Streak day pills | `[1..7]` fake `isActive = dayNum <= 6` | `readingGoalService.getWeekLogs()` → per-day `isCompleted` = active, day number = day-of-month, label from `dayLabel` |
| Pencapaian grid | `47` / `312` / `21` | Same real values as above (finished, jam, streak) |

- Load stats in a `useEffect` (mirroring `LibraryScreen` L57–61) and store in local state;
  render `0` until loaded. No skeletons needed (numbers are cheap).
- Keep the "Lihat Analitik" tap → `ReadingAnalyticsModal` behavior and the `ReadingGoalCard`
  integration untouched.
- `user?.name || 'Pengguna BUKOO'` (ProfileScreen) already honest — no change.

### 3.3 `HomeScreen.tsx` — honest name fallback
- L114: `user?.name || 'Baihaqi'` → `user?.name || 'Pembaca BUKOO'` (matches the community
  fallback convention; no invented persona).

### 3.4 `ReadingScreen.tsx` — strip diagnostic logs only
- **Delete** the two `[WebView Diagnostic]` `console.log`s (L140, L148) inside the embedded
  JS bridge string (`__bukooLoadPdfFromChunks` / `__bukooLoadBookFromChunks`).
- **Delete** the three `[Perf]` `console.log`s in `handleMessage`:
  - `READY` case: TTFF log (keep the restore-position logic that follows it).
  - `PAGE_CHANGED` case: page-turn latency log (keep the `pageTurnStartTimeRef` reset so the
    ref-based timing never breaks; remove the ref entirely only if it has no other use).
  - `SHELL_READY` case: shell-ready duration log.
- **Keep** all `console.error`/`console.warn` error handlers (`[ReadingScreen] …`, `[PDF.js] …`,
  `[WebView] __bukooGoToPage error`, `Failed to parse WebView message`, `WebView error`) — they
  are legitimate error reporting, not noise.
- If `mountTimeRef`/`pageTurnStartTimeRef` become unused after removing the logs, remove them
  too (after confirming no other references). No other reader behavior changes.

### 3.5 `.env.example` — real vars only
Replace with only the vars the app actually reads:
```
EXPO_PUBLIC_API_URL=https://api.bukoo.id/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```
- Drop `SUPABASE_URL`, `SUPABASE_ANON_KEY` (zero usages in `src/`).
- Rename `GOOGLE_CLIENT_ID` → `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (matches `LoginScreen` L43;
  the old name was never read).

### 3.6 Favorite-genre fallback — decision point
Two layers today:
- `userProfileService.getFavoriteGenres()` returns `['Fiksi', 'Agama']` when nothing is saved.
- `EditProfileModal.tsx` seeds `useState(['Fiksi', 'Agama'])` before async hydration.

**Option A (recommended — honest):** fallback returns `[]`; modal seeds `[]`; user explicitly
picks genres. Home then shows `"Trending Minggu ini"` + base category pills only (title logic
at `HomeScreen` L88 already handles empty `favoriteGenres`), and the AI companion genre matching
simply has no favorites until set. Removes the last fake default.
**Option B (keep as UX default):** treat `['Fiksi','Agama']` as intended onboarding defaults, not
fake data. No code change.

**Default for implementation: Option A**, unless you prefer B. This is the one user-facing
change beyond stat removal.

---

## 4. Layout / Styling Tokens
- No new design tokens. Reuse existing `ProfileScreen` styles (`quickStatItem`, `dayPill`/
  `dayPillActive`/`dayPillInactive`, `statTile`, etc.) exactly as-is — only the *values* change.
- Removing the "Follower" stat leaves 2 items in `quickStatsRow`; keep the existing flex row
  (it renders whatever count of items is present — verify no hardcoded 3-column assumption).

---

## 5. Verification Plan
Per AGENTS.md, run for `apps/mobile` (the only touched workspace):
1. `npx tsc --noEmit -p apps/mobile/tsconfig.json` (from repo root or workspace).
2. `npm run lint` (from `apps/mobile`).
3. `npm run test` (from `apps/mobile`) — **mobile has no test script**; state explicitly, don't claim tests pass.

Additional manual checks:
- Grep in `apps/mobile/src` for `StoreScreen|Baihaqi|\[Perf\]|\[WebView Diagnostic\]` → **0 hits**.
- Grep in `apps/mobile/.env.example` for `SUPABASE` → **0 hits**.
- Confirm `apps/mobile/src/screens/store/` no longer exists.
- Manual sanity: open Profile tab → stats show real values (0 if fresh install); Home greeting
  shows "Pembaca BUKOO" when no name; reader still loads books (no behavior change).

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| `StoreScreen` | Delete entirely | Unregistered dead code; feature surface covered by Home + Search |
| Profile "Follower" stat | Remove | No data source exists; fabricating a real follower system is out of scope |
| Streak week title + chevrons | Static `"Minggu Ini"`, remove non-functional chevrons | "Agustus Week 1" is fabricated; chevrons have no handlers |
| Streak day pills | Real `getWeekLogs()` data | Replaces fake `dayNum <= 6` activity |
| Home name fallback | `'Pembaca BUKOO'` | Matches community convention; removes invented persona |
| Reader logs | Remove `[Perf]` + `[WebView Diagnostic]` only | Keep error handlers; reader monolith split is a separate task |
| `.env.example` | Real Expo vars only | Removes stale Supabase + misnamed Google var |
| Favorite-genre default | **Option A (honest empty)** unless user objects | Last fake default; user explicitly opts into genres |
