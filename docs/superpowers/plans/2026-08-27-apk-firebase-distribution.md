# Implementation Plan — APK → Firebase Distribution (release signing + verified flow)

Date: 2026-08-27 · Repo: bukoo · Workspace: `apps/mobile`

Header: `superpowers:subagent-driven-development`

Spec: `docs/superpowers/specs/2026-08-27-apk-firebase-distribution-design.md`

## Task 1 — Wire release signing in `apps/mobile/android/app/build.gradle`

- [ ] Add `loadKeystoreProperties()` helper reading `keystore.properties` from
      `apps/mobile/android/` (graceful when absent).
- [ ] Define `signingConfigs.release` when all 4 fields present.
- [ ] Point `buildTypes.release.signingConfig` at release config, falling back
      to `signingConfigs.debug` when absent.

## Task 2 — Add `apps/mobile/android/keystore.properties.example`

- [ ] Create committed template with `storeFile`, `storePassword`, `keyAlias`,
      `keyPassword` placeholders + comments.

## Task 3 — Update `apps/mobile/android/.gitignore`

- [ ] Add `keystore.properties`, `*.jks`, `*.keystore`, `!debug.keystore`.

## Task 4 — Add `deploy:firebase` script to `apps/mobile/package.json`

- [ ] `"deploy:firebase": "npm run apk:release && npm run distribute:firebase"`

## Task 5 — Update `apps/mobile/FIREBASE_MVP_TESTING.md`

- [ ] Add **Release signing** section (one-time `keytool` + `keystore.properties`
      setup, debug fallback note).
- [ ] Update the "requires a release-signed APK" wording to reflect the fallback.
- [ ] Add "Verified 2026-08-27" note.

## Task 6 — Verification (AGENTS.md checklist)

- [ ] `npm run typecheck --workspace=mobile`
- [ ] `npm run lint --workspace=mobile`
- [ ] `npm run test --workspace=mobile` (no-op — state explicitly)
- [ ] `npm run apk:release` builds `app-release.apk`
- [ ] Confirm git ignores `keystore.properties` / release `.keystore`
- [ ] Firebase CLI login state (read-only)

## Task 7 — Ledger, task.md, commit

- [ ] Update `.superpowers/sdd/apk-firebase-distribution/progress.md`
- [ ] Update root `task.md`
- [ ] Commit + push

## Files touched

- `apps/mobile/android/app/build.gradle` (edit)
- `apps/mobile/android/keystore.properties.example` (new)
- `apps/mobile/android/.gitignore` (edit)
- `apps/mobile/package.json` (edit)
- `apps/mobile/FIREBASE_MVP_TESTING.md` (edit)
- `.superpowers/sdd/apk-firebase-distribution/progress.md` (new)
- `task.md` (edit)

## Verification steps

1. `npm run typecheck --workspace=mobile`
2. `npm run lint --workspace=mobile`
3. `npm run test --workspace=mobile` → expect `No tests specified for mobile yet`
4. `cd apps/mobile && npm run apk:release` → expect `app-release.apk` in
   `android/app/build/outputs/apk/release/`
5. `git status` shows no secret files tracked.
