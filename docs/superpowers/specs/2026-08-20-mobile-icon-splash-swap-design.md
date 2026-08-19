# Mobile Launcher & Splash Icon Swap — Design Specification

Date: 2026-08-20
Status: User-approved in plan review

## Overview
Replace the BUKOO mobile app launcher icon and the native Android splash-screen
logo with the updated brand artwork:
- **Launcher icon** → `assets/bukoo-icon-rounded.png` (4096×4096, full-bleed
  rounded-square, dark-green bg + gold logo, transparent corners).
- **Splash logo** → `assets/bukoo-logo-transparent.png` (3720×4096, transparent
  bg, content bbox ≈ 2841×2819 ≈ 69% of canvas height).

This is a pure **asset swap** — no TS/JS code changes.

## Key constraint: native-only splash (NO `expo prebuild`)
`apps/mobile` is an Expo bare workflow with a checked-in `android/` project.
`app.json` has **no `splash` key and no `expo-splash-screen` plugin** — the
splash is configured natively only:
- `android/app/src/main/res/values/styles.xml` → `Theme.App.SplashScreen`
  (`android:windowBackground` = `@drawable/splash_background`)
- `android/app/src/main/res/drawable/splash_background.xml` (dark-green fill +
  centered `@drawable/splashscreen_logo`)
- `android/app/src/main/res/drawable-*/splashscreen_logo.png` (288/432/576/864/1152)
- `AndroidManifest.xml` applies the theme to `MainActivity`

Running `expo prebuild` would wipe this hand-customized splash plus manifest
tweaks (portrait lock, google-services.json, notification icons). **Therefore
all native assets are regenerated in place** and `app.json` references are left
unchanged (they already point at `./assets/icon.png` /
`./assets/adaptive-icon.png`).

## Component specs

### 1. Expo source assets (`apps/mobile/assets/`)
| File | Source | Transform | Notes |
|---|---|---|---|
| `icon.png` | `bukoo-icon-rounded.png` | 4096→1024 full-bleed | Matches current 1024 full-bleed `icon.png` |
| `adaptive-icon.png` | `bukoo-icon-rounded.png` | scale to 512px, center on 1024 canvas | Keeps current 50% adaptive-foreground proportion (current content bbox = 512/1024) |
| `splash-icon.png` (new) | `bukoo-logo-transparent.png` | copy (3720×4096) | Canonical source for future regeneration |
| `favicon.png` | — | unchanged | Web-only, out of scope |

### 2. Native launcher icons (`res/mipmap-*/`)
| Density | Canvas | `ic_launcher.webp` / `ic_launcher_round.webp` | `ic_launcher_foreground.webp` |
|---|---|---|---|
| mdpi | — | 48×48 | 108×108 (content 54) |
| hdpi | — | 72×72 | 162×162 (content 81) |
| xhdpi | — | 96×96 | 216×216 (content 108) |
| xxhdpi | — | 144×144 | 324×324 (content 162) |
| xxxhdpi | — | 192×192 | 432×432 (content 216) |

Legacy icons = full-bleed rounded icon scaled to density. Adaptive foreground =
icon scaled to 50% of canvas (safe-zone-safe), centered, on transparent canvas.
`mipmap-anydpi-v26/ic_launcher*.xml` unchanged (`@color/iconBackground`
`#0B1914` background + `@mipmap/ic_launcher_foreground`).

### 3. Native splash logo (`res/drawable-*/splashscreen_logo.png`)
Resize `bukoo-logo-transparent.png` fit-to-height preserving aspect ratio:
mdpi 288, hdpi 432, xhdpi 576, xxhdpi 864, xxxhdpi 1152 (≈ width ×0.904).
Preserves the current ~69%-of-canvas on-screen logo size; `android:gravity="center"`
centers the non-square bitmap. `splash_background.xml` / `colors.xml`
(`splashscreen_background` `#0B1914`) unchanged.

### 4. Config
- `app.json`: no path edits — `icon`, `ios.icon`, `expo-notifications.icon`
  already reference `./assets/icon.png`; `android.adaptiveIcon.foregroundImage`
  references `./assets/adaptive-icon.png`. Content swaps happen in the assets.
- No `splash` key added (no plugin installed to consume it).

## Verification plan
1. `file`/`identify` on every regenerated file: correct dimensions, valid PNG/WEBP.
2. `npm run android` from `apps/mobile` → visual check: new launcher icon + new
   splash logo.
3. AGENTS.md checklist for `@bukoo/mobile`: `npm run typecheck --workspace=@bukoo/mobile`,
   `npm run lint --workspace=@bukoo/mobile`; test script is a stub ("No tests
   specified for mobile yet") — state this explicitly.
