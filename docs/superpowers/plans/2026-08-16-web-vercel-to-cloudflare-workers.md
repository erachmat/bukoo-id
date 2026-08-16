# Implementation Plan: Migrate Web Hosting — Vercel → Cloudflare Workers

> Plan mode: `superpowers:subagent-driven-development`
> Spec: `docs/superpowers/specs/2026-08-16-web-vercel-to-cloudflare-workers-design.md`
> Status: Approved by user (2026-08-16)

---

## Phase 0 — Local prep (Vercel untouched)

- [x] **T0.1** Bump `next` to `>=16.2.11` in `apps/web/package.json` (adapter-tested line) + install `@opennextjs/cloudflare`, `wrangler`, `@cloudflare/workers-types` (devDeps).
- [x] **T0.2** Remove unused `@vercel/blob` dep from `apps/web/package.json`.
- [x] **T0.3** Rewrite `apps/web/src/lib/db.ts` → `getDb()` via `getCloudflareContext().env.DB` + `drizzle-orm/d1` (no module-level `db`).
- [x] **T0.4** Update the 15 `import { db } from '@/lib/db'` call sites to `getDb()` (auth, admin, publisher, book, catalog, (auth), resume-reading).
- [x] **T0.5** Switch R2 uploads in `admin/books/actions.ts` + `publisher/books/actions.ts` to `env.BUKOO_STORAGE.put/delete`; drop REST token helpers.
- [x] **T0.6** Auth: add `trustHost: true` in `apps/web/src/auth.config.ts`; ensure `jwt` role backfill in `lib/auth.ts` uses `getDb()`.
- [x] **T0.7** Build config: `next.config.ts` `output:'standalone'`; add `open-next.config.ts`; add `apps/web/wrangler.jsonc` (D1 `DB`, R2 `BUKOO_STORAGE`, `nodejs_compat`); add build/deploy scripts; `wrangler types` → `worker-configuration.d.ts`.
- [x] **T0.8** Verify: `tsc -p apps/web/tsconfig.json` ✅, lint touched files ✅, `next build` ✅, `opennextjs-cloudflare build` ✅ (worker.js), `wrangler deploy --dry-run` ✅ (bindings: DB/BUKOO_STORAGE/ASSETS).

### Auth adapter fix (found during T0.8 — pre-existing web Google OAuth was broken)
- [x] `DrizzleAdapter(db)` failed drizzle `is()` brand check at module scope → fixed with branded lazy proxy (drizzle SQLite entity kind) that resolves `getDb()` per access.
- [x] Adapter was using default singular tables (`user`/`account`/`session`) which don't exist in D1 → passed schema mapping (users/accounts/sessions/verificationTokens); cast via instantiation-expression type (`SqliteAdapterSchema`).
- [x] D1 `users` lacked `emailVerified`/`image` → added columns in `packages/db/src/schema.ts` + generated `0001_cultured_shiva.sql` + applied ALTER to D1 remote (verified).
- [ ] Note: `0001_fts5_books.sql` not in drizzle meta journal (pre-existing) — flagged for follow-up.

## Phase 1 — Preview deploy (Vercel stays live)

- [ ] **T1.1** `wrangler deploy` preview worker (`bukoo-web-preview`) → workers.dev URL.
- [ ] **T1.2** Functional tests on preview: Google + credentials login, JWT role → `/publisher/dashboard`, admin, publisher books CRUD + R2 upload, server actions (50 MB), reader, middleware redirects.
- [ ] **T1.3** Fix any preview-only issues; re-deploy preview.

## Phase 2 — Prod cutover ✅ COMPLETE (2026-08-16)

- [x] **T2.1** Point custom domain at the worker; rebuild with `NEXT_PUBLIC_SITE_URL` = prod domain.
  - [x] `wrangler.prod.jsonc` (`routes: [{ pattern: "bukoo.id", custom_domain: true }]`), `deploy:prod` script (inline `NEXT_PUBLIC_SITE_URL=https://bukoo.id`), `.env.production`.
  - [x] `bukoo.id` zone added + active in Cloudflare; user deleted imported Vercel DNS records; Google OAuth redirect URI added by user.
  - [x] `npm run deploy:prod` — bukoo.id custom domain live. Smoke tests all pass (see SDD ledger).
- [x] **T2.2** Deploy `bukoo-web`; smoke test prod. User chose NO Vercel rollback (decommissioned immediately); workers.dev kept as temp fallback (`workers_dev:true`) — flip off after final confirmation.

## Phase 3 — Decommission Vercel (in progress)

- [x] **T3.1** Remove `apps/web/vercel.json`; strip `BLOB_READ_WRITE_TOKEN` + legacy Neon `DATABASE_URL` from `apps/web/.env` AND root `.env` (both are merged by OpenNext). Updated `.env.example`, `AGENTS.md`, `worker-configuration.d.ts`.
- [ ] **T3.2** Update docs — AGENTS.md updated; task.md pending; PR notes.
- [ ] (user) Delete Vercel project + verify Neon DB no longer needed.

## Phase 3 — Decommission Vercel

- [ ] **T3.1** Delete Vercel project; remove `apps/web/vercel.json`, `BLOB_READ_WRITE_TOKEN`, legacy Neon `DATABASE_URL` if unused.
- [ ] **T3.2** Update docs (`AGENTS.md`, this plan, task.md); PR notes.

---

## Key interfaces

### `apps/web/src/lib/db.ts` (target)
```ts
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@bukoo/db';

export function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}
```

### `apps/web/wrangler.jsonc` (target, mirrors `apps/api`)
```jsonc
{
  "name": "bukoo-web",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [{ "binding": "DB", "database_name": "bukoo-db", "database_id": "84f02aaa-eda5-4a93-ae92-ace4f00af03c" }],
  "r2_buckets": [{ "binding": "BUKOO_STORAGE", "bucket_name": "bukoo-assets" }],
  "assets": { "directory": ".open-next/assets" }
}
```

### Call-site change pattern
```ts
// before
import { db } from '@/lib/db';
const x = await db.query.users.findFirst(...);
// after
import { getDb } from '@/lib/db';
const db = getDb();
const x = await db.query.users.findFirst(...);
```

## Verification per task
- Each task: `npx tsc --noEmit -p apps/web/tsconfig.json` + `npm run lint` (no NEW errors).
- Phase gates: `next build` → `opennextjs-cloudflare build` → preview functional tests → prod smoke.
