# SDD Ledger — publisher-logout-fix

- Task 1 (topbar logout): complete — `<form action>` wrapper removed in
  `apps/web/src/app/publisher/topbar-client.tsx`; direct `onClick` →
  `signOut({ redirectTo: "/publisher/daftar" })`.
- Task 2 (sidebar logout): complete — same fix in
  `apps/web/src/app/publisher/sidebar-client.tsx` footer button.
- Task 3 (verification): complete — web typecheck ✅; lint **0 errors** (26 pre-existing
  warnings, none on changed lines) ✅; tests: `apps/web` has **no test script** (stated);
  greps: `<form action={async` / `redirectTo: "/publisher/login"` → 0 hits in publisher files ✅.
- Task 4 (bookkeeping): complete — plan checkboxes + root `task.md` updated.
- Deploy: complete — `npm run deploy:prod` → worker version `21b5555c-dc84-4cac-bd4d-fb9cc00719e3`
  live on bukoo.id + publisher.bukoo.id (2026-08-26). Smoke: `/`, `/publisher/login`,
  `/publisher/daftar`, `/api/auth/session` → 200; unauthed dashboard renders public showcase.
- Remaining: manual smoke QA (login → Keluar → `/publisher/daftar`, session cleared).
