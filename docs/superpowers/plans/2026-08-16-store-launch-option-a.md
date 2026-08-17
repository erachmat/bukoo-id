# Implementation Plan: BUKOO Store Launch — Option A (Free Reader + Web Pay)

**Date**: 2026-08-16  
**Status**: Approved by user (Option A)  
**Workflow**: `superpowers:subagent-driven-development`  
**Artifacts**: spec `docs/superpowers/specs/2026-08-16-store-launch-option-a-design.md` · ledger `.superpowers/sdd/store-launch-option-a/progress.md`

Workspace names for verification: `@bukoo/mobile` (apps/mobile), `bukoo` (apps/web), `@bukoo/api` (apps/api), `@bukoo/db` (packages/db), `@bukoo/shared-types`.

---

## Phase 1 — Release-readiness hardening

### 1.1 Branded API: `api.bukoo.id` + env swap
- [ ] Add custom domain `api.bukoo.id` to `apps/api` worker (via Cloudflare dashboard **or** `routes: [{pattern:'api.bukoo.id', custom_domain:true}]` in `apps/api/wrangler.jsonc`, redeploy).
- [ ] Verify `curl https://api.bukoo.id/health` → 200.
- [ ] Update `EXPO_PUBLIC_API_URL` → `https://api.bukoo.id/v1` in:
  - [ ] `apps/mobile/eas.json` (dev, preview, production)
  - [ ] `apps/mobile/.env` (if present)
  - [ ] `apps/mobile/src/services/api.ts` fallback (line ~5)
  - [ ] `apps/mobile/src/screens/book/BookDetailScreen.tsx` fallback (line ~396, no `/v1` suffix)
- [ ] Grep for `erachmat-dev.workers.dev` in mobile src — 0 occurrences after changes (annotationSync uses shared `api`).
- [ ] Keep old workers URL working for a grace period (custom domain coexists); document removal after smoke.

### 1.2 Google client ID reconciliation + Android OAuth
- [ ] Identify canonical Google OAuth client for native Android (create Android-type client with SHA-1 of release keystore, package `com.erachmat.bukoo` in Google Cloud Console).
- [ ] Set `EXPO_PUBLIC_GOOGLE_CLIENT_ID` = Android client's `serverClientId` in `eas.json` (all profiles) + `.env`.
- [ ] Update `LoginScreen.tsx` fallback constant to the chosen ID (remove drift with eas.json).
- [ ] Confirm `google-services.json` at `apps/mobile/android/app/google-services.json` has the Android client with matching SHA-1.
- [ ] Web NextAuth: keep `AUTH_GOOGLE_ID/SECRET`; verify redirect URIs include `https://bukoo.id/api/auth/callback/google`.

### 1.3 Apple Sign-In native capability
- [ ] Add `"expo-apple-authentication"` to `app.json` `plugins`.
- [ ] Rebuild native (`npx expo prebuild`/EAS) so entitlements file includes Sign In with Apple; confirm present in archive.

### 1.4 Privacy + Terms pages + in-app links
- [ ] Create `apps/web/src/app/(legal)/privacy/page.tsx`.
- [ ] Create `apps/web/src/app/(legal)/terms/page.tsx`.
- [ ] Link from web footer + `LoginScreen` checkbox + `ProfileScreen` menu (privacy/terms rows).
- [ ] Verify routes: `https://bukoo.id/privacy`, `/terms` return 200.

### 1.5 EAS release config sanity
- [ ] Confirm `eas.json` production = `app-bundle` AAB, `appVersionSource: remote`, `channel: production`.
- [ ] Decide versionCode/CFBundleVersion via EAS (auto-increment) — no manual juggling.
- [ ] Confirm keystore will be EAS-managed (no debug-signed APK to stores). Doc note only.

---

## Phase 3 — Subscription: entitlement foundation (Option A — web-only monetization)

### 3.1 Schema: add `priceYearly` (decision from spec)
- [ ] Add `priceYearly: real('price_yearly')` (nullable? or notNull default 0) to `subscriptionPlans` in `packages/db/src/schema.ts`.
- [ ] Generate D1 migration: `cd packages/db && npx drizzle-kit generate` (output `000X_*.sql`); review SQL (no FTS triggers — REPLACE rule from AGENTS.md).
- [ ] Apply to remote: `npx wrangler d1 execute bukoo-db --remote --file=packages/db/drizzle/<migration>.sql` with review; do NOT use `--create-only` against prod without review.
- ⚠️ Do not touch `0001_fts5_books.sql` (FTS5 delete-trigger quirk — don't re-add).

### 3.2 Seed `subscription_plans` (4 plans)
- [ ] Create seed script `packages/db/src/seed.ts` (or extend `apps/api` seed — check existing seed location; `apps/api/prisma/seed.ts` was Prisma-era; prefer new drizzle seed in packages/db) that inserts/upserts:
  - plan_BACA (PELAJAR) 29900/289000
  - plan_PLUS 49900/499000 (isPopular)
  - plan_PERSONAL 79900/799000
  - plan_FAMILY 95900…
  Wait — correct yearly: 289.000 / 499.000 / 799.000 / 959.000. Use integers (real type fine).
- [ ] Idempotent on `id`; `currency='IDR'`, `trialDays=7`, features JSON arrays (from SubscriptionScreen), `isActive=true`.
- [ ] Run against local dev D1 + note prod apply procedure (review first).

### 3.3 Shared tier helper (kill 4x duplication)
- [ ] Create `apps/web/src/lib/subscription.ts`:
  - `getUserTierFromDb(userId, db)` → `'FREE' | PELAJAR | PERSONAL | PLUS | FAMILY` from active subscription.
  - Also export `getSubscriptionForUser` returning full row.
- [ ] Refactor `apps/web/src/app/(app)/book/[id]/page.tsx`, `book/[id]/read/page.tsx`, `apps/api/src/routes/books.ts`, `apps/api/src/routes/reading.ts` to use it (keep API copy — it's in a different package; consider `packages/db` helper shared by both later).

### 3.4 SECURITY FIX: `download.epub` route
- [ ] Patch `apps/web/src/app/api/books/[id]/download.epub/route.ts`:
  - Require `const session = await auth()` → 401 if none.
  - Fetch `subscriptions` for `session.user.id`; compute tier; `if (!isBookAccessible(tier, book.subscriptionRequired)) → 403` with `NextResponse('Forbidden', {status:403})`.
  - Keep streaming + 404 when book/epubKey missing; no buffering.
- [ ] Verify: unauth → 401; free user + paid book → 403; subscribed/paid book → 200; free book → 200 (any auth).

### 3.5 API: `/me` subscription payload + UserPublicDto
- [ ] `apps/api/src/routes/users.ts` `GET /me`: include `subscription: { active, tier, planId, expiresAt, paymentGateway }` derived from subscriptions row (ACTIVE/TRIALING check; `expiresAt` = `currentPeriodEnd`).
- [ ] Update `apps/mobile/src/stores/authStore.ts` `UserPublicDto` + mapping in `apps/mobile/src/services/api.ts` to parse new field.
- [ ] `GET /v1/me` → confirm shape via curl with a token (test account).

### 3.6 Mobile informational subscription UI (store compliance)
- [ ] `apps/mobile/src/screens/subscription/SubscriptionScreen.tsx`: remove all `onPress` purchase handlers; keep carousel + toggle; add status header from `user.subscription`; add neutral "Kelola langganan di bukoo.id" text (non-link).
- [ ] `ProfileScreen.tsx`: replace `UPGRADE ↗` CTA with status display; remove dead `activeModal==='subscription'` modal path; keep "Langganan" → informational screen; add privacy/terms rows → (web URLs as plain text or `Linking`? — **no**; use Android config change? → show alert with URL string, no auto-open; or open WebView only if store-compliant (reader apps may show web links for non-payment content; but simplest: plain text). Decide: plain text row + copyable).
- [ ] `AiCompanionScreen.tsx`: PLUS badge static-only.
- [ ] Grep mobile src for `purchase|checkout|subscribeOrder|payment|xendit|midtrans|buynfts` → 0 purchase CTAs.

### 3.7 Store-compliance scan (verification)
- [ ] `grep -RniE "checkout|payment|buy|subscribe|xendit|midtrans|purchase" apps/mobile/src` → only informational copy, no actionable purchase code.
- [ ] Mobile release build (`eas build --profile production` when accounts ready; for now `assembleRelease` via gradle) → install → walk SubscriptionScreen (no CTA), Profile (no UPGRADE to payment), Google Sign-in OK.

---

## Phase 4 — Xendit (blocked on PT/Xendit account) — scaffold contract now

### 4.1 Adapter interface (build now)
- [ ] `apps/web/src/lib/payments/xendit.ts`: thin wrapper types + `createInvoice({plan, cycle, userId})` + `verifyWebhookToken(rawBody, token)` (constant-time compare of `x-callback-token` header) + idempotent `applyWebhookInvoice(db, payload)` that upserts `subscriptions`.
- [ ] `apps/web/src/app/api/payments/xendit/route.ts`: POST handler calling wrapper; returns 200 fast; stores events (log table optional).
- [ ] Mock mode via env `XENDIT_SANDBOX=1` to test UI flow without keys.

### 4.2 (Later — blocked) real keys + `/subscribe` page
- [ ] Xendit sandbox → keys → prod keys as `wrangler secret put` (web: `XENDIT_SECRET_KEY`, `XENDIT_WEBHOOK_TOKEN`).
- [ ] `/subscribe` page (auth) → plan cards → `createInvoice` → redirect Xendit page → success redirect `/subscribe/success`.
- [ ] Account page `/account/subscription`: show status, cancel button (sets `cancelAtPeriodEnd`).
- [ ] Wire `pricing` CTA → `/subscribe`.

---

## Phase 6 — Store submission (blocked on Phase 0 legal/accounts)

- [ ] (After PT + D-U-N + accounts) Android: EAS AAB production build → Play Console (Play App Signing, data safety, screenshots incl. tablet, no IAP) → review.
- [ ] iOS: EAS production → TestFlight → App Review (privacy nutrition labels, iPhone+iPad screenshots) → note "free reader app, subscriptions via web".
- [ ] Reviewer account `cloudtest@bukoo.app` documented in review notes.
- [ ] Post-launch: Firebase A/B (Remote Config) on store builds; Play Experiments/App Store PO after live.

---

## Verification checklist for every touched workspace
- [ ] `npm run typecheck --workspace=@bukoo/mobile` / `--workspace=bukoo` / `@bukoo/api` / `@bukoo/db` (names per package.json; if `apps/web` name is `bukoo`, use `--workspace=bukoo`).
- [ ] `npm run lint --workspace=…` (same set).
- [ ] `npm run test --workspace=…` (no tests exist in mobile/web/api — explicitly say so rather than claim).
- [ ] Manual endpoints as listed above.

## Notes
- AGENTS.md hard rules: D1 migration NEVER against prod directly (review SQL first; `--create-only` when uncertain); don't re-add FTS5 delete-triggers; don't add root-level deps; no secrets in chat/PR.
- The web app name is `bukoo`, not `@bukoo/web` — adjusted commands accordingly.