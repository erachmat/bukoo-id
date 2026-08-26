# Implementation Plan — Publisher Logout Fix

> superpowers:subagent-driven-development

**Spec:** `docs/superpowers/specs/2026-08-26-publisher-logout-fix-design.md`
**Workspaces touched:** `apps/web`

## Task 1 — Fix topbar avatar-menu logout
- [x] In `apps/web/src/app/publisher/topbar-client.tsx`, replace the `<form action={async () => {...}}>` wrapper around the "🚪 Keluar" item with a direct `<button type="button" onClick={() => { setAvatarOpen(false); signOut({ redirectTo: "/publisher/daftar" }); }}>` keeping `pds-avatar-item danger` classes/styles.
- Verify: file compiles; no unused imports remain. ✅

## Task 2 — Fix sidebar footer logout
- [x] In `apps/web/src/app/publisher/sidebar-client.tsx`, replace the `<form action={...}>` wrapper in `.pds-side-foot` with the existing button gaining `onClick={() => signOut({ redirectTo: "/publisher/daftar" })}`, preserving inline styles.
- Verify: file compiles; no unused imports remain. ✅

## Task 3 — Verification
- [x] `npm run typecheck --workspace=apps/web` → pass.
- [x] `npm run lint --workspace=apps/web` → 0 errors (26 pre-existing warnings, none on changed lines).
- [x] Tests: `apps/web` has **no test script** — stated explicitly (AGENTS.md rule).
- [x] Grep: `<form action={async` → 0 hits in publisher files; `redirectTo: "/publisher/login"` → 0 hits in publisher files.
- [ ] Manual smoke (user/local dev): login → dashboard → Keluar (avatar + sidebar) → `/publisher/daftar`, session cleared, dashboard revisit gated.

## Task 4 — Bookkeeping
- [x] Update SDD ledger `.superpowers/sdd/publisher-logout-fix/progress.md`.
- [x] Add entry to root `task.md`.
