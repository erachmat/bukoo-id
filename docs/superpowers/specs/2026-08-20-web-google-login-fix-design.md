# Design Spec — Fix Web Google Login (accounts.id NOT NULL bug) — 2026-08-20

## Executive summary

Web Google sign-in is broken on production (`bukoo.id`). The NextAuth v5
`@auth/drizzle-adapter` (v1.11.3) `linkAccount()` inserts into the `accounts`
table **without an `id`**. `accounts.id` is a bare `TEXT PRIMARY KEY` with no
default, so live D1 rejects the insert with
`NOT NULL constraint failed: accounts.id` (SQLITE_CONSTRAINT_NOTNULL, code
7500).

Consequences (confirmed in prod data):
- Every web Google sign-in fails at the linking step → user sees an OAuth
  callback error ("Gagal menyelesaikan otentikasi Google").
- `createUser` runs first and persists → **orphan user rows** (no linked
  account, `password = NULL`). 4 orphans found in prod D1.
- Orphan users then hit the cascade: register → "Email ini sudah terdaftar";
  email/password login → "Email atau password salah" (no password on the
  account).

`sessions.id` has the identical latent bug (adapter `createSession` also omits
`id`) — not hit today because the session strategy is JWT, but fixed alongside.

## Root cause (verified)

- Live D1 schema fully migrated; `drizzle-kit check` clean — NOT a schema-drift
  issue.
- Reproduced live: the exact adapter insert (`INSERT INTO accounts (user_id,
  type, provider, provider_account_id, ...)`) fails on remote D1 with
  `NOT NULL constraint failed: accounts.id`.
- 6 Google-created users but only 2 `accounts` rows (those 2 were created by
  the mobile API, which passes `{ id: createId(), ... }`).
- Fresh email/password register + login + session creation verified working
  live (throwaway accounts, cleaned up).

## Component spec

Single source of truth: `packages/db/src/schema.ts` (Drizzle SQLite schema).

### Change 1 — `accounts.id`

```ts
id: text('id').primaryKey().$defaultFn(() => createId()),
```

### Change 2 — `sessions.id`

```ts
id: text('id').primaryKey().$defaultFn(() => createId()),
```

### Change 3 — dependency

Add `"@paralleldrive/cuid2": "^2.2.2"` to `packages/db/package.json`
`dependencies` (matches the version pinned in `apps/api` and `apps/web`).

## Why `$defaultFn` (client-side) instead of a migration

- Drizzle runs `$defaultFn` at query-build time, so the generated `INSERT`
  includes the `id` — the DB never sees a missing PK.
- No D1 migration, no `drizzle-kit` drift (`$defaultFn` is metadata, not a SQL
  default — verified `drizzle-kit check` stays clean).
- Zero risk to the D1 migration rules in `AGENTS.md` (no remote schema change).

## Layout / styling tokens

N/A — no UI changes.

## Orphan-user self-healing

No backfill needed. On the next web Google login of an orphan user:
`getUserByAccount` → null → `getUserByEmail` finds the row →
`allowDangerousEmailAccountLinking: true` → `linkAccount` now succeeds → an
`accounts` row is created and the user is signed in.

## Verification plan

1. `npm run typecheck --workspace=@bukoo/db`; `npm run build --workspace=@bukoo/db`;
   `npm run db:check` (drizzle-kit check) → clean.
2. `npm run typecheck` + `npm run lint` for `apps/web` and `apps/api`
   (0 errors; pre-existing warnings only). Note: `apps/web`/`packages/db` have
   **no test files**; `apps/api` tests run (14/14 pass).
3. Local SQL proof: `db.insert(accounts).values({...no id}).toSQL()` includes a
   generated cuid2 id in params[0] (and same for `sessions`).
4. Deploy `npm run deploy:prod` from `apps/web`; verify bundle contains the
   fix (`createId` + `defaultFn` in schema chunks); smoke-test `/login`,
   `/register`, `/api/auth/session`, `/library` → 200.
5. Manual (needs a real Google account): complete a Google login on
   `bukoo.id` → lands on `/library`; confirm a new row appears in
   `accounts`; re-login of a previously orphaned user (e.g.
   `baihaqi.r@gmail.com`) also succeeds.

## Out of scope

- UX copy for passwordless accounts ("sudah terdaftar" / "salah" messages).
- `AUTH_SECRET` rotation (task.md open item) — unrelated.
