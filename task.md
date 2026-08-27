# APK → Firebase Distribution (release signing + verified flow) — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-apk-firebase-distribution-design.md`, plan `docs/superpowers/plans/2026-08-27-apk-firebase-distribution.md`, ledger `.superpowers/sdd/apk-firebase-distribution/progress.md`. User-approved ("Start implementation").
- `[x]` 2. Release signing wiring in `apps/mobile/android/app/build.gradle`: `loadKeystoreProperties()` reads gitignored `keystore.properties`; `signingConfigs.release` used when present, else debug fallback (current behavior preserved).
- `[x]` 3. `apps/mobile/android/keystore.properties.example` template committed; `android/.gitignore` ignores `keystore.properties`, `*.jks`, `*.keystore` (`!debug.keystore`).
- `[x]` 4. `deploy:firebase` convenience script (build + distribute in one step) added to `apps/mobile/package.json`.
- `[x]` 5. `FIREBASE_MVP_TESTING.md` updated: Release signing one-time setup, debug-fallback note, "Verified 2026-08-27" header note, file map.
- `[x]` 6. Verification: mobile typecheck ✅, lint ✅ (0 errors); no mobile tests exist (placeholder — stated explicitly); `npm run apk:release` → BUILD SUCCESSFUL, `app-release.apk` produced; `git check-ignore` confirms keystore files ignored; Firebase CLI logged in as `erachmat.dev@gmail.com` (read-only).
- `[x]` 7. Keystore issue fixed (2026-08-27): original keystore was generated with a bash-mangled `!#` password → regenerated `bukoo-release.keystore` reading passwords from gitignored `keystore.properties` (never printed); `keytool -list` unlock verified; release APK now signed with release cert `CN=BUKOO` (SHA-256 `6935bd8b…`). **Back up keystore + passwords.**
- `[x]` 8. Distributed to `mvp-testers` 2026-08-27 — release `1.0.0 (1)` uploaded, then superseded by `1.0.1 (2)`.
- `[x]` 9. Google Sign-In "Developer error" (status 10 `DEVELOPER_ERROR`) on the Firebase APK — root cause: release cert SHA-1 (`BF:E4:B6:3D:95:9D:8C:3D:9F:69:77:74:A3:97:04:09:F3:39:EC:83` = `bukoo-release.keystore`) was NOT registered in Firebase, only debug's (`5E:8F:16:...`). Fixed by adding the release SHA-1 in Firebase console + re-downloading `google-services.json` (now lists both cert hashes for `com.erachmat.bukoo`).
- `[x]` 10. No-new-APK gotcha (two causes): (a) Gradle kept `assembleRelease UP-TO-DATE` — the `google-services.json` change is not a cache-invalidation input, so use `./gradlew clean assembleRelease` (codegen/CMake target may fail on the first clean pass — rerun once); (b) same `versionCode` → App Distribution "re-uploaded already existing release" with no visible new build. Fixed by bumping `versionCode 2` / `versionName "1.0.1"` in `android/app/build.gradle`.
- `[x]` 11. Verified fresh release: Firebase reports `uploaded new release 1.0.1 (2)`; APK signed w/ release cert digest `bfe4b63d...`; `output-metadata.json` shows `versionCode 2` / `versionName 1.0.1`.
- `[ ]` 12. Manual QA (user): tester reinstalls `1.0.1 (2)` → Google account picker appears, no Developer error.

# Reader Settings Modal: Drag-to-Expand (fix) — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-settings-modal-drag-expand-design.md`, plan `docs/superpowers/plans/2026-08-27-settings-modal-drag-expand.md`, ledger `.superpowers/sdd/settings-modal-drag-expand/progress.md`. User-approved ("Start implementation").
- `[x]` 2. Height model: single `Animated.Value` `sheetHeight` (px) replaces `sheetProgress` + interpolation; `COLLAPSED=0.52*H`, `EXPANDED=0.9*H` (fixed).
- `[x]` 3. PanResponder drag + grabber bar at top of sheet (full-width hit area + header grab zone); `setValue` on move, `stopAnimation` on grant, snap on release (midpoint + `vy`).
- `[x]` 4. Scroll-up to expand restored (one-shot trigger past 24px; NO collapse-on-scroll branch → no viewport-clamp feedback loop; collapse via drag handle). Auto-fit dropped — fixed 90% target per user.
- `[x]` 5. Verification: mobile typecheck ✅, lint ✅; no mobile tests (placeholder — stated explicitly).
- `[ ]` 6. Manual QA (`npm run android`): drag up/down smooth, snap on release, expanded holds & shows all sections, reopen resets, settings persist.
- `[x]` 7. Update ledger `settings-modal-drag-expand` + this file; commit.

# Reader Settings Modal: Expand & Reorder — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-settings-modal-expand-reorder-design.md`, plan `docs/superpowers/plans/2026-08-27-settings-modal-expand-reorder.md`, ledger `.superpowers/sdd/settings-modal-expand-reorder/progress.md`. User-approved ("Start implementation").
- `[x]` 2. Scroll-up to expand (Option A, snap): sheet animates between ~52% and ~90% via one-shot `Animated.timing` on scroll intent (up past 24px → open, back to top → close); no 1:1 feedback loop (original live-growth felt janky — replaced); resets collapsed + scroll-to-top on open. **SUPERSEDED 2026-08-27** by drag-to-expand (see "Reader Settings Modal: Drag-to-Expand (fix)") — scroll-offset trigger had a clamp feedback loop (sheet growth → viewport > content → offset clamped to 0 → collapse) causing lag + never holding 90%.
- `[x]` 2. Scroll-up to expand (Option A, snap): sheet animates between ~52% and ~90% via one-shot `Animated.timing` on scroll intent (up past 24px → open, back to top → close); no 1:1 feedback loop (original live-growth felt janky — replaced); resets collapsed + scroll-to-top on open.
- `[x]` 3. Reordered sections: Ukuran Teks → Tema Warna → Jenis Huruf → Jarak Baris → Mode Perpindahan Halaman → Rataan Teks (Margin kept last).
- `[x]` 4. Theme picker → round swatches (no text), reader's real theme bg colors, gold ring + checkmark on active, a11y labels.
- `[x]` 5. Font picker → horizontal chips 'Sans' / 'Serif' / 'Spacemono' (system monospace relabel); active detection normalized by family (fixes default 'DM Sans' not matching).
- `[x]` 6. Verification: mobile typecheck ✅, lint ✅ (0 errors); no mobile tests exist (placeholder — stated explicitly).
- `[ ]` 7. Manual QA in Expo Go: reader settings — order, swatches, chips, expand-on-scroll, persistence.

# Mobile Dashboard/Library/AI/Profile/Reader Polish (20 items) — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-mobile-dashboard-library-polish-design.md`, plan `docs/superpowers/plans/2026-08-27-mobile-dashboard-library-polish.md`, ledger `.superpowers/sdd/mobile-dashboard-library-polish/progress.md`. User-approved ("Start implementation").
- `[x]` 2. Dashboard: remove 'Koleksi terbaik' hero; verify 'Sedang dibaca' hide; add 'Trending Minggu ini🔥' row below it; 'Rekomendasi & Trending' → 'Rekomendasi' (editors' picks on 'Semua').
- `[x]` 3. 3-button nav (items 5&6): new `useThreeButtonNav()` hook; raise tab bar (MainTabs) + reader bottom bar above the Android system nav bar.
- `[x]` 4. Rak Buku Saya: remove 'Target membaca' card; `book-02.png` count icon; merge 'Urutkan:…' + sort button; remove 'MB Offline' + 3 equal stat cards in one row; 'B' logo on AI card; AI button 'Lihat Detail' (gold/white).
- `[x]` 5. AI page: entry-card title 'Tanya Bukoo Assistant'; italic greeting subtitle; gold 'Chat Bukoo Assistant' button; compact prompt chips.
- `[x]` 6. Profile: remove 'Target membaca' card; calendar Week/Month toggle + month grid.
- `[x]` 7. Reader settings: default 4 settings, scroll-up reveals 2; no dark overlay, capped height (live preview).
- `[x]` 8. Verification: mobile typecheck ✅, lint ✅ (0 errors); no mobile tests exist (placeholder — stated explicitly).
- `[ ]` 9. Manual QA in Expo Go: dashboard, Rak Buku Saya, AI page + chat, Profile, Reader (3-button raise on real device).

# Mobile Library/AI/Profile UX — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-mobile-library-ai-profile-design.md`, plan `docs/superpowers/plans/2026-08-27-mobile-library-ai-profile.md`, ledger `.superpowers/sdd/mobile-library-ai-profile/progress.md`. User-approved.
- `[x]` 2. Dashboard: removed 'Target Membaca' card + unused analytics-modal wiring.
- `[x]` 3. Rak Buku Saya: reordered (Sedang dibaca → Target Membaca), AI card → 'Bukoo Assistant', count = total library books, sort button moved next to 'Semua Koleksi' list, fire icons on completed week days.
- `[x]` 4. AI Companion: header → 'Bukoo Assistant', 'Rekomendasi Bukoo', chat moved to new 'Tanya Bukoo Assistant' screen (entry card on AI page).
- `[x]` 5. Profile: added 'Target Membaca' card above the week calendar + enhanced calendar (month label, today ring, minutes/day, 3-letter days).
- `[x]` 6. Verification: mobile typecheck ✅, lint ✅ (0 errors); no mobile tests exist (placeholder — stated explicitly).
- `[ ]` 7. Manual QA in Expo Go: dashboard, Rak Buku Saya, AI Companion, new chat screen, Profile.

# Publisher Logout → Landing Page — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-publisher-logout-fix-design.md` + plan `docs/superpowers/plans/2026-08-27-publisher-logout-fix.md` + ledger `.superpowers/sdd/publisher-logout-fix/progress.md` (appended). User-approved.
- `[x]` 2. Middleware marker exception: sign-out redirects to `/publisher/daftar?logout=1`; new `shouldBouncePublisherFromLanding()` helper (`apps/web/src/lib/publisher-landing-guard.ts`) wired into `middleware.ts` so the marker bypasses the logged-in-publisher bounce; `LogoutMarkerCleanup` strips the marker from the address bar.
- `[x]` 3. Cookie hardening: `(auth)/actions.ts` `signOut` expires `__Secure-authjs.session-token` / `authjs.session-token` (+ CSRF variants) before the NextAuth redirect (JWT cookie clearing flaky on Workers).
- `[x]` 4. Tests: `publisher-landing-guard.test.ts` (7 cases); web tests 27/27 pass, typecheck ✅, lint 0 errors (3 pre-existing warnings).
- `[ ]` 5. Manual QA on `publisher.bukoo.id`: publisher login → Keluar → lands on `/publisher/daftar` with session cleared; customer/admin logout regression.

# Publisher Dashboard Hardening And UX — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-publisher-dashboard-hardening-design.md`, plan `docs/superpowers/plans/2026-08-27-publisher-dashboard-hardening.md`, and ledger `.superpowers/sdd/publisher-dashboard-hardening/` created; approved to implement.
- `[x]` 2. Dashboard analytics correctness and grouped-query performance.
- `[x]` 3. Focused web regression tests for isolation, dates, ranking, identity, and validation.
- `[x]` 4. Publisher route guards and notification shell consistency.
- `[x]` 5. Responsive navigation and accessible dashboard interactions.
- `[x]` 6. Campaign validation and duplicate-submit feedback.
- `[ ]` 7. Workspace verification and responsive/two-publisher QA.

# Publisher Dashboard Features — 2026-08-27

- `[ ]` Premium tier insights: aggregate reader-tier conversion potential per premium book.
  - `[x]` Implementation complete; web tests/typecheck/lint pass (20 tests).
  - `[ ]` Browser QA and deployment.

- `[ ]` Featured Book program: admin curation, publisher badge, and real storefront featured row.
  - `[x]` Implementation complete; migration `0009_slim_dazzler.sql` validated; web tests/typecheck/lint pass.
  - `[ ]` Browser QA and deployment.

- `[ ]` Publisher catalog follow-ups: content-edit re-review integrity and bulk catalog actions.
  - `[x]` Implementation complete; policy tests and web typecheck pass.
  - `[x]` Full automated verification: 18 tests pass, typecheck/lint clean.
  - `[ ]` Browser QA and deployment.

- `[ ]` Publisher geo analytics: country aggregates, CF-IPCountry wiring, and reachable Sebaran Geografis tab.
  - `[x]` Implementation complete; DB/API/web verification passed.
  - `[ ]` Apply migration through `migrate-d1.yml`, deploy, and complete browser QA.

- `[ ]` Publisher catalog self-service: search, filters, sorting, pagination, safe publication toggle, storefront links.
  - `[x]` Implementation complete; web tests/typecheck/lint pass.
  - `[ ]` Browser QA and production deployment.

- `[ ]` 1. Publisher credibility & polish: admin-configurable royalty, URL tabs, real covers/metadata, lead capture, admin navigation, and QA.
  - `[x]` Implementation complete: settings, dashboard polish, admin submissions link, and lead capture.
  - `[ ]` Apply migration through `migrate-d1.yml`, deploy web, and complete browser/two-publisher QA.

- `[x]` 1. Period-aware dashboard aggregates with SQL distinct readers and shareable period chips.
- `[x]` 2. Shared owned catalog, per-book analytics, and privacy-safe reader retention buckets.
- `[x]` 3. Admin campaign review with publisher notifications.
- `[x]` 4. Honest manual payout ledger and settlement empty state.
- `[x]` 5. Web typecheck/lint/tests pass; authenticated browser and two-publisher QA remain.

# Publisher Dashboard: Settings Shell, Promotions & Logout — 2026-08-27

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-27-publisher-dashboard-promotions-design.md` + plan `docs/superpowers/plans/2026-08-27-publisher-dashboard-promotions.md` + ledger `.superpowers/sdd/publisher-dashboard-promotions/`. User-approved ("Start implementation").
- `[x]` 2. DB: add `publisherCampaignRequests` table to `packages/db/src/schema.ts` + migration `0006_warm_sir_ram.sql` (additive CREATE TABLE + 2 indexes; no FTS5 ops; db:check clean).
- `[x]` 3. Settings: `/publisher/settings` rendered inside `DashboardShell`; payout blank-number preserves existing masked account (+ length validation); responsive `pds-settings-grid` restyle.
- `[x]` 4. Promotions: new `/publisher/promotions` (shell + list + request form); `createCampaignRequest` server action (ownership/published validation, notification, revalidate).
- `[x]` 5. Nav wiring: sidebar `promosi` → `/publisher/promotions`; `TAB_ROUTES` + dashboard-client placeholder cleanup (settings/promosi removed).
- `[x]` 6. Logout: harden both controls (useTransition await server action, pending state, redirect `/publisher/daftar`).
- `[x]` 7. Verification: db build/typecheck/`db:check` ✅; web typecheck ✅ / lint 0 errors (26 pre-existing warnings) ✅; no web test script (stated).
- `[x]` 8. **DEPLOYED 2026-08-27**: commit `8856359` pushed to main → CI green (lint/typecheck/test/db-check ✅). D1 migration `0006_warm_sir_ram.sql` applied to remote `bukoo-db` via `migrate-d1.yml` (`gh workflow run` apply_remote=true; log `│ 0006_warm_sir_ram.sql │ ✅`). Web `deploy:prod` via CI `deploy-web.yml` → live on bukoo.id (smoke: `/` 200, `/publisher/dashboard` 200, `/publisher/promotions` → 307 login, `/publisher/settings` → 307 login). Deploy API success (unchanged code).
- `[ ]` 9. (manual QA) Publisher login → settings save (blank-number preserves masked account) → promotions submit (list refresh) → logout from both controls → `/publisher/daftar`.

# Publisher Dashboard Features (Core MVP) — 2026-08-26

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-26-publisher-dashboard-features-design.md` + plan `docs/superpowers/plans/2026-08-26-publisher-dashboard-features.md` + ledger `.superpowers/sdd/publisher-dashboard-features/`. User-approved.
- `[x]` 2. D1 schema: added `books.publicationStatus`, `publisherProfiles`, `publisherPayoutAccounts`, `publisherSubmissions`, `publisherBookReaderDays`, `publisherBookDailyMetrics`, `notifications`, `publisherRoyaltyPeriods/Lines`, `publisherPayouts`. Migration `0005_last_the_renegades.sql` (drizzle-kit check clean, no FTS5 ops). D1-safe.
- `[x]` 3. Publisher auth helper `apps/web/src/lib/publisher-auth.ts` (`getPublisherUser`/`getAdminUser`) used by catalog + submission actions.
- `[x]` 4. Catalog: server-side validation (≤50MB, EPUB/PDF, image types), new uploads → IN_REVIEW (not auto-publish), `updatePublisherBook`, safe R2 cleanup, edit page `books/[id]/edit`, status chips in list.
- `[x]` 5. Submission workflow: `SubmitForm` posts real files via server action → `publisherSubmissions`; admin review UI at `/admin/submissions` (setujui/tolak/minta-revisi); approval publishes to catalog + notifies.
- `[x]` 6. Reading metrics: `packages/db/src/publisher-metrics.ts` (`recordPublisherReadingMetric`) wired into web `updateReadingProgress` + API `handleUpsertProgress` — reader-days, daily metrics, completion-once, lifetime counters, idempotent.
- `[x]` 7. Dashboard real data: `dashboard/queries.ts` server query; Overview + Royalti(estimates) + top-books + recent-notifications fed by D1. demografi/geo/promosi disabled (no data source, not fabricated).
- `[x]` 8. Notifications: `/publisher/notifications` server page + mark-read/mark-all client; sidebar+shell routes wired; fake badge removed.
- `[x]` 9. Settings: `/publisher/settings` profile + masked payout account (no raw bank numbers stored).
- `[x]` 10. Navigation honesty: removed hardcoded royalties/payouts/counts, routed implemented tabs, footer shows real-data note.
- `[x]` 11. Verification: full monorepo typecheck 7/7 ✅; web lint 0 errors (26 pre-existing warnings) ✅; web **no test script** (stated); api lint 0 errors ✅ + tests **14/14** ✅; db typecheck+build+`drizzle-kit check` ✅.
- `[x]` 12. (deploy) **DEPLOYED 2026-08-26**: D1 migration `0005_last_the_renegades.sql` applied to remote `bukoo-db` via `migrate-d1.yml` (24 commands, status ✅; verified: 9 new tables + `books.publication_status` present). API redeployed (`e832e98c`, health 200). Web `deploy:prod` → `b3b6f9eb` live on bukoo.id + publisher.bukoo.id; smoke ✅ (`/`, `/publisher/daftar`, `/publisher/login`, `/api/auth/session`, `/publisher/dashboard` → 200; `/publisher/notifications`, `/publisher/settings`, `/admin/submissions`, `/publisher/books/:id/edit` → 307 to login).
- `[x]` 12b. Repo fixes found during deploy: (a) `.gitignore` `*.sql` blanket rule ignored all `packages/db/drizzle/*.sql` → migrations never committed; added `!packages/db/drizzle/**/*.sql` + committed `0000–0005`. (b) `migrate-d1.yml` used `--dry-run` (removed in wrangler 4.86) + ran drizzle generate from `apps/api` cwd → fixed to run from `packages/db` and print SQL + `migrations list --remote` for review. (c) Server actions can't be re-exported across modules → `admin/submissions/actions.ts` shim deleted; `AdminReviewButtons` imports `adminReviewSubmission` directly. (d) `.expo/` untracked + ignored.
- `[ ]` 13. (manual QA) Publisher login → upload book (goes to review) → admin approves → catalog active + notification; dashboard KPIs real; notifications mark-read persists; settings save; reading progress updates metrics.

# Publisher Logout Fix ("Keluar" does nothing) — 2026-08-26

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-26-publisher-logout-fix-design.md` + plan `docs/superpowers/plans/2026-08-26-publisher-logout-fix.md` + ledger `.superpowers/sdd/publisher-logout-fix/`. User-approved.
- `[x]` 2. Root cause: both publisher logout buttons (topbar avatar menu + sidebar footer) wrapped the `signOut` server action in an inline async `<form action={...}>` closure — unique to these two files; every working sign-out (admin-sidebar, account, Navbar) calls the server action directly via `onClick`. The wrapper swallowed the `NEXT_REDIRECT`, so clicking "Keluar" was a no-op.
- `[x]` 3. Fix: removed `<form>` wrappers; direct `onClick` → `signOut({ redirectTo: "/publisher/daftar" })` in `apps/web/src/app/publisher/topbar-client.tsx` + `sidebar-client.tsx`. Post-logout destination changed `/publisher/login` → `/publisher/daftar` (user decision).
- `[x]` 4. Verification: web typecheck ✅ / lint **0 errors** (26 pre-existing warnings, none on changed lines) ✅ / tests: **no test script** for apps/web (stated). Greps: old patterns → 0 hits. (`node_modules` was missing at session start — ran full `npm install` first.)
- `[x]` 5. **DEPLOYED** `npm run deploy:prod` from `apps/web` → worker version `21b5555c-dc84-4cac-bd4d-fb9cc00719e3` live on bukoo.id + publisher.bukoo.id; smoke ✅ (`/`, `/publisher/login`, `/publisher/daftar`, `/api/auth/session` → 200; unauthed dashboard renders public showcase as designed).
- `[ ]` 6. (manual QA) Login as publisher → dashboard → Keluar from avatar menu AND sidebar footer → lands on `/publisher/daftar`; `/api/auth/session` null; revisiting `/publisher/dashboard` shows logged-out state.

# Mobile: Restore/Upgrade to Expo SDK 56 (was downgraded to 54) — 2026-08-24

- `[x]` 1. Detected the project had been **downgraded to SDK 54** (`expo ~54.0.0`, RN 0.81.5, React 19.1.0) — `git diff` confirmed the committed state is SDK 56; the downgrade left `@react-native/babel-preset`/`metro-config` at 0.85 (inconsistent).
- `[x]` 2. Restored `apps/mobile/package.json` + `package-lock.json` to the committed SDK 56 state; bumped `expo` to `~56.0.20` (latest 56.x patch).
- `[x]` 3. Dependency reinstall saga: npm 10.8.2 hit the known arborist bug (`ERR_INVALID_ARG_TYPE: "from" undefined` in `reify.js rollbackMoveBackRetiredUnchanged`) on incremental installs. Fix: `rm -rf node_modules` + `npx --yes npm@11 install` (Node-20 compatible, no script blocking) → clean tree, expo **56.0.20** installed. npm 12 (EBADENGINE on Node 20) was tried first — don't use it here.
- `[x]` 4. Verified binaries after reinstall: `esbuild 0.28.1`, `sharp 0.34.5`, `wrangler 4.86.0`, `tsc 5.9.3` all functional.
- `[x]` 5. Full monorepo verification: typecheck **7/7** ✅, lint **5/5** (0 errors; pre-existing warnings only) ✅, test **4/4** (API **14/14**; mobile no test script — stated) ✅.
- `[x]` 6. Note: `package-lock.json` got a large (but valid) rewrite — the committed lock was already stale (pre-existing `typescript` drift: package.json `~6.0.3` vs lock-pinned `5.9.3`, shared-version hoist conflict with web).
- `[ ]` 7. (next) `npx expo install --check` will still flag `typescript 5.9.3 → ~6.0.3` — pre-existing hoisting conflict with `apps/web`'s typescript `~5.9`; benign (was the state before too). Optionally pin a single shared typescript version.
- `[ ]` 8. (manual/QA) Test in the SDK 56 Expo Go build (sign.expo.dev) on iPhone: `npx expo start --tunnel` from `apps/mobile`.

# Mobile Expo Go Compatibility (iOS testing without Apple Developer account) — 2026-08-24

- `[x]` 1. Guard `initCrashReporting()` in `apps/mobile/src/services/crashReporting.ts` (try/catch) — Firebase native module is absent in Expo Go and previously crashed app boot.
- `[x]` 2. New `apps/mobile/src/services/socialAuth.ts` — lazy, idempotent, guarded `configureGoogleSignIn()` (module-scope `GoogleSignin.configure` in `LoginScreen.tsx` previously crashed the login screen in Expo Go).
- `[x]` 3. `LoginScreen.tsx` — removed module-scope `GoogleSignin.configure`; calls `configureGoogleSignIn()` inside `handleGoogleSignIn` (guarded).
- `[x]` 4. `useAuth.ts` — calls `configureGoogleSignIn()` before `GoogleSignin.signOut()` in logout cleanup.
- `[x]` 5. Docs: `apps/mobile/EXPO_GO_TESTING.md` (tunnel run steps + works/not matrix + gotchas).
- `[x]` 6. Verification: mobile typecheck ✅ / lint ✅ (0 errors; only pre-existing @typescript-eslint TS-version warning) / test (no test script — stated).
- `[x]` 6b. **Expo Go version gotcha (2026-08-24)**: App Store Expo Go stops at SDK 54; project is SDK 56 → "incompatible / requires a newer Expo Go". Fix: install the SDK 56 Expo Go build via **sign.expo.dev** (free Apple ID, no paid account; ~7-day cert, weekly re-sign). Documented in `EXPO_GO_TESTING.md`.
- `[ ]` 7. (manual/QA) Remote tester: install SDK 56 Expo Go via sign.expo.dev → `npx expo start --tunnel` from `apps/mobile` → scan in Expo Go on iPhone → boots to login (no red screen), email/password + Apple Sign-In work, Google button shows graceful alert, reader opens, logout OK.
- `[ ]` 8. (deferred) Firebase iOS `GoogleService-Info.plist` + EAS/TestFlight once the company Apple Developer account exists.

# Web Auth Overhaul (login/register/Google — bukoo.id + publisher.bukoo.id) — 2026-08-20

- `[x]` 1. SDD artifacts: spec `docs/superpowers/specs/2026-08-20-web-auth-improvements-design.md` + plan `docs/superpowers/plans/2026-08-20-web-auth-improvements.md` + ledger `.superpowers/sdd/web-auth-improvements/` (user-approved "Start implementation").
- `[x]` 2. Phase 1 (fix-first) — logout bug: consolidate all `next-auth/react` client `signOut` → server action (`Navbar`, `account-sign-out`, `admin-sidebar`, `publisher/sidebar-client`); gate `/publisher/dashboard` + `/publisher/submit` in middleware (PUBLISHER only); fix stale `(protected)/layout.tsx` comment. Verify cookie cleared + routes require login.
- `[x]` 3. Phase 2 — shared auth UX/security: shared `(auth)/errors.ts` catalog; `callbackUrl` support (sanitized) + role-aware default redirect; Google button pending state; server-side validation; anti-enumeration errors; passwordless-account copy ("Akun ini terdaftar dengan Google"); keep `allowDangerousEmailAccountLinking` (decision).
- `[x]` 4. Phase 3 — publisher auth: shared `login-form`/`register-form` components; `/publisher/login` + `/publisher/register` (branded); `signUpPublisher` (immediate PUBLISHER); middleware host redirects `/login`→`/publisher/login`.
- `[x]` 5. Phase 4 — verify (web typecheck ✅ / lint 0 errors ✅ / next build ✅ / opennext build ✅ / local worker smoke tests ✅; no test script — stated) + **DEPLOYED** `npm run deploy:prod` → worker `f188e0de` live; prod smoke ✅ bukoo.id (/login /register /api/auth/session 200) + publisher.bukoo.id (/login→/publisher/login 307, /publisher/login 200 branded, unauthed dashboard 307). ledger/task.md/AGENTS.md updated.
- `[x]` 6. (manual/ops) Authorize `https://publisher.bukoo.id/api/auth/callback/google` in Google Cloud Console (publisher-domain Google login prerequisite). — ACTION REQUIRED (ops step, cannot be done in code).
- `[ ]` 7. (deferred) Rate limiting + email-based password reset (user decision).
- `[ ]` 8. (manual QA) Real-device click-through: Google login→logout on both domains (cookie cleared, dashboard gated), publisher self-register→dashboard→create book, reader deep-link return.

# Web Google Login Fix (accounts.id NOT NULL bug) — 2026-08-20

- `[x]` 1. Root cause confirmed live: NextAuth DrizzleAdapter `linkAccount()` inserts into `accounts` WITHOUT `id`; `accounts.id` is a bare `TEXT PRIMARY KEY` → remote D1 throws `NOT NULL constraint failed: accounts.id` (7500). Broke web Google login; orphaned user rows (4 found) then caused register "sudah terdaftar" + login "salah" errors.
- `[x]` 2. Fix: `$defaultFn(() => createId())` on `accounts.id` + `sessions.id` in `packages/db/src/schema.ts` (client-side; NO D1 migration — `drizzle-kit check` clean); added `@paralleldrive/cuid2@^2.2.2` to `packages/db/package.json`.
- `[x]` 3. Verified: db typecheck/build/db:check ✅; web typecheck+lint ✅ (0 errors); api typecheck+lint+test ✅ 14/14; `toSQL` proof both adapter inserts now generate cuid2 id.
- `[x]` 4. Deployed: commit `12460dc` → `npm run deploy:prod` → worker version `71c72e03` live at `bukoo.id`; bundle contains fix; smoke `/login` `/register` `/api/auth/session` `/library` → 200.
- `[ ]` 5. (manual/user) Real Google login click-through on `bukoo.id` → `/library` + new `accounts` row; previously-orphaned user (e.g. `baihaqi.r@gmail.com`) re-login succeeds. Orphan users self-heal on next Google login.
- `[ ]` 6. (follow-up, optional) UX copy for passwordless accounts ("sudah terdaftar"/"salah" messages are technically correct but confusing).

# Share to Social Media (IG Story) — 2026-08-20

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-20-share-to-social*`, `.superpowers/sdd/share-to-social/`). User-approved ("Start implementation").
- `[x]` 2. Deps: `react-native-share@^12.3.1` + `react-native-view-shot@^5.1.1` in `apps/mobile/package.json` (autolink only, **no prebuild**).
- `[x]` 3. Share core: `services/shareService.ts`, `components/share/ShareCard.tsx` (4 variants), `components/share/ShareSheetModal.tsx`.
- `[x]` 4. Book Detail: share icon in floating header → book + progress cards; link `bukoo.id/book/<id>`.
- `[x]` 5. Profile: share icon in "Pencapaian" → stats card; link `bukoo.id`.
- `[x]` 6. Reader: wire `BookCompletionModal.onShareAchievement` → achievement card (lazy cover fetch).
- `[x]` 7. Verification: mobile tsc ✅ / lint 0 errors 0 warnings ✅ / test (no script — stated); `./gradlew assembleDebug` BUILD SUCCESSFUL (autolink confirmed, no prebuild).
- `[ ]` 8. (manual/device QA) All 4 cards → IG Story sticker + link; generic share sheet; IG-not-installed fallback.

# Tablet-Responsive Layouts — 4 Tab Screens — 2026-08-20

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-20-tablet-responsive*`, `.superpowers/sdd/tablet-responsive/`). User-approved.
- `[x]` 2. Shared infra: `constants/LAYOUT.ts` (`TABLET_BREAKPOINT=600`, `MAX_CONTENT_WIDTH=720`), `hooks/useResponsive.ts` (`useIsTablet`/`useResponsive`), `components/ResponsiveContainer.tsx`.
- `[x]` 3. `MainTabs` tab bar capped (720) + centered on tablet via `marginHorizontal:'auto'`; phone unchanged.
- `[x]` 4. `HomeScreen` wrapped in container; A/B grid 2→3 cols on tablet (dynamic key remount, `gridCardTablet` maxWidth 31%).
- `[x]` 5. `LibraryScreen` wrapped in container; stats grid 2×2 → 4-in-row on tablet.
- `[x]` 6. `CommunityScreen` wrapped in container; single-column feed kept.
- `[x]` 7. `ProfileScreen` wrapped in container; profile header + streak side-by-side on tablet; avatar 90→110; inline modals maxWidth →440. (EditProfile/ReadingAnalytics are bottom sheets — no change.)
- `[x]` 8. Verification: mobile tsc ✅ / lint 0 errors ✅ / test (no script — stated). Portrait-only maintained.
- `[ ]` 9. (manual/device QA) Tablet portrait ~800–1024dp: content centered 720, tab bar capped+centered, Home grid 3-col, Library stats 4-in-row, Profile 2-col, modals ≤440; phone ~390 unchanged.

# Mobile Launcher & Splash Icon Swap — 2026-08-20

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-20-mobile-icon-splash-swap*`, `.superpowers/sdd/mobile-icon-splash-swap/`). User-approved.
- `[x]` 2. Expo assets: `icon.png` (1024) + `adaptive-icon.png` (512/1024) ← `assets/bukoo-icon-rounded.png`; new `splash-icon.png` ← `assets/bukoo-logo-transparent.png`.
- `[x]` 3. Native launcher: `ic_launcher.webp` + `ic_launcher_round.webp` (48–192) + `ic_launcher_foreground.webp` (108–432, content 50%) regenerated.
- `[x]` 4. Native splash: `drawable-*/splashscreen_logo.png` (288–1152) regenerated fit-to-height. No prebuild; XML/theme/manifest untouched.
- `[x]` 5. Verification: `file`/`identify` all assets ✅; `./gradlew assembleDebug` BUILD SUCCESSFUL ✅; mobile tsc ✅ / lint ✅ / test (no script — stated).
- `[ ]` 6. (manual/device QA) Cold launch: launcher shows new rounded icon; splash shows new transparent logo.

# Shared Types → Real DTO Contract — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-shared-types-dto-refactor*`, `.superpowers/sdd/shared-types-dto-refactor/`). User-approved.
- `[x]` 2. `@bukoo/shared-types` rewritten as the real contract (`BookDto`, `UserDto`/`AuthUserDto`, reading/goals/community DTOs; `SubscriptionTier` + `'PREMIUM'`; `isBookAccessible` kept). dist rebuilt.
- `[x]` 3. Mobile `services/api.ts` re-exports shared DTOs (local type aliases); `AuthResponseDto` + `expiresIn`.
- `[x]` 4. Mobile `authStore` → shared `UserDto`; new `toUserDto()` adapter at 6 auth setUser sites; dead `subscriptionTier` branches removed.
- `[x]` 5. Mobile: 5 `b as { coverKey }` casts removed; inline Library book-shape type removed.
- `[x]` 6. **Bug fixes**: Library tab permanently-empty (`/books` bare array) + CreatePostModal empty book picker + ProfileScreen goal shape; deleted dead `ReadingGoalsWidget.tsx`.
- `[x]` 7. Web `lib/subscription.ts` → shared `SubscriptionTier` (`type Tier = SubscriptionTier`).
- `[x]` 8. API DTO builders annotated: `formatBook(): BookDto`, `serializeUser(): UserDto`, `toUserPublic(): AuthUserDto`.
- `[x]` 9. Verification: shared-types typecheck+build ✅; API tsc/lint/tests **14/14** ✅; mobile tsc/lint ✅ (no test script — stated); web tsc/lint 0 errors ✅ (no test script — stated). Greps: removed symbols → 0.
- `[ ]` 10. (manual/device QA) Library tab now shows real books; CreatePost book picker lists books; profile goal shows saved value; login still works end-to-end.

# Mobile Type-Safety Cleanup — Remove `as any` / `as never` / Double-Casts — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-mobile-type-safety*`, `.superpowers/sdd/mobile-type-safety/`). User-approved.
- `[x]` 2. Removed **all 18 type-unsafe casts** (13× `as never` nav, `ReadingScreen as any`, `WebView as unknown as ComponentType<any>`, `Ionicons name as never`, `navigate('Subscription' as never)`).
- `[x]` 3. Root cause of nav casts: `NavigationProp = NativeStackNavigationProp<RootStackParamList & MainTabParamList>` intersection broke `navigate` overloads → changed 5 screens to `RootStackParamList` (verified no tab-only routes navigated).
- `[x]` 4. Killed the **dead root `ReadingScreen` route** (never navigated; reader opens via `ReadingStack` → `'Reading'`); retyped `ReadingScreen` to `ReadingStackParamList['Reading']`; dropped `as any`.
- `[x]` 5. `getTypeIcon` return annotated with `ComponentProps<typeof Ionicons>['name']`.
- `[x]` 6. Verification: mobile tsc ✅ / lint ✅ / test (no test script — stated). Grep for `as never|as any|as unknown as|ComponentType<any>` → **0 hits**.
- `[ ]` 7. (manual/device QA) Home → book → reader opens; Library/Search/Community nav unchanged; banner offline shortcut → "Diunduh" tab.

# API Helper Consolidation — Tier, Cover URL, User Serializers — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-api-helper-consolidation*`, `.superpowers/sdd/api-helper-consolidation/`). User-approved.
- `[x]` 2. New `src/lib/tier.ts` (`getUserTier`) — was duplicated in books.ts + reading.ts.
- `[x]` 3. New `src/lib/cover-url.ts` (`buildCoverUrl`) — was duplicated in reading.ts + community.ts.
- `[x]` 4. New `src/lib/user-serializers.ts` (`parseFavoriteGenres`, `toUserPublic`, `serializeUser`; `serializeUser` reuses `toUserPublic`).
- `[x]` 5. All 5 route files import from libs; local defs + now-unused imports removed.
- `[x]` 6. Verification: API tsc ✅ / lint 0 errors / tests **14/14** ✅. Greps: 0 local helper defs in routes; lib exports present. No deploy.

# Web Quick Wins — Dead Code, Legacy Scripts, Misleading Names — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-web-cleanup-quick-wins*`, `.superpowers/sdd/web-cleanup-quick-wins/`). User-approved.
- `[x]` 2. Deleted dead components: `book-card.tsx`, `header-search.tsx` (+ `layout/` dir), `ComingSoonPage.tsx`.
- `[x]` 3. `mock-books.ts` deleted; `MockBook` type relocated to `book-mapper.ts` as **`CatalogBook`**; fake `mockBooks` array (Unsplash) removed.
- `[x]` 4. Renamed `prismaBookToCatalogBook` → **`bookRowToCatalogBook`** (mapper + 2 callers).
- `[x]` 5. Deleted legacy `scripts/` (3 files) + 12 `backup-*.dump` files.
- `[x]` 6. Book detail page: dropped unused `users as usersTable`; merged two `lucide-react` imports.
- `[x]` 7. `@base-ui/react` **kept** (roadmap correction — actively used by 9 UI files).
- `[x]` 8. Verification: web tsc ✅ / lint 0 errors (18 pre-existing warnings) / **no test script — stated explicitly**. Greps: removed symbols → 0 hits; `CatalogBook|bookRowToCatalogBook` → 4 expected files only.

# API Quick Wins — Stale Leftovers, No-ops, Streak Simplification — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-api-cleanup-quick-wins*`, `.superpowers/sdd/api-cleanup-quick-wins/`). User-approved.
- `[x]` 2. Deleted stale NestJS leftover `apps/api/api/index.ts` + `api/` dir (uncompilable, excluded from tsconfig).
- `[x]` 3. `apps/api/.env.example` rewritten as truthful worker-secrets doc (`.dev.vars` local / `wrangler secret put` prod); no `PORT`/`DATABASE_URL`/`NODE_ENV`. Real `.env` untouched.
- `[x]` 4. Root `.gitignore` — added `.dev.vars` (was NOT ignored; prevents secret commits).
- `[x]` 5. `books.ts` — removed no-op `orderBy.replace(' ', ' ')`.
- `[x]` 6. `goals.ts` `/streak/current` — convoluted loop → pure `computeCurrentStreak()` (`src/lib/streak.ts`), behavior-preserving.
- `[x]` 7. New `src/lib/streak.test.ts` (6 tests).
- `[x]` 8. Verification: API tsc ✅ / lint 0 errors (4 pre-existing no-console warnings) / tests **14/14** ✅. Greps: NestJS leftovers → 0, stale env keys → 0, `orderBy.replace` → 0, `api/` gone, `.dev.vars` ignored. No deploy.

# Mobile Quick Wins — Dead Code, Fake Data, Stale Artifacts — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-mobile-cleanup-quick-wins*`, `.superpowers/sdd/mobile-cleanup-quick-wins/`). User-approved (favorite-genre fallback = **Option A** honest empty).
- `[x]` 2. Deleted dead `StoreScreen.tsx` (388 LOC, unregistered) + `store/` dir.
- `[x]` 3. `ProfileScreen` fake stats → real local data (`readingSync` + `readingGoalService`): quick stats (finished / jam baca), **Follower stat removed** (no data source), streak section = real `getWeekLogs()` + `streakDays` ("Minggu Ini", non-functional chevrons removed), Pencapaian grid real values.
- `[x]` 4. `HomeScreen` name fallback `'Baihaqi'` → `'Pembaca BUKOO'`.
- `[x]` 5. `ReadingScreen` — removed `[Perf]` (×3) + `[WebView Diagnostic]` (×2) logs + now-unused timing refs; `console.error`/`warn` error handlers kept.
- `[x]` 6. `.env.example` — real vars only (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_GOOGLE_CLIENT_ID`); Supabase + misnamed Google var removed.
- `[x]` 7. Favorite-genre fallback → Option A: `userProfileService.getFavoriteGenres()` → `[]`; `EditProfileModal` seeds `[]`.
- `[x]` 8. Verification: mobile tsc ✅ / lint ✅ (no test script — stated). Greps: `StoreScreen|Baihaqi|[Perf]|[WebView Diagnostic]` → 0 hits; `SUPABASE` in `.env.example` → 0; `store/` dir gone.
- `[ ]` 9. (manual/device QA) Profile tab shows real stats (0 on fresh install); Home greeting shows "Pembaca BUKOO" when unnamed; reader loads normally; Edit Profile genre picker starts empty.

# Hide Reader Audio Icon & Fix Home Category Filter — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-hide-reader-audio-fix-home-category-filter*`, `.superpowers/sdd/hide-reader-audio-fix-home-category-filter/`).
- `[x]` 2. **Hide 'Audio book' headset icon** — removed the `headset-outline` button ("Audio Companion Narasi") from the `ReadingScreen` header action row + the now-unused `audioPlayerService` import. Audio companion still reachable via Home `MiniAudioPlayer` (owns `AudioPlayerModal`).
- `[x]` 3. **Home category filter root cause** — backend `GET /v1/books?genre=…` verified correct (prod: `Fiksi`→3, `Agama`→0, none→3). Bug was client-side in `HomeScreen`: when a category returned **0 books** it fell back to `trendingBooks`, so e.g. "Agama" showed the same unfiltered trending list. Fixed: selected category always shows `categoryBooks` (empty → "Belum ada buku dalam kategori X" empty state); trending only under "Semua".
- `[x]` 4. Verification: mobile typecheck ✅ / lint ✅ (no test script — stated). QA user `qa-genre-20260819@example.com` used to probe prod endpoint, then deleted (0 rows) + temp files removed. No backend change / no deploy.
- `[ ]` 5. (manual/device QA) Metro reload → headset icon gone from reader top bar; "Fiksi" filters to Fiksi books; "Agama"/empty categories show the empty state instead of trending.

# Fix AI Companion 502 (Deprecated Model) — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-fix-ai-companion-502*`, `.superpowers/sdd/fix-ai-companion-502/`). User-approved.
- `[x]` 2. **Root cause** (reproduced via `wrangler dev` + remote AI binding): `@cf/meta/llama-3-8b-instruct` was **deprecated by Cloudflare on 2026-05-30** → `AI.run` throws `5028` → `/v1/ai/chat` returns 502 → mobile `aiCompanionService` shows the offline fallback. Same dead model id in all 3 AI routes (`/chat`, `/companion/summary`, `/summarize`).
- `[x]` 3. Fix (`apps/api/src/routes/ai.ts`): swapped to `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (canonical fast Llama-3.3 chat, confirmed not-deprecated in the live catalog) in all 3 `AI.run` calls + deprecation comment. No mobile change needed.
- `[x]` 4. Verification: API typecheck ✅ / lint 0 errors / tests 8/8 ✅. **Live**: `/v1/ai/chat` → 200 (Indonesian reply), `/v1/ai/summarize` → 200 (structured summary). Temp `.dev.vars`/token cleaned up.
- `[ ]` 5. (deploy) Redeploy `bukoo-api` (`npm run deploy` from `apps/api`) → smoke `/v1/ai/chat` 200 on prod.

# Fix Community Comment Posting Crash — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-fix-community-comment-posting*`, `.superpowers/sdd/fix-community-comment-posting/`). User-approved.
- `[x]` 2. **Root cause**: `POST /v1/community/posts/:id/comments` returned the raw Drizzle row (`{ id, postId, userId, content, createdAt }` — no `user` object). `PostCommentsModal` prepends it to the list and renders `c.user.name` → `Cannot read property 'name' of undefined`. `GET .../comments` already returned the correct DTO, so only the freshly posted comment crashed.
- `[x]` 3. **Sibling bug (same class)**: `POST /posts` returned a raw post row (no `user`/`book`/`likedByMe`/`bookmarkedByMe`) → would crash `CommunityScreen` on post creation. Fixed both.
- `[x]` 4. API fix (`apps/api/src/routes/community.ts`): both POST create endpoints now select joined author (+ book for posts) and return the same DTO shape as their GET counterparts.
- `[x]` 5. Mobile defensive rendering: `PostCommentsModal.tsx` + `CommunityScreen.tsx` guard `user?.name ?? 'Pembaca BUKOO'`, `avatarUrl`, `id` so a stale deployed API can't crash the app.
- `[x]` 6. Verification: API typecheck ✅ / lint 0 errors / tests 8/8 ✅; mobile typecheck ✅ / lint ✅ (no test script — stated). **Local smoke test**: `POST /posts/:id/comments` → 201 with `user` object; `POST /posts` → 201 with `user` + `book`; temp `.dev.vars`/token/seed cleaned up.
- `[ ]` 7. (deploy) Redeploy `bukoo-api` so production returns the fixed DTO (mobile is already protected by defensive rendering).

# Fix White Splash Screen — 2026-08-19

- [x] 1. Root cause: `splashscreen_background` = `#FFFFFF` AND the `splashscreen_logo.png` images had a white background baked in (100% opaque, corners pure white) → white splash that clashed with the green branding.
- [x] 2. `values/colors.xml`: `splashscreen_background` → `#0B1914` (BUKOO deep forest, matches `iconBackground` + `COLORS.forestDark`).
- [x] 3. Regenerated all 5 `splashscreen_logo.png` (288/432/576/864/1152) — white stripped via soft alpha threshold → transparent bg, gray wordmark kept.
- [x] 4. New `drawable/splash_background.xml` (layer-list: green color + centered transparent logo); `Theme.App.SplashScreen` windowBackground now points at it (was the raw PNG, which would have shown white behind the now-transparent logo).
- [x] 5. Verified: XMLs valid; splash preview = gray logo centered on `#0B1914`; JS root view already `#0B1914` → seamless green→green.
- [ ] 6. (manual) Rebuild/reinstall (`npm run android`) → splash is dark green with the BUKOO wordmark, no white.

# Fix Android Launcher Icon Too Big — 2026-08-19

- [x] 1. Root cause: `assets/adaptive-icon.png` was a full-bleed 1024×1024 artwork (green square badge + gold logo, 93.8% opaque) used as the adaptive-foreground → launcher mask clipped it with zero safe-zone margin → icon looked zoomed in / too big.
- [x] 2. Regenerated `adaptive-icon.png` (artwork scaled to 50%, centered, transparent surround → inside the Android ~66% safe zone) and the 5 per-density `ic_launcher_foreground.webp` (108/162/216/324/432 px, lossless RGBA). Legacy `icon.png`/`ic_launcher.webp` untouched (full-bleed is correct for legacy squares).
- [x] 3. Verified: content bbox now 50% centered; masked previews (circle/squircle/rounded-square) show the badge fully visible with dark `#0B1914` background; git diff = only the 6 icon files.
- [ ] 4. (manual) Rebuild/reinstall (`npm run android`); if the launcher still shows the old icon, remove/re-add the shortcut (launcher icon cache).

# Reader UX & Search Filter Fixes — 2026-08-19

- [x] 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-reader-ux-search-fixes*`, `.superpowers/sdd/reader-ux-search-fixes/`).
- [x] 2. **OLED Black crash** — SettingsModal theme ids are lowercase (`'oled'`) but ReadingScreen capitalizes → `themeColors['Oled']` undefined → `Cannot read property 'bg' of undefined`. Removed OLED Black from the picker; `setTheme` wrapper + persisted-settings loader now sanitize to known themes (fallback `Cream`).
- [x] 3. **Removed "Kecerahan Layar"** (brightness) — section, props, and unused state removed.
- [x] 4. **Genre/Category filter** — backend `/books/search` ignores `genre` (client now filters via `item.genre?.includes`); genre-only browse (empty search box + chip) was 400ing on missing `q` → now routed to `GET /books?genre=…`.
- [x] 5. **Header overlap** — reading-time text overlapped the Audio icon; added `flexShrink: 1` to `headerMeta`/`headerSubtitle`.
- [x] 6. Verification: mobile typecheck ✅ / lint ✅ (no test script — stated). No backend change / no deploy.
- [ ] 7. (manual/device QA) Reload app → OLED Black gone, no brightness section, genre chips + Filter modal filter correctly, header no longer overlaps.
- [ ] 8. (question, answered) **"How to add books to My Library?"** — books auto-populate from `GET /books`; there is NO manual "add to library" button. Tabs derive from activity: start reading → "Sedang Dibaca", 100% → "Selesai", downloaded → "Diunduh", not started → "Ingin Dibaca". If a manual "Ingin Dibaca"/"Add to Library" shelf is wanted, that's a new feature task (not implemented).

# Fix DSC Search 500 & Reader Load Error — 2026-08-19

- [x] 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-fix-dsc-search-reader*`, `.superpowers/sdd/fix-dsc-search-reader/`).
- [x] 2. Root cause A (search `Dead` → 500): `/search` used raw `SELECT b.*` (snake_case) but `formatBook`/`isBookAccessible` read camelCase → `subscriptionRequired` undefined → `.toUpperCase()` threw. Fixed with shared `bookColumns` aliased projection (also applied to the `GET /v1/books` genre branch — same 500 confirmed live via `?genre=Fiksi`).
- [x] 3. Root cause B (search `Dead Smoker` → []): FTS5 phrase + `unicode61` no stemming (`smoker` ≠ `smokers`). Fixed with `buildFtsQuery` (quoted prefix tokens `"<token>"*` joined by AND) — injection-safe.
- [x] 4. Reader "Gagal memuat buku": server proven healthy (download 200 + valid EPUB w/ QA token); mobile swallowed real error. `downloadBookForReading` now propagates; `ReadingScreen` surfaces real message.
- [x] 5. Mobile `SearchScreen` — `isError` state ("Terjadi kesalahan" + Coba Lagi) instead of misleading empty state.
- [x] 6. Verification: API typecheck ✅ / lint 0 errors / tests 8/8 ✅; mobile typecheck ✅ / lint ✅ (no test script — stated). **Deployed** `bukoo-api` (versions 739bf34d → c0cfc336). Live: `q=Dead`→3, `q=Dead Smoker`→3, `q=Dead Smokers`→3, `q=xyzzy`→0, injection probe safe; `?genre=Fiksi`→3 (was 500); `/health` 200; download dsc-1 200 + PK magic.
- [x] 7. Cleanup: both QA users deleted from prod D1; temp files removed.
- [x] 8. **Reader root cause #2 (device logs)**: download succeeds (`Found local cached book path: file:///.../dsc-1.epub`) but WebView bridge `fetch(file://)` is CORS-blocked from `about:blank` → `Network or CORS error loading EPUB URL`. Fixed: `injectBookData` reads local files as base64 in 3-byte-aligned chunks and assembles via `__bukooPushChunk`/`__bukooLoadBookFromChunks` → `ePub(arrayBuffer)`; remote URLs keep direct passthrough. Mobile typecheck ✅ / lint ✅.
- [ ] 9. (manual/device QA) Reload the app (Metro) → search "Dead" shows 3 results; "Mulai membaca" opens the reader (local EPUB now loads via base64).

# Insert Dead Smokers Club Books (PDF → EPUB) — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-dsc-books-insertion*`, `.superpowers/sdd/dsc-books-insertion/`). User-approved.
- `[x]` 2. Converted 3 manuscript PDFs → EPUB (PyMuPDF + ebooklib; no calibre): DSC 1 → 19 chapters, DSC 2 → 22 chapters, DSC 3 → chunks (no headings). Metadata (Adham T. Fusama / fjm Penerbit / ISBN / id) embedded; front covers cropped from spreads.
- `[x]` 3. Validated: valid EPUB zips, nav/TOC/cover present, 247k/252k/340k chars, 180/245/216 KB.
- `[x]` 4. Uploaded to **production R2**: `epubs/dsc-{1,2,3}.epub` + `covers/dsc-{1,2,3}-cover.jpg`.
- `[x]` 5. Inserted **production D1**: `dsc-1`/`dsc-2`/`dsc-3` (FREE, published, ID, Fiksi/Novel, ISBNs, total_pages 192/196/294).
- `[x]` 6. Verified: D1 rows + FTS (3) ✅; covers 200 image/jpeg ✅; EPUBs 200 application/epub+zip + PK magic ✅; download route 401 unauthenticated ✅.
- `[ ]` 7. (manual/device QA) Open `Dead Smokers Club` in the app → detail + Mulai Membaca renders; offline download appears in "Diunduh".

# Real EPUB Reading (Mobile) — Authenticated Book Access — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-real-epub-reading*`, `.superpowers/sdd/real-epub-reading/`). User-approved.
- `[x]` 2. `api.ts` — exported `API_URL`; added `getAccessToken()` + `ensureFreshAccessToken()` (`/users/me` ping triggers the 401→refresh interceptor, then re-reads SecureStore).
- `[x]` 3. `bookDownload.ts` — `downloadBook` now sends `Authorization: Bearer <fresh token>` via `createDownloadResumable` headers; added `getDownloadUrl(bookId)` + `downloadBookForReading(bookId)` (cache-first).
- `[x]` 4. `ReadingScreen.tsx` — real books (auth-protected) download natively then open locally via `downloadBookForReading`; public URLs still stream in WebView (`isPublicBookUrl`); honest loadError kept.
- `[x]` 5. `BookDetailScreen.tsx` — `epubUrl` derived from `epubKey` via `getDownloadUrl(book.id)`; reader + offline download share the auth'd source.
- `[x]` 6. Verification: mobile tsc ✅, lint ✅, test "no tests specified" (stated). **Local API route proof**: seeded test book in local D1 + R2, `wrangler dev` → no token 401, with token 200 `application/epub+zip` + `PK\x03\x04`, missing book 404. Test data cleaned up.
- `[x]` 7. Docs: plan checkboxes ✅, ledger updated, this entry.
- `[ ]` 8. (manual/QA) Device E2E: seed a real book + R2 EPUB, open detail → Mulai Membaca renders; offline download shows in "Diunduh".

# Remove All Dummy Ebooks (Mobile) — 2026-08-19

- `[x]` 1. Spec + plan + SDD ledger (`docs/superpowers/specs|plans/2026-08-19-remove-dummy-ebooks*`, `.superpowers/sdd/remove-dummy-ebooks/`). User-approved.
- `[x]` 2. `BookDetailScreen.tsx` — removed `MASTER_SAMPLE_BOOKS`, `DEFAULT_REVIEWS`, `sampleFallback`, hardcoded GitHub EPUB URL; Baca Sampel gated on real `sampleUrl`; download disabled without `epubUrl`.
- `[x]` 3. `StoreScreen.tsx` — removed `SAMPLE_STORE_BOOKS`; featured API only + empty state.
- `[x]` 4. `HomeScreen.tsx` — removed `defaultTrending`; hero banner de-hardcoded ('Atomic Habit'); empty state.
- `[x]` 5. `LibraryScreen.tsx` — removed `DEFAULT_BOOKS_LIST` + 'Laut Bercerita' active-book fallbacks.
- `[x]` 6. `SearchScreen.tsx` — removed `exploreBooks`/`originalBooks` + BUKOO ORIGINAL section.
- `[x]` 7. `AiCompanionScreen.tsx` — removed `BASE_RECOMMENDATIONS`; `aiCompanionService` `BOOK_KNOWLEDGE_BASE` (dummy AI insights) removed.
- `[x]` 8. `RelatedBooksCarousel.tsx` — real `/v1/books/recommendations` via `useRecommendedBooks`.
- `[x]` 9. `ReadingScreen.tsx` — removed sample/demo fallbacks (`OFFLINE_BOOK_ASSETS`, `sample-book.epub`, "Mode Demo" banner); audio companion fake metadata cleaned.
- `[x]` 10. Deleted bundled assets: `assets/filsafat-ajaran-islam.epub`, `perlunya-seorang-imam.epub`, `riwayat-rasulullah.epub`, `sample-book.epub`.
- `[x]` 11. `QuickResumeCard.tsx` — removed `DEFAULT_ACTIVE_BOOK` fallback.
- `[x]` 12. New `services/coverUrl.ts` — maps R2 `coverKey` → `https://bukoo.id/covers/<key>` (real covers after dummy URLs removed).
- `[x]` 13. Verification: mobile typecheck ✅, lint ✅, test "no tests specified" (stated). Greps for all dummy symbols + hardcoded cover URLs → 0 hits.
- `[x]` 14. Real EPUB reading in mobile: DONE 2026-08-19 — auth'd native download (`createDownloadResumable` + Bearer token) → open local file. See "Real EPUB Reading" entry above. Device E2E is item 8 there.

# CI/CD for Web & API (Cloudflare Workers) — 2026-08-19

- `[x]` 1. Design decisions: split workflows; auto-deploy on main; preview on PRs; drop mobile EAS; manual migrations.
- `[x]` 2. `ci.yml` — lint / typecheck / test / drizzle drift check on PR + main push (no service containers).
- `[x]` 3. `deploy-web.yml` — preview worker on PRs (+ PR comment) & prod deploy on main (+ smoke test).
- `[x]` 4. `deploy-api.yml` — prod deploy on main + `/health` smoke test.
- `[x]` 5. `migrate-d1.yml` — manual D1 migration workflow (generate → dry-run review → apply on confirm).
- `[x]` 6. Removed stale `.github/workflows/deploy.yml` (Railway + Prisma + Postgres/Redis; no web deploy).
- `[x]` 7. AGENTS.md — CI/CD section + required GitHub secrets documented.
- [ ] 8. (user) GitHub repo secrets: `CLOUDFLARE_API_TOKEN` (Workers Scripts/Routes Edit, D1 Edit, R2 Edit, Account Settings Read) + `CLOUDFLARE_ACCOUNT_ID`.
- [ ] 9. (user) Enable branch protection required checks on main: `lint`, `typecheck`, `test`, `db-check`.
- [ ] 10. (verify) Push a PR → ci.yml green + preview deploy; merge to main → prod web + api deploy + smoke tests; run migrate-d1.yml (dry-run) once.

# Mobile Reader UX, Bug Fixes & Recommendation Enhancements — 2026-08-18

- `[x]` 1. Bug Fix: Annotation sync soft-delete propagation in `highlightService.ts`, `bookmarkService.ts`, and `annotationSyncService.ts`.
- `[x]` 2. Bug Fix: ReadingScreen `isReady` race condition guard on hot-reload/back-nav.
- `[x]` 3. Bug Fix: TocModal active chapter highlight normalization on first open.
- `[x]` 4. Bug Fix: QuickJumpSlider optimistic page jump on thumb release.
- `[x]` 5. UX Flow: Real-time personalized Reading Time Left (WPM) calculation in reader bottom HUD.
- `[x]` 6. UX Flow: Deep-link handling for daily reading notification taps (`App.tsx`).
- `[x]` 7. UX Flow: "Lanjut Baca" CTA with progress bar in `BookDetailScreen.tsx`.
- `[x]` 8. UX Flow: In-reader brightness slider control in `SettingsModal.tsx` & `ReadingScreen.tsx`.
- `[x]` 9. UX Flow: Native bottom sheet highlight color picker replacing in-WebView HTML toolbar.
- `[x]` 10. UX Flow: Per-book reader settings override with global fallback.
- `[x]` 11. UX Flow: Export highlights (copy to clipboard / share text) in `HighlightModal.tsx`.
- `[x]` 12. UX Flow: Book completion celebration modal when finishing a book (100% progress).
- `[x]` 13. UX Flow: Search results cover thumbnails in `SearchScreen.tsx`.
- `[x]` 14. Recommendation: Backend `GET /v1/books/recommendations` route in `apps/api` with D1 SQL genre/history query + AI hybrid scoring (Option C).
- `[x]` 15. Recommendation: `useRecommendedBooks` hook and real API integration in `AiCompanionScreen.tsx`.
- `[x]` 16. Recommendation: HomeScreen personalized section title and recommendation feed integration.
- `[x]` 17. AI Summarizer: Backend `POST /v1/ai/summarize` route + WebView chapter text extraction & `AiSummaryModal.tsx` streaming integration.
- `[x]` 18. Optimization: Base64 double-memory optimization for EPUB loading in `ReadingScreen.tsx`.
- `[x]` 19. Verification: Typecheck, lint, and API vitest suite passing across touched workspaces.

# Mobile Feature Hardening — Real Data, Real Backend, Real Notifications — 2026-08-18

- `[x]` 1. Migration `0004_pale_yellowjacket.sql` — `users.favorite_genres` + community tables (posts, comments, likes, bookmarks, events, event_joins). Applied local + remote.
- `[x]` 2. API `users.ts` — `favoriteGenres` in `PATCH/GET /me`, `avatarUrl` alias fix, shared serializer.
- `[x]` 3. Mobile `userProfileService` — syncs favoriteGenres to server; `hydrateFavoriteGenres()`.
- `[x]` 4. QuickResume real data — `GET /reading/progress` returns flat DTO (author/cover/pages); `QuickResumeCard` fed from `useUserLibrary`; navigates via BookDetail.
- `[x]` 5. Removed fake seed data — `streakDays` defaults to 0, `getWeekLogs()` no fabrication; `ReadingGoalCard` tappable on Home.
- `[x]` 6. Home trending fetch deduped (single `/books/featured`).
- `[x]` 7. Offline fixes — banner count uses `getUnsyncedCount()`, "Rak Diunduh" selects the Downloads tab via `Library` param, author from real data (typo fixed), stats grid from real local data, `getStorageUsed` wired.
- `[x]` 8. Network store refactor — single app-wide NetInfo listener (`stores/networkStore.ts`); `useNetworkStatus` + `useReadingSession` are consumers.
- `[x]` 9. Backend `POST /v1/ai/chat` (Workers AI llama-3-8b, stateless, zod) + vitest (4 tests).
- `[x]` 10. AI tab registered in `MainTabs` (fixes the Library `navigate('Ai')` crash); `as never` casts removed.
- `[x]` 11. `aiCompanionService` → real `/ai/chat` with honest offline fallback; conflated character answer removed.
- `[x]` 12. `AiCompanionScreen` real active book + empty state; generic quote; no fake 600ms delay.
- `[x]` 13. Backend `routes/community.ts` — posts/comments/likes/bookmarks/events + joins (cursor pagination, optimistic-friendly), mounted at `/v1/community`, vitest (4 tests).
- `[x]` 14. Mobile `communityApi` + `communityService` rewrite (server-first, AsyncStorage offline cache, optimistic rollback).
- `[x]` 15. `CommunityScreen` real feed — pull-to-refresh, load-more, post-type filter, share button, relative timestamps, real event cards, delete own post, empty state; `CreatePostModal` real book picker; `PostCommentsModal` server comments.
- `[x]` 16. Notifications — `expo-notifications` installed + plugin; real daily reminder scheduler with permission flow; foreground handler; tap-to-book deep link; goal-achieved events feed the in-app list.
- `[x]` 17. `NotificationModal` — schedule feedback, `targetBookId` navigation, ISO timestamps.
- `[x]` 18. Backend `POST/DELETE /v1/notifications/device-token` (device_tokens upsert) + mobile `registerDeviceToken()`.
- `[x]` 19. AGENTS.md drift fixed (`apps/api` = Cloudflare Worker/Hono/D1, not Railway); verification: `@bukoo/db` typecheck ✅, `apps/api` typecheck/lint ✅ + tests 8/8 ✅, `apps/mobile` typecheck/lint ✅ (no test script — stated explicitly). API deployed to `api.bukoo.id` (smoke-tested `/health`, community, ai/chat, device-token).

# Web publisher.bukoo.id & Publisher Portal Implementation — 2026-08-18

- `[x]` 1. Cloudflare Workers domain route pattern for `publisher.bukoo.id` (`wrangler.prod.jsonc`).
- `[x]` 2. Edge middleware domain routing & role redirection (`middleware.ts`).
- `[x]` 3. Shared Publisher main navigation menu component (`PublisherNav.tsx`).
- `[x]` 4. Next.js routes for all 5 planned publisher designs:
  - `[x]` **Daftar Penerbit** (`/publisher/daftar/page.tsx`)
  - `[x]` **Dashboard** (`/publisher/dashboard/page.tsx`)
  - `[x]` **Submit Judul** (`/publisher/submit/page.tsx`)
  - `[x]` **Kebijakan Royalti** (`/publisher/royalti/page.tsx`)
  - `[x]` **Panduan Penerbit** (`/publisher/panduan/page.tsx`)
- `[x]` 5. Verification: `typecheck` ✅ (0 errors), `eslint` ✅ (0 errors), `test` (no test script in apps/web package.json).

# Mobile Audio Companion & Audiobook Player Enhancements — 2026-08-18

- `[x]` 1. Reactive audio player state service (`audioPlayerService.ts`).
- `[x]` 2. Persistent floating mini audio player bar (`MiniAudioPlayer.tsx`).
- `[x]` 3. Fullscreen audio player modal sheet (`AudioPlayerModal.tsx`) with 15s skip, playback speed toggle, and sleep timer.
- `[x]` 4. Integration in `ReadingScreen.tsx` (narration headset button) and `HomeScreen.tsx` (mini player float).
- `[x]` 5. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Notification & Reading Reminder Center Enhancements — 2026-08-18

- `[x]` 1. Notification feed & daily reminder service (`notificationService.ts`).
- `[x]` 2. Notification center drawer modal (`NotificationModal.tsx`) with notification tabs and time preset selectors.
- `[x]` 3. HomeScreen integration with red unread count badge overlay on bell icon.
- `[x]` 4. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Offline Mode & Network Sync Banner Enhancements — 2026-08-18

- `[x]` 1. Network connectivity & sync queue hook (`useNetworkStatus.ts`).
- `[x]` 2. Animated status banner component (`OfflineSyncBanner.tsx`) with amber offline banner & green reconnection toast.
- `[x]` 3. 1-tap shortcut to view downloaded EPUBs in Library tab when offline.
- `[x]` 4. Screen integration in `HomeScreen.tsx` & `LibraryScreen.tsx`.
- `[x]` 5. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Community & Reading Club Enhancements — 2026-08-18

- `[x]` 1. Community feed & persistence service (`communityService.ts`).
- `[x]` 2. Post creation modal (`CreatePostModal.tsx`) with post types and BUKOO library book tagging.
- `[x]` 3. Comments thread modal (`PostCommentsModal.tsx`).
- `[x]` 4. Full integration in `CommunityScreen.tsx` with interactive likes, bookmarks, and Reading Club ("Baca Bareng") join toggle.
- `[x]` 5. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile AI Companion & Reading Assistant Enhancements — 2026-08-18

- `[x]` 1. AI knowledge base & conversation service (`aiCompanionService.ts`).
- `[x]` 2. Interactive AI Q&A Chat section (`AiChatSection.tsx`) with quick prompt chips.
- `[x]` 3. Chapter summarizer modal (`AiSummaryModal.tsx`) with key takeaways and character map.
- `[x]` 4. Full tab experience integration in `AiCompanionScreen.tsx` with habit insights and genre-boosted match scores.
- `[x]` 5. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Home Screen Personalization & Quick Resume Widget — 2026-08-18

- `[x]` 1. Quick Resume card component (`QuickResumeCard.tsx`) positioned at top of Home feed.
- `[x]` 2. Daily reading target card (`ReadingGoalCard.tsx`) integration in `HomeScreen.tsx`.
- `[x]` 3. Personalized category boosting (`★ Agama`, `★ Fiksi`) & `★ Favorit` badges on book cover thumbnails matching user preferences.
- `[x]` 4. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Edit Profile & User Preferences Enhancements — 2026-08-18

- `[x]` 1. Avatar presets & profile update service (`userProfileService.ts`).
- `[x]` 2. Interactive Edit Profile modal (`EditProfileModal.tsx`) with avatar presets carousel, custom image URL input, name validation, and favorite reading genres multi-select.
- `[x]` 3. Dynamic profile header avatar & "Edit Profil" button in `ProfileScreen.tsx`.
- `[x]` 4. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Reading Progress & Goal System Enhancements — 2026-08-18

- `[x]` 1. Reading goal & streak persistence service (`readingGoalService.ts`).
- `[x]` 2. Daily reading target card & 7-day streak indicator (`ReadingGoalCard.tsx`).
- `[x]` 3. Reading analytics & target selector modal (`ReadingAnalyticsModal.tsx`).
- `[x]` 4. Integration into `LibraryScreen.tsx` & `ProfileScreen.tsx`.
- `[x]` 5. Active session reading time ticker & non-intrusive goal celebration banner in `ReadingScreen.tsx`.
- `[x]` 6. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Book Detail Screen Improvements — 2026-08-18

- `[x]` 1. Wishlist persistence service (`wishlistService.ts`) & heart toggle button in header.
- `[x]` 2. "Baca Sampel" (Read Sample) secondary CTA button launching reader in sample mode (`isSample: true`).
- `[x]` 3. Rating distribution breakdown bar chart & user reviews section (`BookReviewsSection.tsx`).
- `[x]` 4. "+ Tulis Ulasan" bottom sheet review submission modal (`WriteReviewModal.tsx`) with account guard.
- `[x]` 5. AI Book Insight card (`AiBookInsightCard.tsx`) with key takeaways and reading duration estimate.
- `[x]` 6. Related recommendations horizontal carousel (`RelatedBooksCarousel.tsx`).
- `[x]` 7. Animated floating header bar fading in title on scroll in `BookDetailScreen.tsx`.
- `[x]` 8. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Mobile Search, Sort, Filter & Reading UX Enhancements — 2026-08-18

- `[x]` 1. Debounced search execution hook (`useDebounce.ts`) & persistent search history service (`searchHistoryService.ts`).
- `[x]` 2. Filter & Sort Bottom Sheet modal (`FilterModal.tsx`) & active filter chips (`FilterChips.tsx`).
- `[x]` 3. Enhanced `SearchScreen.tsx` with instant clear input, recent search history chips, active filter pills, and rich empty state.
- `[x]` 4. Enhanced `LibraryScreen.tsx` with filter tabs ("Semua", "Sedang Dibaca", "Selesai", "Ingin Dibaca", "Diunduh ⬇️"), sorting selector, and offline EPUB download sync.
- `[x]` 5. Reader settings & theme enhancements (`SettingsModal.tsx`) with OLED Black theme, font size stepper, line height slider, margin presets, and page turn modes.
- `[x]` 6. Chapter ETA calculation & HUD status readout (`~X mnt tersisa di bab ini`) in `ReadingScreen.tsx`.
- `[x]` 7. Verification: `typecheck` ✅ (0 errors), `lint` ✅ (0 errors, 0 warnings), `test` (no tests specified for mobile workspace yet).

# Store Launch — Option A (Free Reader App + Pay on Web) — 2026-08-16

Plan: `docs/superpowers/plans/2026-08-16-store-launch-option-a.md` · Spec: `docs/superpowers/specs/2026-08-16-store-launch-option-a-design.md` · Ledger: `.superpowers/sdd/store-launch-option-a/progress.md`

- `[x]` 1. SDD docs (spec + plan + ledger)
- `[x]` 2. Fix `download.epub` security gap (auth + entitlement in route)
- `[x]` 3. Shared tier helper (`apps/web/src/lib/subscription.ts`) + `/me` subscription payload (API + mobile UserPublicDto)
- `[x]` 4. Seed `subscription_plans` (4 plans) + `price_yearly` schema + migration `0002_wet_menace.sql` — ✅ APPLIED to remote D1 2026-08-17
- `[x]` 5. `api.bukoo.id` branding (wrangler route + eas.json/.env/api.ts/BookDetailScreen) — ✅ deployed, both URLs live
- `[x]` 6. Google client ID reconcile (canonical `576187863248-9voo…`) — ✅ **VERIFIED 2026-08-18**: Google Sign-In + register work in the distributed APK (debug keystore SHA-1 `5e8f16062…` matches OAuth client). ⚠️ EAS release keystore + Play App Signing SHA-1 registration still pending (only when store builds start — non-blocking for testing)
- `[x]` 7. `expo-apple-authentication` plugin in app.json — ⚠️ native rebuild required
- `[x]` 8. Privacy/terms — already exist at `/privasi` + `/syarat-ketentuan` (verified)
- `[x]` 9. Store-compliant informational subscription UI (SubscriptionScreen/Profile/AiCompanion/BookDetail gating)
- `[x]` 10. Verify: typecheck/lint/test + store-compliance scan ✅
- `[x]` 11. `d1_migrations` tracker cleanup ✅ (0001_cultured_shiva + 0002 inserted; `migrations apply` = no-op)
- `[x]` 12. Fresh-DB FTS corrective migration `0003_fix_fts5_triggers.sql` ✅ (insert-only design; incident + lesson recorded — see ledger)
- `[x]` 13. **Phase 2 Firebase (code side)**: installed `@react-native-firebase/app|crashlytics|remote-config` v26 modular API, config plugins in app.json (app/crashlytics — remote-config needs NO plugin), `featureFlags.ts` service + `useFeatureFlags` hook, `home_layout` (carousel|grid) wired into HomeScreen, `pricing_display` (monthly_first|yearly_first) into SubscriptionScreen, `crashReporting.ts`, App.tsx boot hooks, `apk:release`/`distribute:firebase` scripts, `FIREBASE_MVP_TESTING.md` doc. Verified: typecheck ✅ lint ✅ tests none (stated).
- `[x]` 14. **Phase 2 LIVE**: ✅ 2026-08-18 — distributed `app-release.apk` (debug-signed, Firebase SDKs incl.) to `mvp-testers` on `bukoo-15ce3` (release 1.0.0 (1)). Auth saga: `npx firebase` wrong package → use `npx firebase-tools`; stale token (expired 2025-08-30) → fixed via `npx firebase-tools login --reauth`.
- `[x]` 15. **Google Sign-In verified in distributed APK**: ✅ user tested login/register successfully (debug keystore SHA-1 already registered on OAuth client).

## Phase 2 — YOUR next actions (Firebase console, ~10 min)
- [ ] Firebase console → project `bukoo-15ce3` (NO new project — google-services.json already wired)
- [ ] App Distribution → create tester group `mvp-testers` + add emails
- [ ] Remote Config → add parameters: `home_layout` (carousel/grid), `pricing_display` (monthly_first/yearly_first), `onboarding_flow` (full/short)
- [ ] Crashlytics → Get started (Android) — SDK already in distributed APK, just activate + verify a test crash
- [ ] (optional) Add `@react-native-firebase/analytics` for event-based A/B metrics

## Manual follow-ups (blocked on accounts/PT/credentials — not code)
- [ ] ⚠️ d1_migrations tracker — ✅ RESOLVED 2026-08-17 (see above)
- [ ] Verify/register release keystore SHA-1 on Android OAuth client in Google Cloud Console
- [ ] Xendit account (waiting on PT) → sandbox → Phase 4 webhook/checkout
- [ ] Phase 0 legal/accounts (PT, D-U-N, Apple, Play) → Phase 6 submission
- [ ] Note: remote `books` has 0 rows; `books_fts` has harmless orphan rows; rebuild books_fts when real books exist
- [ ] Verify/register release keystore SHA-1 on Android OAuth client in Google Cloud Console
- [ ] Xendit account (waiting on PT) → sandbox → Phase 4 webhook/checkout
- [ ] Phase 0 legal/accounts (PT, D-U-N, Apple, Play) → Phase 6 submission

# current integration tasks

- `[x]` 1. Consolidate isPremium and subscriptionRequired
  - `[x]` Remove `isPremium` field from `prisma/schema.prisma` in `bukoo-web` and `bukoo-mobile-app`.
  - `[x]` Update all files in `bukoo-web` to use `subscriptionRequired` instead of `isPremium` (forms, actions, views, etc.).
  - `[x]` Run `npx tsc --noEmit` in `bukoo-web` and ensure type check passes.
  - `[x]` Run `npx tsc --noEmit` in `bukoo-mobile-app/apps/api` and ensure type check passes.
- `[x]` 2. Validate Neon Schema Migration and Column Rename
  - `[x]` Create a new Neon branch `migration-test-v2` parented from `production`.
  - `[x]` Point `DATABASE_URL` to `migration-test-v2` in `.env`.
  - `[x]` Baseline the starting database state with columns `passwordHash` and `avatarUrl` and insert dummy user row.
  - `[x]` Run `npx prisma migrate dev --create-only` and generate migration SQL.
  - `[x]` Review generated SQL and fix the destructive `DROP/ADD COLUMN` to safe `RENAME COLUMN` operations.
  - `[x]` Apply migration cleanly using `npx prisma migrate dev` with shadow database validation.
  - `[x]` Query `User` table to verify test user credentials survived intact under new column names.

# Reader UX/perf improvements

- [x] 1. Performance Instrumentation & Measurement
  - `[x]` Add latency and load-time timing logs for reader startup, book loading, and page transitions.
  - `[x]` Verify with `npm run typecheck --workspace=@bukoo/mobile` and `npm run lint --workspace=@bukoo/mobile`.

- [x] 2. Quick Wins (Low Risk / Immediate UX & Offline Fixes)
  - `[x]` Bundle PDF.js assets locally so PDF reading works 100% offline without CDN dependency.
  - `[x]` Refine gesture handling and tap zone overlays to allow smooth text selection alongside page-turn taps.
  - `[x]` Improve UI chrome accessibility labels, status bar style transitions, and auto-hide timer safety.
  - `[x]` Verify with `npm run typecheck --workspace=@bukoo/mobile` and `npm run lint --workspace=@bukoo/mobile`.

- [x] 3. Medium Changes (Memory Footprint & Load Speed)
  - `[x]` Replace whole-file Base64 bridge payload passing with streamed/chunked or local file server URL loading to eliminate OOM risk on 50MB+ EPUBs.
  - `[x]` Optimize EPUB locations generation and disk cache persistence for instant resume on long books (100+ chapters).
  - `[x]` Smooth out typography controls (fontSize, fontFamily, themes) with debouncing to prevent WebView reflow freezes.
  - `[x]` Verify with `npm run typecheck --workspace=@bukoo/mobile` and `npm run lint --workspace=@bukoo/mobile`.

- [x] 4. Structural Changes (Rendering Strategy Overhaul) — *Requires Explicit Go-Ahead*
  - `[x]` Evaluate moving from single-WebView epubjs rendition to virtualized multi-page or custom paginator engine for sub-16ms native page turns benchmarked against Apple Books.

# Reader Bug Fixes — High-Severity Cluster (2026-08-16)

- [x] 1. Highlight lifecycle
  - [x] Re-apply highlights after page-turn style change (rendition rebuild) via `__bukooSetHighlights` bridge store.
  - [x] Wire up dead `HIGHLIGHT_CLICKED` message → opens `HighlightModal`.
- [x] 2. TOC & navigation
  - [x] Send `chapterHref` in `PAGE_CHANGED`; TocModal compares normalized hrefs (was always-false CFI vs href).
  - [x] Resolve TOC/search hrefs → CFI before display (`resolveHrefToCfi`); search fallback emits `item.cfi` not bare href.
- [x] 3. Reading time accuracy
  - [x] Freeze ticker when app backgrounded (was empty no-op AppState handler).
  - [x] Gate ticker on reader `isReady` so loading/failure time is not counted.
- [x] 4. Annotation sync wiring (bug 8)
  - [x] Rewrote `annotationSyncService.ts` to use shared `api` axios instance (fixes wrong token key: was AsyncStorage `userToken`, now SecureStore `access_token` via interceptor; inherits `EXPO_PUBLIC_API_URL`).
  - [x] Made sync idempotent (dedupe by cfiRange / cfi) — was inserting duplicates on every pull.
  - [x] Added `pushBookmark`, `deleteHighlight`, `deleteBookmark`, `updateHighlightNote` (remote id lookup by cfi).
  - [x] Added `PATCH /reading/highlights/:id` (note update) to `apps/api/src/routes/reading.ts`.
  - [x] Wired into `ReadingScreen`: pull on open, push on select/toggle, delete + note sync.
- [x] 5. Duplicate listener attachment
  - [x] Removed second `attachRenditionListeners` call in `__bukooLoadBook` (double PAGE_CHANGED / double-firing taps).

# Publisher Dashboard Redesign (dark, reader-insight) — 2026-08-16

- [x] 1. Rewrite `apps/web/src/app/publisher/dashboard/page.tsx`
  - [x] Replaced royalty-calc dashboard with dark reader-insight dashboard per `publisher/penerbit-dashboard.html` (user decision: replace, fully static data, dark theme).
  - [x] Widgets: KPI row (Rp 148 jt, 86.240 sesi, 142/320, Tgl 5), top-5 books, rising genres, collection utilization 44/56, 6-month royalty trend, transfer history, transparency note, CTA band.
  - [x] Kept auth guard (typed cast instead of `any`); `export const dynamic = "force-dynamic"`; CTA links to `/publisher/books/new`.
- [x] 2. Add `.dash-*` styles to `apps/web/src/app/publisher/publisher.css`
  - [x] Dark topbar variant (`.dash-topbar`) + dark content (`.dash-main`); all new classes prefixed `.dash-` to avoid clashing with light theme.
  - [x] Added Plus Jakarta Sans + JetBrains Mono to font import.
- [x] 3. Verify
  - [x] `npx tsc --noEmit` (apps/web) ✅
  - [x] `npx eslint` on changed files ✅ (fixed the `any` in auth guard)
  - [x] `npm run build` (apps/web) ✅ — `/publisher/dashboard` compiles as dynamic route.
  - [ ] Repo-wide `npm run lint` still fails on PRE-EXISTING errors in untouched files (`middleware.ts`, `catalog-query.ts`, `sidebar-client.tsx`, `auth.config.ts`, etc.) — pre-existing debt, not introduced here. Flagged, not silently skipped.

# Web Vercel → Cloudflare Workers migration — preview checks (2026-08-16)

- [x] A. Register + credentials login → `/library` (test acct `cloudtest@bukoo.app`)
- [x] B. Publisher book upload (R2) — row in D1 books + cover/epub R2 objects
  - [x] Fix: covers didn't render — raw R2 key used as `<img src>` with no serving route. Added `lib/cover-url.ts` (`getCoverUrl`) + `/covers/[...key]/route.ts` streaming from `BUKOO_STORAGE`; updated publisher/admin books pages, book-mapper, edit page.
- [x] C. Reader page — EPUB loads, cover/TOC/page-turn work
  - [x] Fix 1: `react-reader`/`react-pdf` browser-only `DOMMatrix` crashed SSR on Workers → dynamic imports with `ssr:false` in `reader-shell.tsx`.
  - [x] Fix 2: epubjs needs `.epub` URL extension (else treats as directory → `META-INF/container.xml` 404) → reader `fileUrl` now `/api/books/[id]/download.epub` + new route.
- [x] D. Admin CRUD — list/read/update/delete all work
  - [x] Fix: any UPDATE/DELETE on `books` failed SQLITE_ERROR 7500 — FTS5 `'delete'` special command unsupported in D1; `0001_fts5_books.sql` triggers (`books_ai/au/ad`) broken. Dropped triggers in D1. ⚠️ Migration file still contains them — needs corrective migration for fresh DBs.

# Web Vercel → Cloudflare Workers migration — PROD CUTOVER (2026-08-16) ✅

- [x] 1. Zone `bukoo.id` created + active in Cloudflare; NS switched at Domainesia (vercel-dns.com → Cloudflare).
- [x] 2. `wrangler.prod.jsonc` with `routes: [{pattern:"bukoo.id", custom_domain:true}]`; `deploy:prod` bakes `NEXT_PUBLIC_SITE_URL=https://bukoo.id`.
- [x] 3. `npm run deploy:prod` → **https://bukoo.id live** (worker `bukoo-web`, D1 + R2 + ASSETS bindings).
- [x] 4. Smoke tests pass: home/login 200, credentials login → `/admin`, Google OAuth redirect to bukoo.id callback (authorized), SSL (Google Trust, CN=bukoo.id, → 2026-11-14).
- [x] 5. Secrets purge: removed legacy `DATABASE_URL`/`BLOB_READ_WRITE_TOKEN` from `apps/web/.env` AND root `.env` (root .env is merged into the bundle by OpenNext), redeployed; 0 occurrences in bundle.
- [x] 6. Removed `apps/web/vercel.json`; updated `.env.example`, `AGENTS.md`, regenerated `worker-configuration.d.ts` (`wrangler types --env-interface CloudflareEnv`).
- [ ] 7. (user) Delete Vercel project in dashboard; confirm Neon DB no longer needed.
- [ ] 8. (after final sign-off) Flip `workers_dev` to false in `wrangler.prod.jsonc` to retire the workers.dev URL.

# Reader Bug Fixes — Medium/Low Cluster (2026-08-16)

- [x] 6. Highlight color consistency (bug 9)
  - [x] `TEXT_SELECTED` now stores hex `#FACC15` (was alpha-baked `rgba(250,204,21,0.4)`), so the bridge's single `fill-opacity` is the only opacity source.
  - [x] Removed dead `__bukooApplyHighlights` (conflicting `fill-opacity: 0.3`).
- [x] 7. First-open progress percent race (bug 10)
  - [x] `updateLocalProgress` now takes `percent` and writes it in the same INSERT/UPDATE (`COALESCE`); removed separate `updateProgressPercent` that could run before the INSERT committed.
- [x] 8. Stale locations cache (bug 11)
  - [x] `epub_locations_${bookId}` cache now keyed by source fingerprint (local file size / remote URL) via `getBookSourceFingerprint` — re-downloaded books don't reuse stale page maps.
- [x] 9. Settings effect re-ran on every page turn (bug 12)
  - [x] Split injection (deps no longer include `currentCfi`; position read from `currentCfiRef`) and AsyncStorage persist (setting-change deps only).
- [x] 10. Dead code / TDZ cleanup (bugs 14, 15)
  - [x] Moved `webViewShellReady` ref above `handleMessage`; removed unused `getVerticalScrollTarget` and `dataInjectTimeRef`.
- [ ] 11. Base64 double-memory (bug 13) — NOT DONE: needs a local HTTP server / streaming loader (large architectural change). Flagged for a dedicated task.

Verification: mobile `tsc --noEmit` ✅, mobile lint ✅ (no errors; fixed one `no-empty`). API untouched this round. No test files exist in either workspace.

# Reader Redesign (Kindle/Apple Books Parity)

- `[x]` Phase 0 — Rendering Architecture Audit & Decision Gate (STOP GATE)
  - `[x]` Complete 8-dimension audit comparing current WebView+epub.js vs Native Paginator vs Apple Books/Kindle benchmarks.
  - `[x]` Present formal recommendation & tradeoffs to user for decision gate approval before writing code.
  - `[x]` Create `reader-redesign-prompt.md` prompt deliverable.

- `[x]` Phase 1 — Navigation Redesign (Priority #1)
  - `[x]` Redesign Table of Contents with nested chapter/subchapter structure and position indicator.
  - `[x]` Implement client-side in-book full-text search with snippet preview and match jump.
  - `[x]` Add draggable quick-jump slider / page scrubber control to bottom bar.
  - `[x]` Decompose `ReadingScreen.tsx` monolith into modular components (`TocModal`, `SearchModal`, `SettingsModal`, `HighlightModal`).

- `[x]` Phase 2 — Personalization Redesign (Priority #2)
  - `[x]` Add margin and line-height controls to reader settings.
  - `[x]` Optimize live typography updates without reflow freezes.
  - `[x]` Implement strictly global reader settings persisted in `AsyncStorage`.

- `[x]` Phase 3 — Engagement & Cloud Sync (Priority #3)
  - `[x]` Create Prisma schema models for `Highlight` and `Bookmark` in `apps/api` and `apps/web`.
  - `[x]` Generate safe SQL migration file `20260808170000_add_reader_annotations`.
  - `[x]` Add REST API endpoints in NestJS `ReadingController` & `ReadingService` and mobile `annotationSyncService.ts`.
  - `[x]` Polish inline note bubbles and highlight manager UI (`HighlightModal.tsx`).

- `[x]` Phase 4 — Visual Polish & Motion (Priority #4)
  - `[x]` Refine typography hierarchy, default line-heights, and margin defaults matching Apple Books.
  - `[x]` Smooth out page-turn transitions and gesture interactions with integrated QuickJumpSlider page scrubber.
  - `[x]` Enhance accessibility (Dynamic Type, screen reader labels) and UI chrome auto-hide timer.

- `[x]` Phase 5 — Content Cleanup (PDF Removal)
  - `[x]` Remove legacy PDF rendering bridge and canvas code from `ReadingScreen.tsx`.
  - `[x]` Clean up `MASTER_SAMPLE_BOOKS` PDF dependencies in `BookDetailScreen.tsx` (converted to EPUB).

# Mobile Application UI Redesign
- `[x]` 1. Implement Mobile UI/UX based on reference design screenshots
  - `[x]` Brand assets & theme tokens (`LogoBukoo.tsx`, `COLORS.ts`).
  - `[x]` Bottom Navigation Bar (`MainTabs.tsx`) with active gold pill indicators.
  - `[x]` `HomeScreen.tsx` (greeting, search input pill, category tags, Atomic Habits hero banner, trending carousel).
  - `[x]` `LibraryScreen.tsx` (header count, active reading card Laut Bercerita, AI companion insight card, 3-card stats summary grid).
  - `[x]` `AiCompanionScreen.tsx` (AI top bar, PLUS badge, active reading ETA card, 90% progress recommendation list).
  - `[x]` `ReadingScreen.tsx` Mode Baca (chapter header bar, cream reader surface, bottom pagination bar with Prev/Next buttons).
  - `[x]` `CommunityScreen.tsx` (active user count, posting button, feed card, Baca Bareng event card).
  - `[x]` `ProfileScreen.tsx` (brand logo header, avatar frame, quick stats row, weekly streak calendar bar, achievements grid).
  - `[x]` `SubscriptionScreen.tsx` (Pilih Paket Bukoo, monthly/yearly toggle, tier cards with dynamic pricing).
  - `[x]` `SearchScreen.tsx` (Jelajahi header, filter funnel, trending pills, BUKOO original carousel).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`, `npm run test --workspace=@bukoo/mobile` passed cleanly.

# Reader Bug Fixes
- `[x]` 1. Fix Bottombar Prev/Next Page Navigation in Vertical Scroll mode
  - `[x]` Remove `target.scrollBy` fallback in `window.__bukooNext` & `window.__bukooPrev`.
  - `[x]` Ensure `window.__bukooCurrentRendition.next()` / `prev()` are called.
- `[x]` 2. Fix Highlight Removal Sync in WebView
  - `[x]` Fix `window.__bukooRemoveHighlight` function overwrite bug in EPUB_JS_BRIDGE.
  - `[x]` Safely pass `cfiRange` using `JSON.stringify` in WebView JS injections.
- `[x]` 3. Verification
  - `[x]` Run `npm run typecheck --workspace=@bukoo/mobile` (PASSED).
  - `[x]` Run `npm run lint --workspace=@bukoo/mobile` (PASSED).
  - `[x]` Run `npm run test --workspace=@bukoo/mobile` (No tests configured for workspace).

# Mobile Backend API Integration
- `[x]` 1. Connect Mobile Screens to Live NestJS Backend API
  - `[x]` Create `booksApi` and `libraryApi` in `apps/mobile/src/services/api.ts`.
  - `[x]` Create custom React Query hooks: `useBooksApi.ts` (`useFeaturedBooks`, `useSearchBooks`, `useGenreBooks`) and `useLibraryApi.ts` (`useUserLibrary`).
  - `[x]` Wire `HomeScreen.tsx` to `useFeaturedBooks` with pull-to-refresh control.
  - `[x]` Wire `SearchScreen.tsx` to `useSearchBooks` and `useGenreBooks`.
  - `[x]` Wire `LibraryScreen.tsx` to `useUserLibrary` for dynamic active reading card & progress percentage.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Persistent Auth & Silent Auto-Login
- `[x]` 1. Offline-Resilient Auth & Session Hydration
  - `[x]` Update `useAuthHydration()` in `apps/mobile/src/hooks/useAuth.ts` to distinguish 401/403 (purge tokens) from network disconnection (preserve cached user profile for offline reading).
  - `[x]` Verified `ProfileScreen.tsx` logout button clean token eviction via `useLogout()`.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# HomeScreen Category Filtering Integration
- `[x]` 1. Dynamic Genre Book Filtering on HomeScreen
  - `[x]` Connect `HomeScreen.tsx` category pills to `useGenreBooks` (`GET /books?genre=...`).
  - `[x]` Clean up hardcoded selection index logic (`isSelected = selectedCategory === cat`).
  - `[x]` Dynamically update section title (`Buku ${selectedCategory}` vs `Trending Minggu ini🔥`) and horizontal book carousel data.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Custom Logout Confirmation Modal Redesign
- `[x]` 1. Premium Dark Forest Logout Dialog
  - `[x]` Replace OS system `Alert.alert` in `ProfileScreen.tsx` with a custom Modal card matching Bukoo's dark forest theme.
  - `[x]` Add red glow icon badge (`Ionicons name="log-out-outline"`), title, subtitle, and styled `Batal` / `Ya, Keluar` buttons.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# LoginScreen Header Logo Update
- `[x]` 1. Replace Text Title with Logo Image
  - `[x]` Replaced plain `<Text style={styles.title}>BUKOO</Text>` in `LoginScreen.tsx` header with `<LogoBukoo size={42} />` using `assets/logo/logo bukoo.png`.
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Mobile App Launcher Icon Update
- `[x]` 1. Update App Launcher Icons across Expo & Android Resources
  - `[x]` Extracted primary Dark Forest & Gold BUKOO icon emblem from `assets/BUKOO App icon.png`.
  - `[x]` Configured `apps/mobile/app.json` for Expo app icons (`icon`, `adaptiveIcon`, `favicon`).
  - `[x]` Generated native Android app launcher mipmaps (`ic_launcher.webp`, `ic_launcher_round.webp`, `ic_launcher.png`, `ic_launcher_round.png`) across all densities (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Sample Books Conversion to EPUB
- `[x]` 1. Convert PDF books in `sample-books/` to EPUB format
  - `[x]` Convert `Filsafat Ajaran Islam (Edisi 2025) final 3 - ISBN DIGITAL.pdf` -> `apps/api/public/books/filsafat-ajaran-islam.epub`.
  - `[x]` Convert `Perlunya Seorang Imam (Revisi) 2.pdf` -> `apps/api/public/books/perlunya-seorang-imam.epub`.
  - `[x]` Convert `RIWAYAT-RASULULLAH.pdf` -> `apps/api/public/books/riwayat-rasulullah.epub`.
  - `[x]` Update `apps/api/prisma/seed.ts` fileUrls and fileTypes to EPUB.
  - `[x]` Fix stale PDF cache loading bug in ReadingScreen & bookDownloadService when book format switches to EPUB.
  - `[x]` Verification complete: typecheck, lint, test across touched workspaces.

# Fix Offline EPUB Asset Require Paths
- `[x]` 1. Fix relative asset path for offline EPUB books in ReadingScreen
  - `[x]` Correct relative require paths in `ReadingScreen.tsx` from `../../assets/` to `../../../assets/` to accurately resolve `apps/mobile/assets/` files (`filsafat-ajaran-islam.epub`, `perlunya-seorang-imam.epub`, `riwayat-rasulullah.epub`, `sample-book.epub`).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile` (PASSED), `npm run lint --workspace=@bukoo/mobile` (PASSED), `npm run test --workspace=@bukoo/mobile` (No tests specified for mobile yet).

# Mobile Release Build & API Fallback Fix
- `[x]` 1. Fix Release APK Login Error & Production Environment Variables
  - `[x]` Update default `API_URL` fallback in `api.ts` from `http://localhost:3000` to `https://bukooapi-production.up.railway.app/v1`.
  - `[x]` Update default `API_BASE_URL` fallback in `annotationSyncService.ts` to `https://bukooapi-production.up.railway.app/v1`.
  - `[x]` Update `webClientId` fallback in `LoginScreen.tsx` to `576187863248-9voo043m0bm915b8g6b0k1m5ios9qai2.apps.googleusercontent.com`.
  - `[x]` Add `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_GOOGLE_CLIENT_ID` to `eas.json` under `development`, `preview`, and `production` build profiles.
  - `[x]` Verification complete: typecheck, lint, test across touched workspace `@bukoo/mobile`.

# Mobile App APK Build for Testing
- `[x]` 1. Build Standalone Android APKs (Release & Debug)
  - `[x]` Update `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` and `eas.json` to active Cloudflare Workers production URL (`https://bukoo-api.erachmat-dev.workers.dev/v1`).
  - `[x]` Assemble Release APK (`./gradlew assembleRelease`).
  - `[x]` Assemble Debug APK (`./gradlew assembleDebug`).
  - `[x]` Verify output APK files, sizes, and timestamps (`app-release.apk` 109MB, `app-debug.apk` 183MB).
  - `[x]` Verification complete: `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile`.

# Fix Reader Resume "Snap-Back" Bug (shows page 25, next → 17)
- `[x]` 1. Root cause
  - `[x]` Confirmed via browser repro with the bundled epub.js: `rendition.display(savedPointCfi)` on a point CFI that sits exactly on a page boundary positions the content ONE PAGE EARLY, so the saved page counter (25) lies while the actual content is a page behind; pressing "next" advances to the true position and the counter "snaps back" to a lower page (e.g. 17).
  - `[x]` Fix strategy: nudge the saved CFI forward (+1 char, only when offset > 0) so the anchor lands inside the page; verify the relocated location against the saved one and fall back to `cfiFromLocation(locationFromCfi(savedCfi))` if epub.js still lands one page early (layout-timing race).
- `[x]` 2. Changes in `apps/mobile/src/screens/reading/ReadingScreen.tsx`
  - `[x]` Add `nudgeCfiForward()` and `window.__bukooRestorePosition(cfi)` to the WebView bridge (nudge + verify + location fallback).
  - `[x]` Route the pre-ready display in `__bukooLoadBook` and the READY-triggered position restore through `__bukooRestorePosition`.
  - `[x]` Route `__bukooDisplay` (TOC / search / bookmark / highlight jumps) through `__bukooRestorePosition` too.
- `[x]` 3. Verification
  - `[x]` Browser repro: sample-book (66 locs, reproduces bug) — resume now lands exactly at saved CFI `/3:890` (page 25) instead of one page early (`/3:289`); `next()` moves forward. `filsafat-ajaran-islam` & `perlunya-seorang-imam` (no bug) — no regression, resume lands exactly at saved position.
  - `[x]` `npm run typecheck --workspace=@bukoo/mobile` (PASSED).
  - `[x]` `npm run lint --workspace=@bukoo/mobile` (PASSED).
  - `[x]` `npm run test --workspace=@bukoo/mobile` (No tests configured for mobile yet).

# GitHub Push Protection — Secret Leak Remediation (2026-08-16) ✅

- [x] 1. Incident: `git push` blocked by GH013 (push protection) — `apps/web/.open-next/cloudflare/next-env.mjs` contained inlined secrets (`CLOUDFLARE_D1_TOKEN`, `CLOUDFLARE_R2_TOKEN` = same `cfat_` token, `AUTH_SECRET`, `CLOUDFLARE_ACCOUNT_ID`, D1 `database_id`) — OpenNext build output committed in local-only commit `60c7b08`.
- [x] 2. Remediation (commit was never pushed — `ahead 1` of origin):
  - [x] Untracked + removed from history: `apps/web/.open-next/`, `apps/web/.wrangler/`, `apps/api/.wrangler/` (26 miniflare state files), `apps/web/.env.production`.
  - [x] Redacted D1 `database_id` in `apps/web/wrangler.jsonc` + `wrangler.prod.jsonc` → `REPLACE_WITH_D1_DATABASE_ID` (flagged by Cloudflare secret scanner).
  - [x] `.gitignore`: added `**/.open-next/`, `**/.wrangler/`, `.env.production`.
  - [x] Rewrote history: `4ba9d2f` (amended) + `d798761` (chore: remove wrangler local state + redact D1 id).
  - [x] Verified: no real secrets in HEAD tree (remaining grep hits are placeholders/docs/types); pushed `a6f8fb2..d798761` successfully.
- [ ] 3. (user) Rotate Cloudflare API token (`cfat_…`, D1/R2) — regenerated in Cloudflare dashboard → My Profile → API Tokens; update wherever used.
- [ ] 4. (user) Rotate `AUTH_SECRET` (worker secret via `wrangler secret put`).
- [ ] 5. (user) Restore real D1 `database_id` in `apps/web/wrangler.jsonc` + `wrangler.prod.jsonc` (or inject via CI/secret).
- [ ] 6. (user, optional) Delete Vercel project + confirm Neon no longer needed (from migration section).
