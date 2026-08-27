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
- Task 8: complete — distributed to `mvp-testers` 2026-08-27. Release `1.0.0 (1)`
  uploaded; then Google Sign-In surfaced "Developer error" → diagnosed + fixed and
  re-distributed as `1.0.1 (2)`.
- Task 9: complete — Google Sign-In `DEVELOPER_ERROR` (status 10) root-caused:
  release cert SHA-1 (`BF:E4:B6:...`, `bukoo-release.keystore`) was not registered
  in Firebase (only debug `5E:8F:16:...` was in `google-services.json`). Fix:
  added release SHA-1 in Firebase console + re-downloaded `google-services.json`
  (now lists both hashes). No JS change needed (`socialAuth.ts` config was correct).
- Task 10: complete — "no new APK in Firebase" had two causes: (a) Gradle
  `assembleRelease UP-TO-DATE` (google-services.json change not tracked as task
  input) → force with `./gradlew clean assembleRelease` (first clean pass can fail
  on RN codegen/CMake `react_codegen_*` target — rerun once); (b) unchanged
  `versionCode` → App Distribution de-dupes by version ("re-uploaded already
  existing release"). Bumped `versionCode 2` / `versionName "1.0.1"` in
  `apps/mobile/android/app/build.gradle`.
- Task 11: complete — verified `uploaded new release 1.0.1 (2)`; APK signed w/
  release cert digest `bfe4b63d...`; `output-metadata.json` confirms version.
- Task 12: pending — manual QA: tester reinstalls `1.0.1 (2)`, Google Sign-In
  account picker appears (no Developer error).

## Notes / follow-ups (user-side, one-time)

- Release keystore regenerated 2026-08-27 reading passwords from gitignored
  `keystore.properties` (original was created with a bash history-expanded `!#`
  password). `keytool -list` unlock verified; release APK signed with release
  cert `CN=BUKOO` (SHA-256 `6935bd8b…`). **Back up keystore + passwords.**
- Remaining manual step: `cd apps/mobile && npm run distribute:firebase`
  (or `npm run deploy:firebase`) to push to `mvp-testers`.
