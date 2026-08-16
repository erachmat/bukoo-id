# SDD Ledger — web-vercel-to-cloudflare-workers

Plan: `docs/superpowers/plans/2026-08-16-web-vercel-to-cloudflare-workers.md`
Spec: `docs/superpowers/specs/2026-08-16-web-vercel-to-cloudflare-workers-design.md`
Started: 2026-08-16

## Progress
- Task T0.1: complete (next 16.2.11, @opennextjs/cloudflare 1.20.2, wrangler; @vercel/blob removed)
- Task T0.2: complete
- Task T0.3: complete (lib/db.ts → getDb() via getCloudflareContext + drizzle-orm/d1)
- Task T0.4: complete (15 call sites updated)
- Task T0.5: complete (R2 uploads → BUKOO_STORAGE binding)
- Task T0.6: complete (trustHost + jwt getDb())
- Task T0.7: complete (next.config standalone, open-next.config.ts, wrangler.jsonc, scripts, worker-configuration.d.ts via wrangler types)
- Task T0.8: complete — tsc ✅, lint touched-files ✅, next build ✅, opennextjs-cloudflare build ✅ (worker.js), wrangler deploy --dry-run ✅ (bindings DB/BUKOO_STORAGE/ASSETS; 61 assets, ~10.8MB)
- Auth adapter fix: complete (branded lazy proxy + schema mapping + emailVerified/image columns in D1)
- Task T1.1: complete — deployed `bukoo-web` → https://bukoo-web.erachmat-dev.workers.dev (56 assets, startup 24ms, bindings active). Secrets set: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
- Task T1.2: complete — user confirmed: credentials login ✅, Google PUBLISHER login + redirect ✅, layout fix ✅ (after .pub-container grid fix), admin access ✅ (after D1 role fix + re-login). Preview functional checks A–D all PASS (see below).
- Tasks T2.x–T3.x: pending (require domain cutover decision)

## Phase 2 prep (2026-08-16, awaiting manual DNS steps)
- Decision recorded: prod domain = **bukoo.id apex**; DNS currently at **Vercel** (`ns1.vercel-dns.com`/`ns2.vercel-dns.com`; domain registered at Domainesia); **decommission Vercel immediately** after cutover.
- `bukoo.id` is NOT yet a zone in the Cloudflare account (API `zones?name=bukoo.id` → empty). wrangler OAuth token has `workers_routes (write)` + `ssl_certs (write)` but only `zone (read)` → **cannot create zone/DNS myself**.
- Prep done:
  - `apps/web/.env.production` added (NEXT_PUBLIC_SITE_URL=https://bukoo.id) — NOTE: OpenNext build does NOT read `.env.production`; env must be set inline (verified: `NEXT_PUBLIC_SITE_URL=https://bukoo.id npm run build:worker` bakes `"NEXT_PUBLIC_SITE_URL":"https://bukoo.id"`).
  - `apps/web/wrangler.prod.jsonc` added — `routes: [{ pattern: "bukoo.id", custom_domain: true }]` (wrangler 4.86 does NOT support top-level `custom_domains`; verified via config-schema.json CustomDomainRoute). Dry-run parses clean.
  - `deploy:prod` script updated: `NEXT_PUBLIC_SITE_URL=https://bukoo.id opennextjs-cloudflare build && wrangler deploy -c wrangler.prod.jsonc`.
  - Existing worker secrets (AUTH_SECRET/AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET) carry to prod (same `bukoo-web` worker).
- **Manual steps required from user (blocking)**: (1) add `bukoo.id` zone in Cloudflare dashboard + note NS names; (2) change NS at Domainesia from vercel-dns.com → Cloudflare NS; (3) add `https://bukoo.id/api/auth/callback/google` to Google OAuth authorized redirect URIs.
- After zone active: run `npm run deploy:prod`; if DNS-edit permission blocks custom-domain auto-provisioning (token has zone:read only), fallback = user adds custom domain via dashboard (Workers → bukoo-web → Settings → Domains → Add → bukoo.id), then redeploy.

## Preview functional checks (2026-08-16, all PASS)
- **Check A — register + login**: created throwaway `cloudtest@bukoo.app` via `/register` → landed `/library` ✅. Credentials login redirects by role ✅.
- **Check B — publisher book upload (R2)**: signed in as PUBLISHER, uploaded cover+EPUB at `/publisher/books/new` → row in D1 `books` (cover_key `covers/...png`, epub_key `epubs/...epub`, publisher_user_id set) ✅. **FIXED**: cover `<img src={coverKey}>` used raw R2 key → dead route. Added `lib/cover-url.ts` (`getCoverUrl`) + `/covers/[...key]/route.ts` streaming from `BUKOO_STORAGE`; updated publisher/admin books pages, book-mapper, edit page. Cover now renders (naturalWidth 1024) ✅.
- **Check C — reader page**: EPUB failed to load. Two fixes: (1) `react-reader`/`react-pdf` use browser-only `DOMMatrix` → SSR crash on Workers. Made `EpubViewer` + `PdfViewer` dynamic imports with `ssr:false` (removed DOMMatrix from server bundle). (2) epubjs `determineType` treats URL without `.epub` extension as DIRECTORY → fetches `META-INF/container.xml` → 404. Changed reader `fileUrl` to `/api/books/[id]/download.epub` + added matching route streaming from R2. Reader now renders cover, TOC, page-turn ✅.
- **Check D — admin CRUD**: promoted `cloudtest@bukoo.app` to ADMIN, re-login. Admin dashboard/books list render ✅. **FIXED**: any UPDATE/DELETE on `books` failed with SQLITE_ERROR 7500 — the FTS5 `books_au`/`books_ai`/`books_ad` triggers do `INSERT INTO books_fts(...) VALUES ('delete', ...)` which is a **known D1 limitation** (FTS5 special delete command unsupported). Dropped the 3 triggers in D1. Update ✅ (title persisted), Delete ✅ (row removed, R2 cleaned, "0 buku dalam katalog").
- **Pre-existing bug flagged**: `0001_fts5_books.sql` FTS triggers break all book writes on D1 (FTS5 'delete' command unsupported). Triggers dropped in D1; migration file still contains them — needs a corrective migration for fresh DBs.

## Auth adapter findings (2026-08-16, discovered during build gate)
- `DrizzleAdapter(db)` at module scope failed: drizzle `is()` brand check → "Unsupported database type". Fixed with a branded lazy proxy (drizzle SQLite entity kind on prototype chain) that resolves `getDb()` per access.
- Adapter was using DEFAULT singular tables (`user`/`account`/`session`) which DON'T exist in D1 (only plural: users/accounts/sessions/verification_tokens) → web Google OAuth was broken pre-migration. Fixed by passing schema mapping (users/accounts/sessions/verificationTokens).
- D1 `users` lacked `emailVerified`/`image` (needed by adapter createUser). Added columns: schema.ts updated + `0001_cultured_shiva.sql` migration generated + ALTER applied to D1 remote (verified via PRAGMA).
- Pre-existing quirk noted: `0001_fts5_books.sql` is NOT in drizzle meta journal (manually applied) — fresh-DB reproducibility gap, flagged not fixed.

## Phase 2 — PROD CUTOVER COMPLETE (2026-08-16) ✅
- `bukoo.id` zone added + ACTIVE in Cloudflare (NS nola/seamus.ns.cloudflare.com). User deleted imported Vercel DNS records (wrangler needed the hostname free).
- `npm run deploy:prod` succeeded → `bukoo-web` now serves **https://bukoo.id (custom domain)** + workers.dev fallback (temporarily enabled via `workers_dev:true`).
- Smoke tests on prod ALL PASS: home 200, login 200, credentials login → `/admin` (D1 live, 5 users), Google OAuth redirect → accounts.google.com with `redirect_uri=https://bukoo.id/api/auth/callback/google` (authorized ✅), covers route 404-clean, download.epub route 404-clean, static assets 200, SSL (Google Trust Services, CN=bukoo.id, valid to 2026-11-14).
- Secrets purge: rebuilt/redeployed after removing legacy `DATABASE_URL` + `BLOB_READ_WRITE_TOKEN` from `apps/web/.env` AND **root `.env`** (root .env is merged by OpenNext's extractProjectEnvVars — that was the leak). Verified 0 occurrences of the secrets in the bundle (version 34f63f72).

## Phase 3 — Vercel decommission (in progress)
- Done: removed `apps/web/vercel.json`; stripped `DATABASE_URL`/`BLOB_READ_WRITE_TOKEN` from `apps/web/.env` + root `.env`; updated `.env.example` + `AGENTS.md` (Cloudflare Workers + D1 + FTS5 gotcha + covers/reader routes + ssr:false note); regenerated `worker-configuration.d.ts` via `wrangler types --env-interface CloudflareEnv` (old interface name is what @opennextjs/cloudflare + code use; the new default `Cloudflare.Env` breaks tsc).
- Remaining (user dashboard): delete Vercel project; optionally disable Neon DB. Flagged legacy scripts `apps/web/scripts/migrate-supabase-to-neon.ts` + `test-rename-migration.ts` (unused).

## Notes
- D1 role fix: user ran `wrangler d1 execute bukoo-db --remote -- UPDATE users SET role='PUBLISHER' WHERE email='007erachmat@gmail.com'` (2026-08-16) — **VERIFIED**: SELECT returns `007erachmat@gmail.com | PUBLISHER`.
