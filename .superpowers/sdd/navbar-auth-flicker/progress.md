# SDD Ledger — navbar-auth-flicker

- Plan: `docs/superpowers/plans/2026-08-30-navbar-auth-flicker.md`
- Spec: `docs/superpowers/specs/2026-08-30-navbar-auth-flicker-design.md`

## Task 1 — Remove the redundant session refetch from Navbar

**Task 1: complete — verification clean** (typecheck ✅, lint 0 errors / 29 pre-existing warnings ✅,
tests 60/60 ✅; flagged gap: no component test covers Navbar — lib-only suite)

## Task 2 — Update tracking artifacts

**Task 2: complete** (plan checkboxes checked, this ledger updated, root task.md entry added)

**Remaining (user, manual QA):** landing → click `Masuk` → browser Back → `Masuk`/`Coba Gratis`
render immediately with no blink; signed-in regression: `Library`/`Keluar` render immediately and
server-action sign-out still works.
