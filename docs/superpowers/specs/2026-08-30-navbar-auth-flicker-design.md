# Design Spec — Fix Landing Auth Button Flicker on Back-Navigation

- **Date:** 2026-08-30
- **Workspace:** `apps/web` only
- **Status:** Approved ("Start implementation", 2026-08-30)

## Executive summary

On bukoo.id, a user who clicks **Masuk** on the landing page, lands on `/login`, then presses
the browser **Back** button sees the `Masuk` / `Coba Gratis` buttons flicker (appear → vanish →
appear) when returning to the landing page.

Root cause: `apps/web/src/app/(marketing)/Navbar.tsx` runs `useEffect(() => { update(); }, [update])`
on every mount. In `next-auth@5.0.0-beta.31`, `update()` unconditionally calls `setLoading(true)`
(`node_modules/next-auth/react.js` line 339), flipping `status` to `'loading'`. `renderAuthButtons()`
then swaps the real buttons for an invisible 160×40 placeholder `<div>` (Navbar.tsx lines 46–49),
and swaps them back when the `/api/auth/session` fetch resolves — one full blink cycle.

Back-navigation from `/login` triggers the remount because `(auth)` and `(marketing)` are separate
route groups with separate layouts: `(auth)` has no `<Navbar />`, so returning to `(marketing)`
reconstitutes its layout tree and remounts the Navbar. In-group navigation (e.g. `/` → `/pricing`)
keeps the layout mounted and never flickers — matching the reported repro exactly.

The `update()` call is redundant: the root layout (`apps/web/src/app/layout.tsx`) server-renders
`await auth()` per request and seeds `<SessionProvider session={session}>`
(`apps/web/src/components/providers.tsx`). Because `props.session !== undefined` always holds there
(it is `Session | null`, including `null` for guests), `SessionProvider` initializes with
`loading = false` (`React.useState(!hasInitialSession)` in `next-auth/react.js` line 242), so
`status` starts correct on first paint with no loading phase at all.

## Component specs

### `apps/web/src/app/(marketing)/Navbar.tsx` (modified)

1. Remove the mount effect:
   ```tsx
   useEffect(() => {
     update();
   }, [update]);
   ```
2. Remove `update` from the hook destructure: `const { status, update } = useSession();`
   → `const { status } = useSession();`
3. `renderAuthButtons()` is unchanged — its `status === 'loading'` placeholder branch stays as a
   harmless safety net (dead path after the fix, since initial status is never `'loading'` when the
   provider is server-seeded).

Unchanged behavior still covered elsewhere (no action needed):
- Cross-tab sign-out sync: `SessionProvider`'s BroadcastChannel/`storage` handler in
  `next-auth/react.js` (lines 254–266) still fires on session events.
- Session freshness: every navigation re-renders the root layout server-side (`await auth()`),
  so the seeded session is never stale.
- `refetchOnWindowFocus={false}` / `refetchInterval={0}` stay **off** (user decision, 2026-08-30:
  "leave off").

## Layout / styling tokens

No CSS or layout changes. Explicitly excluded:
- Hero `fadeDown` entrance animations in `apps/web/src/app/(marketing)/redesign.css` replay on
  remount by design; they are not the reported bug.
- Placeholder min-width hardening (dead path after fix).

## Verification plan

Per AGENTS.md full checklist for `apps/web`:

1. `npm run typecheck --workspace=apps/web`
2. `npm run lint --workspace=apps/web`
3. `npm run test --workspace=apps/web` — existing suite is lib-only; **flagged gap:** no component
   test covers Navbar (not silently skipped).
4. Manual reproduction (user or `npm run dev`): landing → click `Masuk` → browser Back →
   `Masuk` / `Coba Gratis` render immediately, no blink. Signed-in regression: landing →
   `/login` → Back shows `Library` / `Keluar` immediately; `Keluar` (server action from
   `(auth)/actions.ts`) still works.

Task tracking is mirrored in root `task.md` and the SDD ledger
`.superpowers/sdd/navbar-auth-flicker/progress.md`.
