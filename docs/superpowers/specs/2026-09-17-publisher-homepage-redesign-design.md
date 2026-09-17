# Design Spec — Publisher Homepage Redesign (publisher.bukoo.id)

- **Date:** 2026-09-17
- **Task slug:** `publisher-homepage-redesign`
- **Reference design:** `new-homepage-assets/publisher-bukoo-id.jpg`
- **Hero asset:** `new-homepage-assets/publisher-hero.png` (5120×2048, RGBA)
- **Scope:** the **public landing page** at `publisher.bukoo.id/` → `/publisher/daftar` only.

## 1. Executive summary

The publisher homepage is the top-of-funnel page for prospective partner publishers. The
current page already carries the right *content* (fear-reversal narrative, flywheel, three
value streams, lead form) but its composition predates the newer publisher dashboard visual
language. This change rebuilds the page's **visual composition** to match the supplied
reference while preserving every behavioural contract.

Explicitly preserved (no functional change):

- All Indonesian marketing copy and section intent.
- `DaftarForm` + `submitPublisherLead` server action, including pending/error/success states.
- `LogoutMarkerCleanup` (`?logout=1` marker handling).
- `PublisherNav` link destinations and the publisher-host/auth routing in `middleware.ts`.
- Every other publisher route (`/publisher/dashboard`, `/login`, `/register`, `/submit`,
  `/royalti`, `/panduan`, `/(protected)/*`).

### Explicit exclusions

Dashboard tabs, login/register, submit, royalty calculator, guide page, admin, database
schema, API routes, new npm dependencies, and any change to `--pds-*` dashboard tokens.

## 2. Reference → section inventory

The reference is a single tall marketing page. Mapping reference sections to the existing
page (content preserved, composition restyled):

| # | Reference section | Existing page section | Action |
|---|---|---|---|
| 1 | Fixed top nav: logo, links, orange "Masuk" + amber "Daftar sebagai penerbit" | `<PublisherNav currentTab="daftar">` | Keep component; restyle shell (two-button treatment) |
| 2 | Full-bleed photo hero, copy on dark left column, **one** CTA | `.phero` + `.phero-photo` + `.phero-scrim`, `.eyebrow`, `.ph-h1`, `.ph-lead`, `.pub-hero-ctas` | Swap asset, soften scrim, single primary CTA |
| 3 | **Cream** intro statement band | *(new — no equivalent)* | Add a light band between hero and flip section |
| 4 | Dark band: centred eyebrow + "Digital dan fisik bukan lawan." | `.flip` section head | Restyle header |
| 5 | Two-card contrast block (concern ⇄ reality), arrow connector | `.flip` / `.flip-fear` / `.flip-arr` / `.flip-truth` | Restyle: outlined cards, amber arrow |
| 6 | Dark band: "Bagaimana satu langganan digital menghasilkan penjualan fisik" + 4 outlined step cards with amber icon marks | `.fw` / `.fw-s` / `.fw-n` | Restyle: amber-outlined cards, icon slot, no auto-number text |
| 7 | **Cream** band: "Tiga aliran nilai baru, di luar penjualan fisik" + 3 dark-green cards with coloured top bar, numbered `1./2./3.` titles, icon, ✦ bullets | `.vs` / `.vs-c.a|b|c` / `.vs-ico` / `.vs-k` | Restyle to inverted cards + numbered titles |
| 8 | Dark band: left "Mulai jadi Mitra Kami" column + elevated form card (2-col rows, right-aligned submit) | `.form-wrap` / `.form-side` / `.form-check` / `.disc` + `<DaftarForm>` | Restyle both columns; **form markup/behaviour untouched** |

### 2.1 Metric strip decision

The current page renders a 4-up metric strip (`.dp-metrics`) inside the hero. The reference
puts **no metrics in the hero** and keeps the hero short. Per the "preserve content"
decision, the strip is **retained but not in the hero**: the four metrics move into the new
cream intro band as supporting evidence beneath the centred statement, restyled for a light
background. This keeps the numbers on the page (they are load-bearing credibility content)
while matching the reference's shorter hero.

## 3. Visual direction & tokens

**Key change vs. the current page:** the reference alternates **light (cream) and dark
(green)** full-width bands, instead of the current all-dark treatment. Reference band order:

1. Hero — dark photographic (full-bleed image, copy on the dark left column)
2. Intro statement — **cream** (`--cream` #FAF7F2), centred display headline + short lead
3. "Mengapa Bergabung?" flip section — dark green (`--forest-d`)
4. "Mesin penemuan" flywheel — dark green, 4 cards with **amber outline** styling
5. "Tiga aliran nilai baru" — **cream**, 3 cards with dark-green fill + coloured top accent
6. Registration form — dark green, left copy column + right elevated form card
7. Footer — near-black (`--forest-dd`)

Reuse existing landing tokens from `apps/web/src/app/publisher/publisher.css` — no new
palette. Fonts already imported: `Playfair Display` (display), `Plus Jakarta Sans` (body),
`JetBrains Mono` (labels/numbers).

- Backgrounds: `--forest-dd` (#0A1A15) footer/hero base, `--forest-d` (#122A22) dark bands,
  `--cream` (#FAF7F2) light bands.
- Accent: `--amber` (#C9952A) for eyebrows, display italics, primary CTA, card accent bars;
  `--teal` and `--coral` for the secondary/tertiary value-card top bars.
- On **dark** bands: surfaces `rgba(255,255,255,0.04)` with `1px` borders at
  `rgba(201,149,42,0.12–0.3)`, radius `14–16px`; text `#F0EDE6` / `rgba(240,237,230,0.65+)`.
- On **light** bands: cards are dark-green (`--forest`) with cream text — the reference
  inverts the card rather than the text. Headings are `--forest`/`--text`, body `--text-mid`.

### Section eyebrow labels

The reference uses a plain centred amber label (no leading rule) on light bands, and the
existing `.eyebrow::before` rule (26px amber line) on dark bands. Keep `.eyebrow` for dark
bands and add a modifier for the centred/light variant.

Rules:

- Add only landing-scoped classes/tokens. **Never** modify `.pub-dashboard-shell` or `--pds-*`.
- Prefer adjusting existing `.phero*`, `.flip*`, `.fw*`, `.vs*`, `.form-*` rules over
  introducing parallel class names; add a new class only when the reference needs a
  structure the current markup cannot express.

## 4. Hero specification

- **Asset:** copy `new-homepage-assets/publisher-hero.png` → `apps/web/public/publisher-assets/publisher-hero.png`.
  Keep the existing `.jpg`/`@1280.jpg` files in place so nothing else that references them breaks.
- **Markup:** single `<img>` with `srcSet` at two widths (1280w + native), `sizes="100vw"`,
  `alt=""` (decorative — the headline carries the meaning), `fetchPriority="high"`,
  `decoding="async"`. Must stay a plain `<img>`: the file is served from `public/` and the
  worker SSR path must not take a `next/image` optimizer dependency.
- **Crop:** 2.5:1 source. `object-fit: cover; object-position: left center` so the dark left
  column stays under the copy. Mobile crops toward the centre, so the scrim must carry
  legibility at narrow widths.
- **Scrim:** two layered linear gradients — horizontal dark→transparent for copy contrast,
  vertical bottom fade so the metric strip reads as a distinct band.
- **Legibility floor:** the lead paragraph must keep ≥ 4.5:1 contrast against the darkest
  pixel *behind that text* at 360px width. If the new asset is brighter than the current one
  under the copy area, raise scrim opacity rather than shrinking text.

## 5. Responsive behaviour

Existing breakpoints are reused (`900px`, `600px`); no new breakpoints.

- **Desktop (≥ 1100px):** 4-column metric strip, 3-column flow/value grids, hero copy in the
  left ~55% of the viewport, `1180px` max content width (`.pub-wrap`).
- **Tablet (900–1100px):** metric strip 2×2 with the existing alternating right-border rule;
  value grid and form layout stack; flow grid 2 columns with connectors suppressed.
- **Mobile (< 900px):** all grids single-column; `.flip-arr` chevron rotates 90°.
- **Mobile (< 600px):** nav links hidden/condensed per existing rules, hero padding reduced,
  CTA buttons full-width, metric strip single column.
- **Hard requirement:** no horizontal overflow at 360px, 768px, 1280px, 1920px.

## 6. Accessibility

- Preserve semantic structure: one `<h1>` (hero), `<h2>` per section, `<h3>` per card.
- Decorative hero image stays `alt=""`; if the design later makes it meaningful, it needs a
  real description — not an empty string.
- All interactive elements keep visible focus. Inputs currently only change `border-color`
  on focus; add a visible `outline`/`box-shadow` ring so keyboard focus is unambiguous.
- Colour is never the only signal: link active state also changes weight/background.
- Form labels stay bound to controls (`label` + `input` adjacency preserved).
- Contrast: amber `#C9952A` on `--forest-dd` is ~5.6:1 → acceptable for large/display text and
  borders; body copy uses the lighter `rgba(240,237,230,0.65+)` range which exceeds 4.5:1.

## 7. Verification plan

1. `npm run typecheck --workspace=apps/web`
2. `npm run lint --workspace=apps/web`
3. `npm run test --workspace=apps/web`
4. Local `wrangler dev` (or `next dev`) → screenshot `/publisher/daftar` at 360 / 768 / 1280 /
   1920 px, compare composition against the reference, confirm hero asset is the PNG.
5. Confirm `#nilai` and `#daftar` anchors scroll correctly and the nav CTA reaches the form.
6. Submit the lead form locally; verify pending → success, and that a server error still
   renders the `role="alert"` message.
7. Regression spot-check `/publisher/dashboard`, `/publisher/login`, `/publisher/panduan` for
   unintended style leakage (they share `publisher.css`).
8. Confirm no horizontal scrollbar at each width.

## 8. Risks

- **Shared stylesheet:** `publisher.css` also serves nav/dashboard/royalty/guide. Restyling
  `.form-*`, `.pub-fg*`, `.btn-cta`, and `.pub-nav*` can leak into other pages. Mitigation:
  scope edits to landing classes, and spot-check the pages listed in step 7.
- **Large hero asset (5120×2048):** ~ a few MB as PNG. Serving it at 1280w via `srcSet`
  mitigates. If transfer size is unacceptable, optimize/convert **only** if crop and quality
  stay faithful to the reference.
- **Reference is a flat image:** exact spacing must be resolved by screenshot comparison, not
  guessed from the pixel values.

## 9. Out of scope / follow-ups

- Optimizing the hero PNG to a smaller format (needs a design decision on fidelity).
- Any change to `/publisher/dashboard` showcase or authenticated dashboard.
- Rewriting the marketing copy to the reference's wording (user chose to preserve copy).
