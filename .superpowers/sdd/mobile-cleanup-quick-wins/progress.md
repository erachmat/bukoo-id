# SDD Ledger — Mobile Quick Wins: Dead Code, Fake Data, Stale Artifacts

Plan: `docs/superpowers/plans/2026-08-19-mobile-cleanup-quick-wins.md`
Spec: `docs/superpowers/specs/2026-08-19-mobile-cleanup-quick-wins-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (delete StoreScreen)**: complete — `src/screens/store/StoreScreen.tsx` (388 LOC, unregistered) deleted; empty `store/` dir removed. Verified: zero `store/` imports anywhere in `apps/mobile/src`. ✅
- **Task 2 (ProfileScreen real stats)**: complete — all hardcoded stats replaced with real local data from `readingSync` + `readingGoalService`:
  - Quick-stats row: `finishedBooks` (Selesai) + `Math.round(totalMinutes/60)` (jam baca); **Follower stat removed** (no data source).
  - Streak section: title `"Minggu Ini"` (non-functional chevrons removed); day pills from real `getWeekLogs()` (real day labels, day-of-month, `isCompleted` = active); streak count = `streakDays`.
  - Pencapaian grid: real `finishedBooks` / `Math.round(totalMinutes/60)` / `streakDays`.
  - Loaded via `useEffect` with `Promise.all`; renders 0 until loaded; "Lihat Analitik" → `ReadingAnalyticsModal` behavior kept. ✅
- **Task 3 (HomeScreen name fallback)**: complete — `user?.name || 'Baihaqi'` → `'Pembaca BUKOO'`. ✅
- **Task 4 (ReadingScreen logs)**: complete — `[Perf]` logs (READY / PAGE_CHANGED / SHELL_READY) + `[WebView Diagnostic]` logs (PDF/EPUB chunk assembly, embedded bridge string) removed; now-unused `mountTimeRef` / `pageTurnStartTimeRef` (+ their assignments in `handleLeftTap`/`handleRightTap`) removed; **all `console.error`/`console.warn` error handlers kept**. ✅
- **Task 5 (.env.example)**: complete — now only `EXPO_PUBLIC_API_URL` + `EXPO_PUBLIC_GOOGLE_CLIENT_ID`. Dropped: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, misnamed `GOOGLE_CLIENT_ID`, and `API_URL` (renamed to `EXPO_PUBLIC_API_URL` to match `services/api.ts`). ✅
- **Task 6 (favorite-genre Option A)**: complete — `userProfileService.getFavoriteGenres()` returns `[]` on both no-data paths; `EditProfileModal` seeds `[]` (async hydration still fills real values); HomeScreen "Trending Minggu ini" title logic already handles empty favorites — no other change needed. ✅
- **Task 7 (verify)**: ✅ `npx tsc --noEmit` exit 0; `npm run lint` 0 errors/warnings; `npm run test` = "No tests specified for mobile yet" (stated explicitly — mobile has NO real tests). Greps: `StoreScreen|Baihaqi|[Perf]|[WebView Diagnostic]` → **0 hits** in `apps/mobile/src`; `SUPABASE` → **0** in `.env.example`; `apps/mobile/src/screens/store/` gone.
- **Task 8 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **Follower stat removed** (user-approved) — no data source exists; a real follower system is out of scope for the cleanup roadmap.
2. **Favorite-genre fallback: Option A** (user-selected) — honest empty `[]`; users explicitly pick genres in Edit Profile; Home shows "Trending Minggu ini" until genres are set.
3. **`[Perf]` timing refs removed with the logs** — `mountTimeRef` / `pageTurnStartTimeRef` were only used by the deleted diagnostics; removed after confirming no other references.
4. **`.env.example` rename superset** — `API_URL` → `EXPO_PUBLIC_API_URL` (matches `services/api.ts` L5) in addition to the spec's `GOOGLE_CLIENT_ID` → `EXPO_PUBLIC_GOOGLE_CLIENT_ID` (matches `LoginScreen` L43).

## Commits
- Not committed yet — changes are in the working tree (`ProfileScreen.tsx`, `HomeScreen.tsx`, `ReadingScreen.tsx`, `userProfileService.ts`, `EditProfileModal.tsx`, `.env.example`, deleted `StoreScreen.tsx`, docs). Left for the user to commit as one logical change: `refactor(mobile): quick wins — dead code, fake data, stale artifacts`.
