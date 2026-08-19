# AGENTS.md — bukoo-id

Read this fully before making changes. If anything here is stale, fix it in the same PR.

## What this is
BUKOO — mobile reading application. npm workspaces + Turborepo monorepo.
- `apps/*` — deployable apps
- `packages/*` — shared code (`@bukoo/shared-types` etc.)

Run `ls apps` and `ls packages` at the start of any session — this file will not
always list every app/package. Known apps as of writing:
- `apps/api` — **Cloudflare Worker** backend (Hono), deployed to `api.bukoo.id`. Entry: `src/index.ts` (via `wrangler.jsonc`). Health check: `/health` (auth-free, for Cloudflare). The old `Dockerfile`/`railway.toml`/`apps/api/api` NestJS leftovers are stale — ignore them.
- `apps/web` — Next.js web app (NextAuth v5, Drizzle ORM), **deployed to Cloudflare Workers** → https://bukoo.id (migrated from Vercel 2026-08-16; Vercel decommissioned). DB is **Cloudflare D1** `bukoo-db` via the `DB` binding (NOT Neon/Postgres).
- mobile app — Expo / React Native (root deps: `expo`, `react-native`, `react` 19).

## Commands (run from repo root — Turborepo fans these out per workspace)
```
npm run build        # turbo run build
npm run dev           # turbo run dev
npm run lint          # turbo run lint
npm run typecheck     # turbo run typecheck
npm run test          # turbo run test
npm run clean         # turbo run clean
```
To scope to one app: `npm run typecheck --workspace=<app-name>` or `turbo run test --filter=<app-name>`.

**Before declaring any task done, an agent must run and pass, for every workspace it touched:**
1. `npx tsc --noEmit` (or `npm run typecheck --workspace=X`)
2. `npm run lint --workspace=X`
3. `npm run test --workspace=X`
If a workspace has no tests, say so explicitly rather than silently skipping — don't claim "tests pass."

## Database — hard rules (D1 via Drizzle, was Prisma/Neon)
The web app database is **Cloudflare D1** (`bukoo-db`), accessed via the `DB` binding
in the web worker (`drizzle-orm/d1`). Drizzle migrations live in `packages/db/drizzle/`.

1. Never run migrations against the production D1 database directly — use `wrangler d1
execute` with `--create-only` style review first, and validate generated SQL. The only
   sanctioned path to apply a migration remotely is the manual `migrate-d1.yml` GitHub
   Actions workflow (generate → `--remote --dry-run` review → apply only when confirmed).
2. **FTS5 gotcha (critical):** Cloudflare D1 does NOT support FTS5 `DELETE`/`UPDATE`
   operations on virtual tables AT ALL — not just the special `'delete'` command, but
   also plain `DELETE FROM ..._fts WHERE ...` (both throw `SQLITE_ERROR 7500`). Only
   **INSERT into the FTS index works**. ⚠️ Local miniflare (`wrangler d1 execute --local`)
   DOES support FTS deletes, so local tests can pass while remote D1 fails — always
   verify FTS trigger behavior against REMOTE. The only D1-safe sync design (migration
   `0003_fix_fts5_triggers.sql`, 2026-08-17) is an **insert-only** `AFTER INSERT`
   trigger; NO delete/update triggers. Soft-removal uses `is_published = 0` (the API
   search JOIN filters `b.is_published = 1`), and hard-DELETE leaves a harmless orphan
   FTS row that the JOIN excludes. Do NOT re-add delete/update FTS triggers.
3. `0001_fts5_books.sql` is NOT in the drizzle meta journal (pre-existing quirk).
4. The web app no longer uses Neon or `DATABASE_URL` — that var was removed from
   `apps/web/.env` (2026-08-16). `apps/api` may still use its own storage.

## Environment
- Copy `.env.example` → `.env` at repo root for local dev of the web app: `AUTH_SECRET`
  (`npx auth secret` to generate), `NEXT_PUBLIC_SITE_URL`. No `DATABASE_URL` needed —
  local web dev uses D1 bindings via `wrangler dev`.
- `apps/api` and the mobile app likely need their own `.env` — check for `apps/api/.env.example`
  and an Expo env config; if missing, create one when you add a new required var, and update
  this file.
- Never commit real secrets. Never print `.env` contents in chat/PR descriptions.

## Deployment
- **Web → Cloudflare Workers** (`apps/web`): build + deploy from `apps/web`:
  - Preview/dev worker: `npm run deploy:preview` (name `bukoo-web-preview`).
  - Production: `npm run deploy:prod` → builds with `NEXT_PUBLIC_SITE_URL=https://bukoo.id`
    and deploys `bukoo-web` via `wrangler.prod.jsonc` (custom domain `bukoo.id` on the
    `bukoo.id` zone; D1 `DB`, R2 `BUKOO_STORAGE`, `ASSETS` bindings; `nodejs_compat`).
  - Secrets on the worker (set via `wrangler secret put`): `AUTH_SECRET`, `AUTH_GOOGLE_ID`,
    `AUTH_GOOGLE_SECRET`.
  - R2 covers are served via `/covers/[...key]`; EPUB for the reader via
    `/api/books/[id]/download.epub` (must end `.epub` for epubjs). Cover URLs must be built
    with `getCoverUrl()` from `apps/web/src/lib/cover-url.ts`.
  - `react-reader`/`react-pdf` must stay as `next/dynamic(..., { ssr: false })` — they use
    browser-only `DOMMatrix` which crashes Workers SSR.
- **API → Cloudflare Workers** (`apps/api`): `npm run deploy` from `apps/api` → deploys the `bukoo-api`
  worker (custom domain `api.bukoo.id`; D1 `DB`, R2 `BUKOO_STORAGE`, `AI` bindings; `nodejs_compat`).
  Secrets via `wrangler secret put`: `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `APPLE_CLIENT_ID`,
  `MAILCHANNELS_API_KEY`, `MAIL_FROM`. The legacy Railway/Docker config is decommissioned — do not revive it.
- Any change to `apps/api` that could affect `/health` or startup should be noted in the PR (a broken
  deploy is caught by Cloudflare health checks, not Railway retries).

## CI/CD (GitHub Actions)
All pipelines live in `.github/workflows/`:
- **`ci.yml`** — runs on every PR + push to `main`: `lint` → `typecheck` → `test` (turbo), plus
  `db-check` (`drizzle-kit check` drift check). No service containers — API tests mock D1/R2/AI.
- **`deploy-web.yml`** — `preview` job deploys `bukoo-web-preview` on PRs (URL posted as a PR
  comment); `prod` job deploys `bukoo-web` on push to `main` via `deploy:prod`, then smoke-tests
  `https://bukoo.id` (expect 200).
- **`deploy-api.yml`** — deploys `bukoo-api` on push to `main` (`wrangler deploy`), then
  smoke-tests `https://api.bukoo.id/health`.
- **`migrate-d1.yml`** — MANUAL (`workflow_dispatch`): generates pending Drizzle migrations,
  prints a `--remote --dry-run` diff for review, and applies only when `apply_remote=true`.
  This is the ONLY sanctioned path for applying D1 migrations (see Database hard rules).
- Required GitHub repo secrets: `CLOUDFLARE_API_TOKEN` (scoped to Workers Scripts/Routes Edit,
  D1 Edit, R2 Edit, Account Settings Read) and `CLOUDFLARE_ACCOUNT_ID`.
- Worker runtime secrets (AUTH_*, JWT_SECRET, GOOGLE_*, APPLE_*, MAILCHANNELS_*, MAIL_FROM)
  stay managed via `wrangler secret put` — CI deploys preserve them, never re-put them in CI.
- CI runs on **Node 22 LTS**.

## Coding conventions
- TypeScript throughout, strict mode assumed — don't introduce `any` to silence errors; fix the type.
- Prettier + ESLint (`@typescript-eslint`) — run `npm run lint` before finishing, don't hand-format.
- Shared types go in `packages/shared-types`, not duplicated per-app. If you find duplicated
  domain types across apps, that's a refactor worth flagging even if out of scope for the task.

## Task tracking
`task.md` at repo root is used as a running checklist for active work (checkbox format,
grouped by task with sub-steps). When picking up a task:
- Check `task.md` first for context on what's in flight.
- Check off sub-steps as completed, don't just check the parent item.
- If `task.md` doesn't cover your task, add a new top-level entry rather than working untracked.

## Bug-fix workflow
1. Reproduce first — write or point to a failing test/repro before changing code, when feasible.
2. Scope the fix to the actual bug; don't drive-by refactor in the same change unless asked.
3. Run the full command checklist above for every touched workspace, not just the one with the bug.
4. Note in the PR description which workspaces were affected and what was verified.

## What NOT to do
- Don't run destructive Prisma migrations without the Neon-branch validation step above.
- Don't touch `apps/api/wrangler.jsonc` bindings/routes without understanding it changes the live API
  (`api.bukoo.id`). (Old `railway.toml`/`Dockerfile` are stale leftovers — ignore them.)
- Don't add new top-level dependencies to root `package.json` — put them in the specific
  app/package's `package.json` unless truly shared across all workspaces.
- Don't assume a workspace has tests — verify, and flag gaps instead of skipping silently.
