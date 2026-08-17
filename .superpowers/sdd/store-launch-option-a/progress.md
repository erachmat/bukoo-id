# SDD Ledger — Store Launch Option A

Plan: `docs/superpowers/plans/2026-08-16-store-launch-option-a.md`  
Spec: `docs/superpowers/specs/2026-08-16-store-launch-option-a-design.md`  
Started: 2026-08-16 · Mode: plan-only → GO (executing Phase 1 + 3)

## Progress

- **Task 1 (SDD docs)**: complete — spec + plan + ledger created (this file). ✅
- **Task 2 (download.epub security fix)**: complete — route now enforces auth + subscription (`apps/web/src/app/api/books/[id]/download.epub/route.ts`). ✅
- **Task 3 (shared tier helper + /me)**: complete — `apps/web/src/lib/subscription.ts` (tierFromSubscription, getUserTierFromDb, canReadBook); `apps/api/src/routes/users.ts` GET+PATCH /me now return `subscription`; `authStore.ts` UserPublicDto + subscription. ✅
- **Task 4 (seed subscription_plans + priceYearly)**: complete — `packages/db/src/seed-subscriptions.ts` (4 plans, upsert + SQL export); schema `price_yearly` added; migration `0002_wet_menace.sql` generated (single ALTER ADD COLUMN, no FTS). ⚠️ NOT yet applied to remote D1 — needs review + wrangler d1 execute. ✅(code)
- **Task 5 (api.bukoo.id + env)**: complete — route `api.bukoo.id` added to `apps/api/wrangler.jsonc`; URL updated in `eas.json` (3 profiles), `.env`, `.env.example`, `api.ts`, `BookDetailScreen.tsx`. ⚠️ Custom domain must be provisioned in Cloudflare + worker redeployed. ✅(code)
- **Task 6 (Google client ID reconcile)**: complete (code) — resolved conflict: canonical is `576187863248-9voo043m0bm915b8g6b0k1m5ios9qai2` (server client id of Firebase project `bukoo-15ce3`, matching `google-services.json` SHA-1 `5e8f16062ea3cd2c4a0d547876baa6f38cabf625`). Updated eas.json (3), .env, LoginScreen fallback. ⚠️ Manual: ensure Google Cloud Console Android OAuth client has release keystore SHA-1 registered.
- **Task 7 (Apple Sign-In plugin)**: complete — `expo-apple-authentication` added to app.json plugins. ⚠️ Native rebuild required for entitlements.
- **Task 8 (privacy/terms)**: complete — pages already existed at `/privasi` + `/syarat-ketentuan` (verified). ✅
- **Task 9 (informational subscription UI)**: complete — SubscriptionScreen: removed dead UPGRADE CTA, added status banner (from /me) + neutral "Kelola langganan di bukoo.id" footer; ProfileScreen: UPGRADE↗ → "Langganan" + dynamic tier pill, dead SubscriptionModal removed; AiCompanion: dynamic tier badge; BookDetail: is_accessible gating → "Khusus Premium" informational button (no purchase). ✅
- **Task 10 (verify)**: ✅ typecheck mobile/web/api/db all pass; lint mobile clean, api 0 errors (2 pre-existing warnings in untouched files), web changed files clean (repo-wide web lint OOM = infra, known), db no lint script; tests: mobile "no tests specified", web no test script, api vitest 0 test files. Store-compliance scan: no purchase/checkout/payment code in mobile src.

## Commits
- (commit range to be recorded when git commit is made — work is uncommitted on disk)