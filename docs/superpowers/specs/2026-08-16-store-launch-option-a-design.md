# Design Document: BUKOO Store Launch — Option A (Free Reader App + Pay on Web)

**Date**: 2026-08-16  
**Status**: Draft — user approved direction (Option A, Netflix/Kindle/Spotify-web model)  
**Target Workspaces**: `@bukoo/mobile`, `@bukoo/web` (apps/web), `@bukoo/api` (apps/api), `@bukoo/db` (packages/db), `@bukoo/shared-types`

---

## 1. Executive Summary

BUKOO ships as a **free** mobile reader app (Android + iOS, no in-app purchases of any kind) and monetizes entirely through a **web checkout on `bukoo.id`** powered by **Xendit** (QRIS / e-wallet / VA / cards). This is the Apple "reader app" + Google Play Policy-compliant configuration: the app contains **zero purchase surface** (no IAP SDK, no checkout links, no buttons that imply purchase), and entitlements are granted **server-side** in D1 (`subscriptions`) after web payment, then served to apps via the authenticated API.

**Non-goals (explicit):** no RevenueCat / Play Billing / StoreKit, no store SKUs, no price-parity obligations, no external purchase links inside the app, no User Choice Billing (Indonesian gateways don't support it).

---

## 2. Architecture

```
┌─────────────┐   free app (readers)          ┌──────────────────────────────┐
│  Android    │ ── auth + /me + reader ─────► │  apps/api (Hono, Workers,     │
│  iOS        │                               │  same D1 bukoo-db)             │
└─────────────┘                               └──────────────┬───────────────┘
                                                             │ entitlements
┌─────────────┐   subscribe on web            ┌──────────────▼───────────────┐
│  Web        │ ── /subscribe → Xendit ─────► │  apps/web (Next.js, Workers,  │
│  bukoo.id   │ ◄── webhook (x-callback-token)│  D1, R2, NextAuth v5)         │
└─────────────┘                               └──────────────┬───────────────┘
                                                             │ upsert
                                                    ┌────────▼────────┐
                                                    │ D1 subscriptions│
                                                    └─────────────────┘
```

Single source of truth = `subscriptions` row (user → plan → status → period). `/v1/users/me` returns it; both readers gate on it.

---

## 3. DB schema usage (no migration required)

`packages/db/src/schema.ts` already has:

| Table | Columns used | Notes |
|---|---|---|
| `subscriptionPlans` | `id` (plan_PELAJAR/plan_PLUS/plan_PERSONAL/plan_FAMILY), `name`, `priceMonthly` REAL IDR, `currency='IDR'`, `trialDays=7`, `features` JSON, `isPopular`, `isActive` | **Never seeded** — seed script required |
| `subscriptions` | `userId` (UNIQUE), `planId`, `status` `TRIALING|ACTIVE|PAST_DUE|CANCELED|EXPIRED|PENDING_PAYMENT`, `trialEndsAt`, `currentPeriodStart/End`, `cancelAtPeriodEnd`, `paymentGateway` `'MIDTRANS'\|'XENDIT'` (possibly add `'REVENUECAT'` later; not needed now), `externalSubscriptionId` | Reuse as-is; add index if needed |
| `books.subscriptionRequired` | `'FREE'\|'PELAJAR'\|'PERSONAL'\|'PLUS'\|'FAMILY'` | Existing gating assumption |

Tier derivation convention (keep): `planId.replace('plan_', '').toUpperCase()`.

---

## 3. V1 plans (seed data)

All 4 paid plans, monthly + annual, IDR (match `SubscriptionScreen` mock + web pricing marketing):

| id | name | tier | monthly | yearly | isPopular | feature summary |
|---|---|---|---|---|---|---|
| `plan_BACA` | BACA | PELAJAR | 29.900 | 289.000 | false | 2.000+ judul kurasi, koleksi lokal penuh, offline 10 judul, tanpa iklan |
| `plan_PLUS` | PLUS | PLUS | 49.900 | 499.000 | true | 2.000+ judul + Audiobook, audiobook Indonesia, offline unlimited, AI rekomendasi, komunitas penuh |
| `plan_PERSONAL` | Premium | PERSONAL | 79.900 | 799.000 | false | seluruh katalog global, 3 kredit buku terbaru, AI Companion penuh, BUKOO Originals, priority support |
| `plan_FAMILY` | Keluarga | FAMILY | 99.900 | 959.000 | false | semua fitur Premium, 5 profil, konten anak + parental control, sharing keluarga, 5 akun hemat 40% |

`priceMonthly` / `priceYearly` stored as REAL IDR (schema has only `priceMonthly`; **decision**: add `priceYearly` column via migration OR store both in 2 rows `…_monthly`/`…_annual`. **Chosen: add `priceYearly` (number, nullable) column** — simpler, keeps plan IDs clean, avoids 8 plan rows in store-facing naming.)

---

## 4. Web: subscribe + webhook + manage

### 4.1 `/subscribe` (page, auth required)
- Plan cards (4 plans × monthly/annual toggle) → render Xendit **invoice create** for chosen plan+cycle (`external_id = <planId>:<cycle>:<userId>:<ts>`, `customer.user_id` = web user id, `success_redirect_url = https://bukoo.id/subscribe/success`, `failure_redirect_url = /subscribe?error=payment`).
- If user already has active sub → show "Manage subscription" state instead of plan cards.
- Response: Xendit gives invoice URL → `redirect()`.

### 4.2 Webhook `apps/web/src/app/api/payments/xendit/route.ts` (POST)
- Verify signature: Xendit sends `x-callback-token` header; compare to `XENDIT_WEBHOOK_TOKEN` secret (constant-time compare). **(Not HMAC body signature; Xendit uses callback token header.)**
- Handle:
  - `payment.paid` / `invoice.paid` → upsert `subscriptions` (status `ACTIVE`, `paymentGateway='XENDIT'`, `externalSubscriptionId=invoice.id`, `currentPeriodEnd= next billing or +1mo/+1yr`, `cancelAtPeriodEnd=false`).
  - `invoice.expired` → if PENDING→EXPIRED.
  - `invoice.cancelled` → PENDING→CANCELED.
  - Recurring (xendit subscription-based): map `recurring.created/charged/failed` → create/update per event. For v1 keep simple invoice-based (one-time each period) or Xendit recurring API (later).
- Respond `200` quickly; do work idempotently (key by invoice id), log.

### 4.3 Manage subscription (web account page `/account/subscription`)
- Shows current `subscriptionPlans` + status + next charge (from `subscriptions`).
- "Batalkan" → sets `cancelAtPeriodEnd=true` (webhook `invoice.expired` at period end → `EXPIRED`).
- No auto-renewal triggering needed at v1 (invoice per period).

### 4.4 Entitlement on web
- `book/[id]/page.tsx` + `book/[id]/read/page.tsx`: already gate via `isBookAccessible`. **Fix gap: `api/books/[id]/download.epub/route.ts` (see §7).**
- `/library`: `catalog-query.ts` currently only filters by user-chosen `free|premium` toggle; option to filter by user's actual tier (nice-to-have).

---

## 5. Web: SECURITY FIX — `download.epub` route

**Current bug:** `apps/web/src/app/api/books/[id]/download.epub/route.ts` streams the R2 EPUB to **any** logged-in (or even anonymous) caller — no auth, no subscription check. Any user can download paid books' files directly.

**Fix:** require `auth()` session; fetch `subscriptions` for `session.user.id`; compute `userTier`; `if (!isBookAccessible(userTier, book.subscriptionRequired)) → 403`. Keep streaming (no buffering), 404 when book/epub missing. **(Still allow FREE books for logged-out? Reader page requires login, so keep auth-required for ALL downloads → consistent with read/page.tsx.)**

Also add a shared helper `getUserTierFromDb(userId, db)` in `apps/web/src/lib/subscription.ts` (or `packages/db`) used by both the download route and the two book pages — stop the 4x copy-paste.

---

## 6. Mobile: informational-only subscription UI (store compliance)

### 6.1 `SubscriptionScreen.tsx` — rewrite to informational
- Remove: `onPress` on cards/UPGRADE button; any `Linking.openURL` to checkout; any "Beli/Langganan" CTA.
- Keep: dark forest + gold theme, 5-card carousel (4 paid + Gratis), monthly/yearly toggle, feature list.
- Add: reads `user.subscriptionTier` + `/me.subscription` → shows "Status: PLUS aktif s/d 12 Okt 2026" if active, else "Kamu belum berlangganan".
- Add neutral helper line: "Kelola langganan di bukoo.id" (plain `<Text>`, **not** a link/button to payment).
- No purchase action exists; nothing calls a payment SDK.

### 6.2 `ProfileScreen.tsx`
- Replace `UPGRADE ↗` button (currently navigates to Subscription): either hide, or keep as "Langganan" info nav (status display) — must not trigger purchase.
- Remove the dead `activeModal === 'subscription'` modal path (or repurpose to informational status modal).
- Menu "Langganan" → navigates to informational Subscription.
- No web payment deep-link.

### 6.3 `AiCompanionScreen.tsx`
- PLUS badge (if exists) → static indicator only; no CTA to buy.

### 6.4 API client
- `apps/mobile/src/services/api.ts` + `stores/authStore.ts`: extend `UserPublicDto` with `subscription?: { active, tier, planId, expiresAt, paymentGateway }`; hydrate after `/v1/me`.
- No billing SDK dependency added anywhere.

---

## 7. Branding + API URL

- Set custom domain `api.bukoo.id` on the API worker (`wrangler` routes / custom domain on bukoo.id zone). Test `https://api.bukoo.id/health`.
- Update `EXPO_PUBLIC_API_URL` → `https://api.bukoo.id/v1` in:
  - `apps/mobile/eas.json` (development, preview, production profiles)
  - `apps/mobile/.env`
  - `apps/mobile/src/services/api.ts` fallback (line 5)
  - `apps/mobile/src/screens/book/BookDetailScreen.tsx` (line ~396 fallback, no `/v1`)
  - `apps/mobile/src/services/annotationSyncService.ts` (uses shared `api` — no change needed beyond `api.ts`)
- Keep old workers.dev URL working? Optional: add custom domain route alongside; keep workers URL for a grace period then remove after smoke.

---

## 8. Auth / Google client ID / Apple Sign-In

- **Reconcile Google client IDs**: `eas.json` uses `17547501035-…` (likely the real prod web client for the Expo project), `LoginScreen.tsx` fallback + `.env` use `576187863248-…`. Decide ONE:
  - Use the **Android OAuth client (server client id)** — for native Google Sign-In on Android, we should use the Android app's **serverClientId** (+ its SHA-1 registered). Document exact ID + provide step: create/reuse OAuth 2.0 client of type Android in Google Cloud Console with package `com.erachmat.bukoo` + release keystore SHA-1; set `EXPO_PUBLIC_GOOGLE_CLIENT_ID` to that Android client ID.
  - Note: Google Sign-In on iOS uses `REVERSED_CLIENT_ID` (iOS client); Expo handles via app.json `ios.googleServicesFile`? We use native packages; keep web clientId for iOS OAuth flow.
  - For web (bukoo.id NextAuth): keep `AUTH_GOOGLE_ID/SECRET` (unchanged); ensure авторизова redirect uri includes both `http(s)://localhost:3000/api/auth/callback/google` (dev) and `https://bukoo.id/api/auth/callback/google`.
- **Apple Sign-In**: add `"expo-apple-authentication"` to `app.json` plugins (native capability required on iOS; already implemented in `LoginScreen`). Android: not applicable (Google-only as social).

---

## 9. Privacy & Terms

- Add `apps/web/src/app/(legal)/privacy/page.tsx` and `(legal)/terms/page.tsx` (simple, styled, dark-forest accents, links to bukoo.id). 
- Expose URLs: `https://bukoo.id/privacy`, `https://bukoo.id/terms`.
- Link from: web footer + `LoginScreen` (checkbox confirmation + link) + `ProfileScreen` (menu rows "Kebijakan Privasi"/"Syarat & Ketentuan").
- Both store listings will reference these URLs.

---

## 10. Test plan / verification (per AGENTS.md)

For every touched workspace:
1. `npm run typecheck --workspace=X` (`X` = `@bukoo/mobile`, `@bukoo/web`?)
   - Verify commands: are the workspace names `@bukoo/mobile` & `@bukoo/web` correct per AGENTS.md? `web` package name is `apps/web`; check its `package.json` `name`. Use `npm run typecheck --workspace=apps/web` / `--workspace=apps/mobile`? AGENTS.md says `--workspace=<app-name>` (name field of that package.json). Validate at runtime — can also `npm run typecheck --workspace=@bukoo/mobile` since that's proven.
2. `npm run lint --workspace=…`
3. `npm run test --workspace=…` (state "no tests exist" if none — don't claim pass)
4. Manual:
   - Web: `curl https://api.bukoo.id/health`
   - Security: request `/api/books/<paidBookId>/download.epub` unauth → expect 401; as free user → 403; as subscribed user → 200.
   - Mobile: build release (`./gradlew assembleRelease` or EAS), install via Firebase, verify SubscriptionScreen shows info only + no purchase handlers; check Google Sign-in in release build.
   - Store-compliance scan: `grep -rE "subscribe|subscribe|checkout|payment|xendit|bukoo\\.id|Linking" apps/mobile/src` — ensure no purchase CTA / external payment link in-app.

---

## 10. Timeline

- Phase 1 (branding/API URL, Google ID, Apple plugin, privacy/terms): ~1–2 days code.
- Phase 3 (seed plans, tier helper, /me subscription, epub gap fix, mobile info UI): ~2–3 days.
- Phase 4 (Xendit): blocked on PT/Xendit account; scaffold adapter interface now (~1 day) + real integration after.
- Verification + store submission prep: per above.

---

## 11. Open questions / flags

1. Exact `apps/web` package name for `--workspace` (check `apps/web/package.json`).
2. Which Google OAuth client is "canonical" — resolve before release build.
3. `priceYearly` column migration (plan approved? add now while schema is young).
4. `subscriptions.paymentGateway` add `'XENDIT'` value already exists? yes. Keep `MIDTRANS` legacy.
5. Worker env for webhook: `XENDIT_WEBHOOK_TOKEN`, `XENDIT_SECRET_KEY` (not yet set).