# Design Spec — Publisher Logout Fix ("Keluar" does nothing)

**Date:** 2026-08-26
**Status:** Approved (user: "Start implementation")
**Workspaces touched:** `apps/web` only

## Executive summary

Publisher logout buttons already exist in the publisher dashboard (avatar dropdown in the
topbar + footer of the sidebar) and are wired to the sanctioned server action
`signOut()` from `apps/web/src/app/(auth)/actions.ts`. However, clicking "Keluar" is a
no-op. Root cause: both publisher logout buttons wrap the server action inside an inline
async `<form action={...}>` closure — a pattern unique to these two files. Every working
sign-out in the codebase (`admin-sidebar.tsx`, `account-sign-out.tsx`, `Navbar.tsx`)
calls the server action directly from `onClick`. The inline wrapper can swallow the
`NEXT_REDIRECT` thrown by the server action, so the session cookie clears but no
navigation happens (or nothing visibly happens at all).

Fix: replace the `<form>` wrappers with direct `onClick` handlers calling
`signOut({ redirectTo: "/publisher/daftar" })`, changing the post-logout destination from
`/publisher/login` to `/publisher/daftar` (public publisher landing page) per user decision.

## Component specs

### 1. `apps/web/src/app/publisher/topbar-client.tsx` (avatar dropdown)
- Remove the `<form action={async () => {...}}>` wrapper around the "🚪 Keluar" item.
- Render a plain `<button type="button">` keeping existing classes/styles
  (`pds-avatar-item danger`, inline styles).
- Handler: `onClick={() => { setAvatarOpen(false); signOut({ redirectTo: "/publisher/daftar" }); }}`
  — do NOT `await`; the server action throws `NEXT_REDIRECT` internally which Next.js
  handles by navigating; awaiting inside a client handler adds nothing.

### 2. `apps/web/src/app/publisher/sidebar-client.tsx` (sidebar footer)
- Remove the `<form action={...}>` wrapper in `.pds-side-foot`.
- Attach `onClick={() => signOut({ redirectTo: "/publisher/daftar" })}` to the existing
  styled button, preserving all inline styles exactly.

### Unchanged (reference only)
- `apps/web/src/app/(auth)/actions.ts` — `signOut(options?)` server action stays as-is;
  it is the AGENTS.md-sanctioned path (client `next-auth/react` signOut was unreliable at
  clearing the JWT cookie on Workers).
- `apps/web/src/middleware.ts` — `/publisher/daftar` is public; logged-in PUBLISHERs are
  redirected from it to `/publisher/dashboard`, which is correct behavior both before and
  after logout (post-logout the session is gone so the landing page renders).

## Layout / styling tokens

No visual changes. All existing classes (`pds-avatar-item danger`, `.pds-side-foot`
inline styles) and copy ("🚪 Keluar") preserved verbatim.

## Verification plan

1. **Static:** `npm run typecheck --workspace=apps/web` and
   `npm run lint --workspace=apps/web` → 0 errors (pre-existing warnings acceptable).
   Note: `apps/web` has **no test script** — stated explicitly per AGENTS.md.
2. **Behavioral (manual smoke, local dev):**
   - Login as PUBLISHER via `/publisher/login` → lands on `/publisher/dashboard`.
   - Click avatar → "Keluar" → navigates to `/publisher/daftar`;
     `/api/auth/session` returns null.
   - Log in again; click sidebar-footer "Keluar" → same result.
   - After logout, visiting `/publisher/dashboard` redirects to login (middleware gate).
3. Grep check: no remaining `<form action={async` wrappers around signOut in publisher files.
