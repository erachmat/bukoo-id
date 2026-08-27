# SDD Ledger — apk-firebase-distribution

Plan: `docs/superpowers/plans/2026-08-27-apk-firebase-distribution.md`
Spec: `docs/superpowers/specs/2026-08-27-apk-firebase-distribution-design.md`

- Task 1: complete — release signing wired in `android/app/build.gradle`
  (`loadKeystoreProperties()` + optional `signingConfigs.release`, debug fallback).
- Task 2: complete — `android/keystore.properties.example` committed.
- Task 3: complete — `android/.gitignore` ignores `keystore.properties`, `*.jks`,
  `*.keystore` (`!debug.keystore`); verified via `git check-ignore`.
- Task 4: complete — `deploy:firebase` script in `apps/mobile/package.json`.
- Task 5: complete — `FIREBASE_MVP_TESTING.md` release-signing section + verified note.
- Task 6: complete — typecheck ✅, lint ✅ (0 errors), test = no-op (no mobile
  tests — stated); `npm run apk:release` → `BUILD SUCCESSFUL`, `app-release.apk`
  produced (122 MB, signed w/ debug cert via fallback — expected until
  `keystore.properties` exists); git-ignore verified; Firebase CLI logged in as
  `erachmat.dev@gmail.com` (read-only check).
- Task 7: complete — ledger + `task.md` updated; committed + pushed 2026-08-27
  (commit `8361968`; review clean).

## Notes / follow-ups (user-side, one-time)

- Release keystore regenerated 2026-08-27 reading passwords from gitignored
  `keystore.properties` (original was created with a bash history-expanded `!#`
  password). `keytool -list` unlock verified; release APK signed with release
  cert `CN=BUKOO` (SHA-256 `6935bd8b…`). **Back up keystore + passwords.**
- Remaining manual step: `cd apps/mobile && npm run distribute:firebase`
  (or `npm run deploy:firebase`) to push to `mvp-testers`.
