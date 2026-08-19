# SDD Ledger — web-google-login-fix (2026-08-20)

Spec: `docs/superpowers/specs/2026-08-20-web-google-login-fix-design.md`
Plan: `docs/superpowers/plans/2026-08-20-web-google-login-fix.md`

## Progress

- Task 1: complete (spec + plan + ledger + task.md)
- Task 2: complete (`$defaultFn(() => createId())` on `accounts.id` + `sessions.id`; `@paralleldrive/cuid2@^2.2.2` in `packages/db`; rebuilt `dist`)
- Task 3: complete (db typecheck ✅ / db:check clean ✅ / web typecheck+lint ✅ 0 errors / api typecheck+lint+test ✅ 14/14 / `toSQL` proof: cuid2 id generated for both adapter inserts)
- Task 4: partial — deploy ✅ (commit `12460dc`, worker version `71c72e03`, bundle verified, smoke 200s); 4.5 manual Google click-through PENDING user (needs real Google account)
- Task 5: pending (final ledger/task.md wrap-up after 4.5)

## Review notes

- Root cause reproduced live: adapter `linkAccount()` insert without `id` →
  `NOT NULL constraint failed: accounts.id` (SQLITE_CONSTRAINT_NOTNULL 7500)
  on remote D1.
- Fix is client-side (`$defaultFn`); no D1 migration; `drizzle-kit check`
  clean after change.
- Orphan users (4 found) self-heal on next Google login via
  `allowDangerousEmailAccountLinking`.
- Diagnostic throwaway accounts created during reproduction were deleted from
  prod D1 (`DELETE FROM users WHERE email LIKE 'diagtest-%@example.com'`,
  2 rows).
- Remaining: real-Google-account click-through (manual) + wrap-up.
