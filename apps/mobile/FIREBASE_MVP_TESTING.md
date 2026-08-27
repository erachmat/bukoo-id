# Phase 2 — Firebase App Distribution + A/B Testing (BUKOO MVP)

Applies to `apps/mobile` (Android-first for now; iOS later via TestFlight).

> ✅ **Verified 2026-08-27**: release APK builds via `npm run apk:release`;
> signing wiring (keystore.properties + debug fallback) in place; the
> `deploy:firebase` convenience script added. Distribution to `mvp-testers`
> still requires `firebase login` + the group existing (see below).

## One-time setup (you, ~10 min)

The app is already registered to Firebase project **`bukoo-15ce3`** (package
`com.erachmat.bukoo`, `google-services.json` already in the repo and referenced
by `app.json`). No new Firebase project is needed.

1. Open [Firebase console](https://console.firebase.google.com) → project
   `bukoo-15ce3` (project number `576187863248`).
2. **App Distribution**: no config needed — just create the tester group:
   Console → App Distribution → Testers & groups → **New group** named
   `mvp-testers` → add tester emails.
3. **Remote Config**: Console → Remote Config → first use creates it. Add the
   A/B keys as parameters (see below) — values are strings.
4. **Crashlytics**: Console → Crashlytics → Get started (Android). It will
   detect the SDK once a build with the SDK is installed. No config file needed
   beyond `google-services.json` (already present).

## CLI auth (you, once)

> ⚠️ Use the **global** `firebase` command OR `npx firebase-tools`. Do NOT use
> `npx firebase login` — npm resolves the package `firebase` (the JS SDK, which
> has no CLI binary) and fails with "could not determine executable to run".
> The CLI lives in the `firebase-tools` package.

```bash
# Already installed globally on this machine (v14.8.0):
firebase login
# ...or explicitly via npx with the correct package:
npx firebase-tools login
```

Must be the Google account that owns project `bukoo-15ce3`.

## Release signing (one-time, ~5 min)

`assembleRelease` signs with a real **release keystore** when
`apps/mobile/android/keystore.properties` exists (gitignored). Until then it
falls back to the debug keystore — the build and App Distribution still work for
internal testing, but the APK is debug-signed.

To set up a proper release keystore (run in `apps/mobile/android/`):

```bash
keytool -genkeypair -v -keystore bukoo-release.keystore \
  -alias bukoo -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass YOUR_STORE_PASSWORD -keypass YOUR_KEY_PASSWORD \
  -dname "CN=BUKOO, OU=Mobile, O=BUKOO, L=Jakarta, S=Jakarta, C=ID"
```

Then copy `keystore.properties.example` → `keystore.properties` and fill in the
same `storeFile`/`storePassword`/`keyAlias`/`keyPassword`.

> ⚠️ **Back up `bukoo-release.keystore` + the passwords** somewhere safe (e.g.
> a password manager / secure storage). If lost, you can no longer update any
> app already installed with that key. `keystore.properties` and the keystore
> are gitignored — never commit them.

## Build + distribute (me or you)

```bash
cd apps/mobile
npm run apk:release             # ./gradlew assembleRelease
npm run distribute:firebase     # uploads app-release.apk to the mvp-testers group
# ...or in one step:
npm run deploy:firebase
```

Testers get an email link → allow "install unknown apps" → install.

> Signing: uses the real release keystore when `keystore.properties` is set up
> (see above); otherwise falls back to the debug keystore (still installable,
> but debug-signed). If you use EAS builds instead:
> `eas build -p android --profile preview` produces an installable APK you can
> upload to App Distribution manually (`firebase appdistribution:distribute <file>`).

## Remote Config A/B parameters

Defined in `apps/mobile/src/services/featureFlags.ts` (defaults ship in code,
Remote Config overrides them):

| Key | Values | Default | Used by |
|---|---|---|---|
| `home_layout` | `carousel` / `grid` | `carousel` | `HomeScreen` (trending section) |
| `pricing_display` | `monthly_first` / `yearly_first` | `monthly_first` | `SubscriptionScreen` (default billing tab) |
| `onboarding_flow` | `full` / `short` | `full` | (reserved — no onboarding screen yet) |

### To run an A/B experiment

Console → Remote Config → **A/B Testing** → Create experiment:
1. Pick a parameter (e.g. `home_layout`).
2. Variants: control = `carousel`, treatment = `grid`.
3. Target: the `mvp-testers` group (or an Analytics audience later).
4. Metric: e.g. sessions with ≥ 2 books opened, retention, etc. (needs
   Firebase Analytics event — currently not installed; simplest launch metric
   is install + crash-free users).

> ⚠️ Store rule reminder: if you ever A/B test **pricing display**, the winning
> variant must match the actual store price. Under Option A the app has no
> in-app purchase, so `pricing_display` only changes which cycle is pre-selected
> on the informational screen — fine.

## Crashlytics

- `apps/mobile/src/services/crashReporting.ts` — `initCrashReporting()` is called
  from `App.tsx`. Collection is **disabled in `__DEV__`**, enabled by default in
  release/test builds.
- Use `reportError(err, 'context')` for caught exceptions you want on the board.
- Console → Crashlytics → see crashes per release once testers run the build.

## File map

- `src/services/featureFlags.ts` — flag registry + Remote Config init + store
- `src/hooks/useFeatureFlags.ts` — `useFeatureFlag(key)` / `useFeatureFlagsReady()`
- `src/services/crashReporting.ts` — Crashlytics wrapper
- `App.tsx` — boots both on startup
- `app.json` — Firebase config plugins (app, crashlytics only — remote-config needs NO plugin)
- `package.json` — `apk:release` + `deploy:firebase` + `distribute:firebase` scripts
- `android/app/build.gradle` — release signing (reads `keystore.properties`, debug fallback)
- `android/keystore.properties.example` — release signing template (gitignored copy = `keystore.properties`)

> ⚠️ Gotcha (2026-08-18): do NOT add `@react-native-firebase/remote-config`
> to `app.json` plugins — it ships NO config plugin and breaks the gradle
> `createExpoConfig` task. Remote Config is part of the core `@react-native-firebase/app` native module and needs no plugin entry.

## Known constraints (honest)

- **Native rebuild required**: the Firebase SDKs are native modules. They take
  effect in the next `expo run:android` / EAS build, not in Expo Go.
- **Remote Config needs the release/standalone build** to talk to Firebase;
  in Expo Go without config it silently falls back to code defaults (by design).
- **Firebase Analytics is NOT installed** — needed for audience/event-based A/B
  metrics. Add `@react-native-firebase/analytics` when you want event metrics.
- **iOS**: same SDKs work via TestFlight once the company Apple account lands;
  `google-services.json` covers Android only — iOS uses `GoogleService-Info.plist`
  (add to `app.json` `ios.googleServicesFile` when the Apple account exists).
