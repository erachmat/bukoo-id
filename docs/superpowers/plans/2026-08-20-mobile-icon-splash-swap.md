# Mobile Launcher & Splash Icon Swap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swap the mobile launcher icon to `assets/bukoo-icon-rounded.png` and
the native Android splash logo to `assets/bukoo-logo-transparent.png`, via
in-place regeneration of Expo source assets and native `res/` density buckets
(NO `expo prebuild` — native splash/manifest are hand-customized).

**Architecture:** Regenerate `apps/mobile/assets/*` first, then native
`mipmap-*` (launcher, webp) and `drawable-*` (splash logo, png) buckets with
ImageMagick (webp write confirmed: libwebp 1.3.2). `app.json` needs no edits.

**Tech Stack:** Expo bare workflow, React Native, Android resources,
ImageMagick.

## Global Constraints
- Do NOT run `expo prebuild` or touch `AndroidManifest.xml` / theme XMLs.
- Only asset files change — no TS/JS edits.
- Verify with `file`/`identify`, then AGENTS.md checklist for `@bukoo/mobile`.

---

### Task 1: SDD artifacts + task.md
- [x] **Step 1: Create spec** `docs/superpowers/specs/2026-08-20-mobile-icon-splash-swap-design.md` (approved in chat).
- [x] **Step 2: Create plan** `docs/superpowers/plans/2026-08-20-mobile-icon-splash-swap.md`.
- [x] **Step 3: Create ledger** `.superpowers/sdd/mobile-icon-splash-swap/progress.md`.
- [x] **Step 4: Add top-level entry to root `task.md`.**

### Task 2: Expo source assets (`apps/mobile/assets/`)
- [x] **Step 1: `icon.png`** ← `assets/bukoo-icon-rounded.png` resized to 1024×1024 (full-bleed).
- [x] **Step 2: `adaptive-icon.png`** ← `assets/bukoo-icon-rounded.png` scaled to 512×512, centered on 1024×1024 transparent canvas.
- [x] **Step 3: `splash-icon.png`** (new) ← copy of `assets/bukoo-logo-transparent.png`.

### Task 3: Native launcher icons (`res/mipmap-*`, lossless webp)
- [x] **Step 1: `ic_launcher.webp`** at 48/72/96/144/192 (mdpi→xxxhdpi).
- [x] **Step 2: `ic_launcher_round.webp`** at 48/72/96/144/192.
- [x] **Step 3: `ic_launcher_foreground.webp`** at 108/162/216/324/432 with content at 50% (54/81/108/162/216), transparent canvas.

### Task 4: Native splash logo (`res/drawable-*/splashscreen_logo.png`)
- [x] **Step 1: `splashscreen_logo.png`** ← `bukoo-logo-transparent.png` fit-to-height 288/432/576/864/1152, aspect preserved.

### Task 5: Verification
- [x] **Step 1:** `file`/`identify` all regenerated files (dims + format).
- [x] **Step 2:** `./gradlew assembleDebug` from `apps/mobile/android` — **BUILD SUCCESSFUL** (validates new resources compile); visual device check → manual QA.
- [x] **Step 3:** `npm run typecheck --workspace=@bukoo/mobile` ✅.
- [x] **Step 4:** `npm run lint --workspace=@bukoo/mobile` ✅.
- [x] **Step 5:** test — mobile has no test script (stub "No tests specified"); state explicitly.

### Task 6: Ledger + task.md close-out
- [x] **Step 1:** Update `.superpowers/sdd/mobile-icon-splash-swap/progress.md`.
- [x] **Step 2:** Check off `task.md` entry.
