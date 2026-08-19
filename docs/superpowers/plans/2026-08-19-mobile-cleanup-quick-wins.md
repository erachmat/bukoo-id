# Implementation Plan: Mobile Quick Wins — Dead Code, Fake Data, Stale Artifacts

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-mobile-cleanup-quick-wins-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/mobile` (apps/mobile) only
**Ledger**: `.superpowers/sdd/mobile-cleanup-quick-wins/progress.md`

User-approved decisions: **Option A** for favorite-genre fallback (honest empty); **remove** the
Profile "Follower" stat (no data source); static `"Minggu Ini"` week title with chevrons removed.

---

## Task 1 — Delete dead `StoreScreen`

- [x] Delete `apps/mobile/src/screens/store/StoreScreen.tsx` and the empty `store/` directory.
- [x] Confirm no `store/` references remain in `apps/mobile/src` (grep `StoreScreen` → 0 hits).

## Task 2 — `ProfileScreen.tsx`: real stats

- [x] Import `readingSync` + `readingGoalService`; add `stats` state `{ finishedBooks, totalMinutes, streakDays, weekLogs }`.
- [x] `useEffect` on mount: `getFinishedBooksCount()`, `getTotalReadingMinutes()`, `getGoalsState()` (streakDays), `getWeekLogs()`.
- [x] Quick-stats row: `finishedBooks` (Selesai), `Math.round(totalMinutes / 60)` (jam baca); **remove Follower stat**.
- [x] Streak section: title → `"Minggu Ini"`, remove non-functional chevrons, real day pills from `weekLogs` (`isCompleted` = active; day number = day-of-month), streak count = `streakDays`.
- [x] Pencapaian grid: `finishedBooks` / `Math.round(totalMinutes / 60)` / `streakDays`.
- [x] Render `0` defaults until loaded; keep "Lihat Analitik" + `ReadingAnalyticsModal` behavior.

## Task 3 — `HomeScreen.tsx`: honest name fallback

- [x] L114 `user?.name || 'Baihaqi'` → `user?.name || 'Pembaca BUKOO'`.

## Task 4 — `ReadingScreen.tsx`: strip diagnostic logs

- [x] Remove `[WebView Diagnostic]` `console.log`s (L140, L148) from embedded JS bridge string.
- [x] Remove `[Perf]` logs in `handleMessage` READY / PAGE_CHANGED / SHELL_READY cases.
- [x] Remove now-unused `mountTimeRef` / `pageTurnStartTimeRef` if no other references (verify first).
- [x] Keep all `console.error`/`console.warn` error handlers.

## Task 5 — `.env.example`: real vars only

- [x] Replace with `EXPO_PUBLIC_API_URL` + `EXPO_PUBLIC_GOOGLE_CLIENT_ID` only (drop `SUPABASE_URL`, `SUPABASE_ANON_KEY`, misnamed `GOOGLE_CLIENT_ID`; rename `API_URL` → `EXPO_PUBLIC_API_URL`).

## Task 6 — Favorite-genre fallback: Option A (honest empty)

- [x] `userProfileService.getFavoriteGenres()`: return `[]` instead of `['Fiksi', 'Agama']` (both no-data paths).
- [x] `EditProfileModal.tsx` L44: `useState<string[]>([])` (async hydration still fills real values).
- [x] Confirm HomeScreen title logic (`favoriteGenres.length > 0 ? … : 'Trending Minggu ini'`) already handles empty → no other change needed.

## Task 7 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit -p apps/mobile/tsconfig.json` → exit 0.
- [x] `npm run lint` (from `apps/mobile`) → 0 errors/warnings.
- [x] `npm run test` (from `apps/mobile`) → "No tests specified for mobile yet" (state explicitly — mobile has NO real tests).
- [x] Grep `apps/mobile/src` for `StoreScreen|Baihaqi|\[Perf\]|\[WebView Diagnostic\]` → 0 hits.
- [x] Grep `apps/mobile/.env.example` for `SUPABASE` → 0 hits.
- [x] Confirm `apps/mobile/src/screens/store/` gone.

## Task 8 — Docs

- [x] Update root `task.md` with completed entry.
- [x] Update SDD ledger `.superpowers/sdd/mobile-cleanup-quick-wins/progress.md`.
- [x] Mark all plan checkboxes complete.
