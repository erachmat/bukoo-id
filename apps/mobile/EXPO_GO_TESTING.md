# Testing BUKOO in Expo Go (no Apple Developer account needed)

Remote testers can run the app on a real iPhone (or Android) with **Expo Go** —
no paid Apple Developer account, no EAS build, no TestFlight. This is the
fastest path for ad-hoc iOS testing while the company Apple account is pending.

## Prerequisite — the RIGHT Expo Go build (iOS)

BUKOO targets **Expo SDK 56**. The App Store's Expo Go only supports up to
**SDK 54** — Expo stopped shipping SDK 55+ builds there. Even the "latest"
App Store Expo Go will therefore fail with:

```text
Project is incompatible with this version of Expo Go
The project you requested requires a newer version of Expo Go.
```

For SDK 55+ on a physical iPhone, install the matching Expo Go build via
Expo's web installer (works with a **free Apple ID** — no paid account):

1. On the tester's iPhone, open **https://sign.expo.dev**
2. Select **SDK 56** → sign in with their Apple ID → install that Expo Go build.
3. ⚠️ The provisioning certificate is valid **~7 days** — re-visit
   sign.expo.dev to re-sign/reinstall weekly (until the company Apple account
   + TestFlight path is ready).

Android is unaffected: download the SDK 56 Expo Go APK from
https://expo.dev/go (pick the SDK version matching this project).

## How to run

From a machine on the same network as the tester (or anywhere, via tunnel):

```bash
cd apps/mobile
npx expo start --tunnel
```

- The first time, Expo may ask to install `@expo/ngrok` — accept (one-time).
- A QR code appears. The tester opens the **SDK 56 Expo Go** installed above
  (NOT the App Store version), signs into the same Expo account (or scans
  while on the same network), and scans the QR code.
- With `--tunnel` the tester can be anywhere in the world — the JS bundle is
  served through Expo's tunnel.

The app reads `EXPO_PUBLIC_API_URL` from `apps/mobile/.env` at serve time, so
testers hit the real backend (`https://api.bukoo.id/v1`).

## What works in Expo Go

- Email/password login & register, biometric unlock
- **Apple Sign-In** (`expo-apple-authentication` is bundled in Expo Go)
- Home, bookshelf, reader (epubjs + webview), search, subscriptions, profile,
  notifications (local reminders; push tokens via Expo Push service)
- Reading streak / share-card UI (view-shot is bundled) — generic share sheet
  may still work via the system picker

## What does NOT work in Expo Go (by design — graceful fallbacks)

| Feature | Behavior in Expo Go |
|---|---|
| Google Sign-In | Button shows a graceful error alert (native module not bundled) |
| Firebase Crashlytics | Silently disabled (guarded at boot) |
| Firebase Remote Config | Falls back to code-default feature flags |
| Share to Instagram Story (`react-native-share`) | Not bundled — shows an error alert |

These all work normally in real dev/release builds (`expo run:*` / EAS).

## Gotchas

- **Weekly re-sign**: the sign.expo.dev Expo Go certificate expires after
  ~7 days — testers must reinstall before opening the app.
- Expo Go runs your project inside Expo Go's sandbox — local SQLite / SecureStore
  data lives under Expo Go's container and may not survive app reinstall.
- This project is **not** a dev-client build; `expo start` (without `--tunnel`)
  requires the phone and dev machine on the same LAN, or use `--tunnel`.
- Don't add `expo-dev-client` for this flow — Expo Go is the point.
