# Phase 2 — Firebase App Distribution + A/B Testing (BUKOO MVP)

Applies to `apps/mobile` (Android-first for now; iOS later via TestFlight).

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

```bash
npm install -g firebase-tools   # or: npx firebase-tools
cd apps/mobile
npx firebase login              # interactive OAuth — must be the Google account
                                # that owns project bukoo-15ce3
```

## Build + distribute (me or you)

```bash
cd apps/mobile
npm run apk:release             # ./gradlew assembleRelease
npm run distribute:firebase     # uploads app-release.apk to the mvp-testers group
```

Testers get an email link → allow "install unknown apps" → install.

> Requires a **release-signed** APK. If you use EAS builds instead:
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
- `app.json` — Firebase config plugins (app, crashlytics, remote-config)
- `package.json` — `apk:release` + `distribute:firebase` scripts

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
