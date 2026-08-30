# Implementation Plan — Fix Landing Auth Button Flicker on Back-Navigation

<!-- superpowers:subagent-driven-development -->

- **Date:** 2026-08-30
- **Spec:** `docs/superpowers/specs/2026-08-30-navbar-auth-flicker-design.md`
- **Workspace:** `apps/web` only
- **Verification owner:** main agent (single-file change; no subagents needed)

## Context

`apps/web/src/app/(marketing)/Navbar.tsx` forces a client session refetch on every mount via
`update()`, which in `next-auth@5.0.0-beta.31` unconditionally flips `status` to `'loading'`
(`node_modules/next-auth/react.js` line 339). `renderAuthButtons()` swaps the real buttons for an
invisible 160×40 placeholder while loading — the blink on back-navigation from `/login`
(different route group → Navbar remount).

The session is already server-seeded per request (`await auth()` in the root layout →
`<SessionProvider session={session}>`), so the refetch is redundant.

## Tasks

### Task 1 — Remove the redundant session refetch from Navbar

**Files:** `apps/web/src/app/(marketing)/Navbar.tsx`

1. - [x] Delete the mount effect (current lines 23–25):
   ```tsx
   useEffect(() => {
     update();
   }, [update]);
   ```
2. - [x] Drop `update` from the destructure (current line 12):
   ```tsx
   const { status, update } = useSession();
   ```
   becomes
   ```tsx
   const { status } = useSession();
   ```
3. - [x] Leave `renderAuthButtons()` untouched — the `status === 'loading'` placeholder branch stays as
   a dead-path safety net.
4. - [x] Check whether the `useEffect` import is still needed (the scroll listener effect remains, so it
   should stay).

**Verify:**
- [x] `npx tsc --noEmit` in `apps/web` (via `npm run typecheck --workspace=apps/web`) passes.
- [x] `npm run lint --workspace=apps/web` — 0 errors (29 pre-existing warnings, all unrelated files).
- [x] `npm run test --workspace=apps/web` — full suite green (60/60; lib-only — **no component
  test covers Navbar, gap flagged per AGENTS.md, not silently skipped**).

### Task 2 — Update tracking artifacts

1. - [x] Check off Task 1 boxes in this file.
2. - [x] Update SDD ledger `.superpowers/sdd/navbar-auth-flicker/progress.md`.
3. - [x] Add/check off the entry in root `task.md`.

**Verify:** manual QA steps from the spec (landing → `Masuk` → Back → no blink; signed-in
regression: `Library`/`Keluar` render immediately; `Keluar` server-action sign-out still works) —
listed for the user since automated component tests don't exist.
