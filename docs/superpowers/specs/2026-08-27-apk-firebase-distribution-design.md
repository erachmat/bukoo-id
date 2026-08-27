# Design Spec — APK → Firebase Distribution (release signing + verified flow)

Date: 2026-08-27 · Repo: bukoo · Scope: `apps/mobile`

## Executive summary

The mobile app already has Firebase App Distribution wired up: scripts
`apk:release` and `distribute:firebase` in `apps/mobile/package.json`, Firebase
project `bukoo-15ce3` registered, and `apps/mobile/FIREBASE_MVP_TESTING.md`
documenting the flow. **The gap:** `assembleRelease` currently signs with the
**debug keystore** (`signingConfigs.debug`), so there is no proper release
keystore, no `keystore.properties`, and the release APK has never been built in
this repo. This task makes "deploy APK to Firebase" a proper, repeatable,
verified workflow.

## Goal

1. `npm run apk:release` produces a genuinely **release-signed** APK once a
   keystore exists, while **degrading gracefully to debug signing** so the flow
   keeps working today (internal MVP testing) with zero secrets committed.
2. One-time keystore setup is documented and reproducible via a gitignored
   `keystore.properties` (standard Android pattern).
3. A single `deploy:firebase` command builds + distributes in one step.
4. Docs (`FIREBASE_MVP_TESTING.md`) reflect the real, verified state.

## Non-goals

- No EAS changes (EAS `preview` profile already exists and manages its own
  keystores — documented as the alternative path).
- No CI/CD pipeline for APK distribution (out of scope; manual flow only).
- No untracking of the already-committed `debug.keystore` (drive-by change).
- No secret generation by automation — keystore passwords are created by the
  user in their own terminal.

## Component spec

### 1. `apps/mobile/android/app/build.gradle` — release signing wiring

- Add a `loadKeystoreProperties()` helper that reads `keystore.properties` from
  `apps/mobile/android/` if present (never fails when absent).
- Define `signingConfigs.release` only when all 4 fields
  (`storeFile`, `storePassword`, `keyAlias`, `keyPassword`) are present.
- `buildTypes.release.signingConfig` = release config when available, else
  falls back to `signingConfigs.debug` (current behavior).

This is the standard RN/Android pattern: committed code + gitignored secrets.

### 2. `apps/mobile/android/keystore.properties.example` (committed)

Template documenting the 4 required fields with comments. Safe to commit —
contains no secrets.

### 3. `apps/mobile/android/.gitignore`

Add `keystore.properties`, `*.jks`, `*.keystore` (with `!debug.keystore` so the
already-tracked dev keystore stays visible). Prevents future keystores from
being committed.

### 4. `apps/mobile/package.json`

Add `deploy:firebase` = `npm run apk:release && npm run distribute:firebase`.

### 5. `apps/mobile/FIREBASE_MVP_TESTING.md`

Add a **Release signing** section: one-time keystore generation via `keytool`,
`keystore.properties` setup, the debug-signing fallback behavior, and a
"Verified 2026-08-27" note.

## Layout/styling tokens

n/a (no UI changes).

## Verification plan

Per AGENTS.md, for the `mobile` workspace (and repo root):

1. `npm run typecheck --workspace=mobile` — tsc passes.
2. `npm run lint --workspace=mobile` — ESLint passes.
3. `npm run test --workspace=mobile` — note: currently a no-op echo (no tests
   exist in mobile); state this explicitly.
4. `npm run apk:release` — gradle `assembleRelease` builds a signed APK
   (`app-release.apk` exists in output).
5. Confirm no secrets land in git: `keystore.properties` and any release
   `.keystore` are ignored.
6. Read-only check of Firebase CLI login state (does not distribute).

## Risks / mitigations

- **Secret leakage**: keystore passwords only ever live in the user's terminal
  and in gitignored `keystore.properties`. `.example` template is placeholder
  only. Git status verified before commit.
- **Gradle build failure**: the wiring is additive (a helper + optional config);
  if `keystore.properties` is absent the build behaves exactly as today.
- **Long build time**: `assembleRelease` runs in background; no blocking.
