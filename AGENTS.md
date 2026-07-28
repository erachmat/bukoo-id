# AGENTS.md — bukoo-id

Read this fully before making changes. If anything here is stale, fix it in the same PR.

## What this is
BUKOO — mobile reading application. npm workspaces + Turborepo monorepo.
- `apps/*` — deployable apps
- `packages/*` — shared code (`@bukoo/shared-types` etc.)

Run `ls apps` and `ls packages` at the start of any session — this file will not
always list every app/package. Known apps as of writing:
- `apps/api` — backend, Dockerized, deployed to Railway. Entry: `dist/main.js`. Health check: `/health`.
- `apps/web` — Next.js web app, NextAuth, Prisma/Postgres, deployed to Vercel (bukoo-id-web.vercel.app).
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

## Database / Prisma — hard rules
This project has already hit a near-miss where `prisma migrate dev` generated a destructive
`DROP COLUMN` / `ADD COLUMN` pair for what should have been a `RENAME COLUMN`. Treat every
Prisma migration as dangerous until reviewed.

1. Never run migrations against the production database directly.
2. For any schema change, use `prisma migrate dev --create-only` first — inspect the generated
   SQL before applying anything.
3. If the generated SQL contains `DROP COLUMN`/`ADD COLUMN` where you intended a rename,
   hand-edit the migration to `RENAME COLUMN ... TO ...` instead.
4. Validate against a Neon branch parented from `production` (not against local/prod directly)
   before merging. Point `DATABASE_URL` at the branch, apply, verify data survives, then merge.
5. Never delete or rename a Neon branch used for an open PR's testing.

## Environment
- Copy `.env.example` → `.env` at repo root for local dev of the web app: `DATABASE_URL`,
  `AUTH_SECRET` (`npx auth secret` to generate), `NEXT_PUBLIC_SITE_URL`.
- `apps/api` and the mobile app likely need their own `.env` — check for `apps/api/.env.example`
  and an Expo env config; if missing, create one when you add a new required var, and update
  this file.
- Never commit real secrets. Never print `.env` contents in chat/PR descriptions.

## Deployment
- **Web → Vercel**: auto-deploys from `main`; PRs get preview deployments. Don't assume a preview
  exists until you've checked — link it in the PR if so.
- **API → Railway**: builds from monorepo root via `apps/api/Dockerfile` (`railway.toml`).
  `startCommand = node dist/main.js`, health check `/health`, restart on failure (max 3 retries).
  If you change the API's build output path or entrypoint, update `railway.toml` in the same PR.
- Any change to `apps/api` that could affect the health check response or startup time needs a
  manual note in the PR — Railway will restart-loop a broken deploy 3x before giving up.

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
- Don't touch `railway.toml` build/deploy config without understanding it changes the live API.
- Don't add new top-level dependencies to root `package.json` — put them in the specific
  app/package's `package.json` unless truly shared across all workspaces.
- Don't assume a workspace has tests — verify, and flag gaps instead of skipping silently.
