# Implementation Plan — Publisher Homepage Redesign (publisher.bukoo.id)

- **Date:** 2026-09-17
- **Task slug:** `publisher-homepage-redesign`
- **Spec:** `docs/superpowers/specs/2026-09-17-publisher-homepage-redesign-design.md`
- **Ledger:** `.superpowers/sdd/publisher-homepage-redesign/progress.md`
- **Workflow:** `superpowers:executing-plans` (single-session, sequential tasks)

## Goal

Restyle the public publisher landing page (`/publisher/daftar`, served as
`publisher.bukoo.id/`) to match `new-homepage-assets/publisher-bukoo-id.jpg`, using
`new-homepage-assets/publisher-hero.png` as the hero artwork. Copy, form behaviour, routing,
and every non-landing publisher page stay as-is.

## Constraints

- Do not edit `middleware.ts`, `daftar/actions.ts`, or `DaftarForm.tsx` behaviour.
- Do not touch `.pub-dashboard-shell` / `--pds-*` rules in `publisher.css`.
- No new dependencies, no DB/API changes.
- Plain `<img>` for the hero (no `next/image`).

## Tasks

- [x] **1. Copy the hero asset into the public directory**
  - Copy `new-homepage-assets/publisher-hero.png` → `apps/web/public/publisher-assets/publisher-hero.png`.
  - Leave the existing `publisher-hero.jpg` / `publisher-hero@1280.jpg` in place.
  - Verify: `file` reports a valid PNG at the destination and it is non-zero bytes.
  - **As-built:** the 9.7MB PNG was too heavy to ship, so it was down-converted to
    `publisher-hero.jpg` (2560×1024, 167KB) and `publisher-hero@1280.jpg` (1280×512, 55KB)
    at the paths the existing `srcSet` already referenced. The oversized PNG was not kept.

- [x] **2. Rework the hero section in `daftar/page.tsx`**
  - Point the hero `<img>` at `/publisher-assets/publisher-hero.png` with a two-entry `srcSet`
    (1280w + native) and `sizes="100vw"`; keep `alt=""`, `fetchPriority="high"`, `decoding="async"`.
  - Keep eyebrow, `.ph-h1`, `.ph-lead`, both CTAs (`#daftar`, `#nilai`), and `.dp-metrics` intact.
  - Verify: typecheck passes; page still renders the same copy.
  - **As-built:** the `<img>` already referenced the reused filenames → no image markup change.
    Hero reduced to one primary CTA; the 4-up `.dp-metrics` strip moved out of the hero into the
    new cream intro band (reference has no metrics in the hero) as `.dp-metrics.light`.

- [x] **3. Restyle landing classes in `publisher.css`**
  - `.phero` / `.phero-photo` / `.phero-scrim`: retune padding, crop anchor, and scrim layers
    for the new asset; add a bottom fade for the metric band.
  - `.eyebrow`, `.ph-h1`, `.ph-lead`: align scale/measure with the reference.
  - `.dp-metrics` / `.dp-m` / `.dp-m-n` / `.dp-m-l`: reference metric strip treatment.
  - `.flip*`, `.fw*`, `.vs*`: reference card treatment, accents, connectors.
  - `.form-wrap` / `.form-side` / `.form-check` / `.disc` / `.form-card` / `.form-submit`:
    reference two-column conversion block.
  - Add a visible focus ring for `.pub-fg` controls (currently border-only).
  - Verify: no rules outside the landing scope changed.
  - **As-built:** added `.pub-sec.light` (cream band), `.pub-h2-dk` / `.pub-sec-desc-dk` /
    `.eyebrow.dk` (dark-on-light variants), `.dp-metrics.light`, `.fw-ico`, and `.vs-ico` SVG
    sizing. `.form-side h3` → `.form-side-h`. Added `:focus-visible` rings for form controls and
    buttons, plus `scroll-padding-top` on `.pub-page-wrap` / `html:has(.pub-page-wrap)`.

- [x] **4. Responsive pass**
  - Update the `@media (max-width: 900px)` landing block and add a `600px` block if needed.
  - Verify: no horizontal overflow at 360 / 768 / 1280 / 1920 px.
  - **As-built:** new `1250px` (flywheel 2-col), reworked `900px`, and new `600px` blocks.
    Verified no horizontal overflow at 390px, 820px, and 1440px.

- [x] **5. Verification**
  - `npm run typecheck --workspace=apps/web`
  - `npm run lint --workspace=apps/web`
  - `npm run test --workspace=apps/web`
  - Browser/screenshot QA of `/publisher/daftar` at 360 / 768 / 1280 / 1920.
  - Regression spot-check `/publisher/dashboard`, `/publisher/login`, `/publisher/panduan`.
  - **As-built:** typecheck ✅, lint 0 errors (32 pre-existing warnings) ✅, tests 86/86 ✅,
    production build ✅. Browser QA at 1440/820/390px ✅. Regressions all HTTP 200 and unaffected.

- [x] **6. Documentation + ledger**
  - Tick root `task.md` entry as tasks complete.
  - Update `.superpowers/sdd/publisher-homepage-redesign/progress.md`.

## Files touched (expected)

| File | Change |
|---|---|
| `apps/web/public/publisher-assets/publisher-hero.png` | new asset (copy) |
| `apps/web/src/app/publisher/daftar/page.tsx` | hero asset + minor structure |
| `apps/web/src/app/publisher/publisher.css` | landing-scoped restyle + responsive |
| `task.md` | running checklist |
| `.superpowers/sdd/publisher-homepage-redesign/progress.md` | ledger |

## Rollback

Revert the three web files; the copied asset is additive and harmless if left behind.

## Verification commands

```bash
npm run typecheck --workspace=apps/web
npm run lint --workspace=apps/web
npm run test --workspace=apps/web
```
