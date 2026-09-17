# SDD Ledger — publisher-homepage-redesign

- Plan: `docs/superpowers/plans/2026-09-17-publisher-homepage-redesign.md`
- Spec: `docs/superpowers/specs/2026-09-17-publisher-homepage-redesign-design.md`
- Approved: 2026-09-17 ("Start implementation")

## Task status

| Task | Status | Notes |
|---|---|---|
| 1. Copy hero asset | complete | Source 9.7MB PNG was too heavy to ship; generated `publisher-hero.jpg` (2560×1024, 167KB) + `publisher-hero@1280.jpg` (1280×512, 55KB) via ImageMagick, replacing the old photos. Oversized PNG removed from `public/`. |
| 2. Hero markup | complete | Existing `<img>` already pointed at the reused filenames, so the asset swap needed **no** markup change. Hero simplified to a single primary CTA; eyebrow/headline/lead preserved. |
| 3. Landing CSS restyle | complete | Cream (`--cream`) / dark (`--forest-d`, `--forest-dd`) alternating bands added to match the reference. Flip cards outlined, flywheel cards amber-outlined with inline SVG icons (replacing `01 · JELAJAH` text labels), value cards inverted to dark-green with coloured top bars and numbered titles, form wrapped in an elevated card. Focus-visible rings added for form controls and buttons. |
| 4. Responsive pass | complete | Breakpoints at 1250/900/600px. Verified via computed styles: 1440px → 4-col flywheel; 820px → 2-col flywheel, stacked form, 2-col metrics; 390px → single column. No horizontal overflow at any width. Also fixed a fixed-nav overlap on `#daftar` anchors via `scroll-padding-top` and `scroll-behavior: smooth`, and prevented nav link wrapping. |
| 5. Verification | complete | See below. |
| 6. Docs + ledger | complete | `task.md` updated. |
