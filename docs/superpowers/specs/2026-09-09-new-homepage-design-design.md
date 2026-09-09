# New Bukoo Homepage Design Spec

## Executive summary

Replace the current marketing homepage at `/` with the supplied Bukoo redesign. The new page will use the provided local assets for the hero, Assistant, community, and feature visuals, while preserving authentication, navigation, registration CTAs, publisher links, and the existing discovery-only product positioning.

## Page composition

1. Fixed marketing navbar with existing session-aware actions.
2. Hero over `hero01.png`: Indonesian reading proposition, email registration CTA, trust details, and a dark gradient for text contrast.
3. Feature/value strip using the supplied icon assets.
4. Product section featuring the supplied Assistant composition (`Group01.png`).
5. Community section featuring the supplied community composition (`Group02.png`).
6. Application/product proof section using `Group03.png` and supporting copy.
7. Pricing section retaining functional plan CTAs and the current pricing content, restyled to the new visual language.
8. Accessible FAQ accordion.
9. Final email CTA.
10. Existing legal/product/publisher footer, restyled to match the page.

## Visual system

- Deep forest background with warm cream surfaces and Bukoo gold accents.
- Serif display headings paired with a clean sans-serif body font.
- Rounded cards, thin muted-green borders, soft shadows, and generous vertical spacing.
- Gold primary actions; outlined or cream secondary actions.
- Wide hero image uses `object-fit: cover` with the focal point toward the right side; a left-to-right dark overlay keeps copy readable.
- Transparent supplied compositions are rendered without additional background boxes and scale down on mobile.

## Assets

Assets are supplied in `/new-homepage-assets` and copied to `apps/web/public/homepage-assets/`:

- `hero01.png`: hero background.
- `Group01.png`: Bukoo Assistant visual.
- `Group02.png`: community visual.
- `Group03.png`: application/product visual.
- `book-open-01.png`, `cafe.png`, `elements.png`, `elements01.png`, `elements02.png`, `elements03.png`: feature icons/decorative illustrations.

Content images receive meaningful alt text. Decorative icons use empty alt text and are hidden from assistive technology when adjacent copy communicates the same information.

## Behavior and accessibility

- Email forms preserve the existing redirect to `/register?email=<encoded-email>`.
- Existing navbar session states and mobile drawer remain functional.
- FAQ uses buttons with `aria-expanded` and stable panel IDs.
- All interactive controls have visible keyboard focus states.
- Responsive layouts target phone, tablet, and desktop widths with no horizontal overflow.
- No database schema, API, mobile, or deployment changes are included.

## Verification plan

- `npm run typecheck --workspace=@bukoo/web`
- `npm run lint --workspace=@bukoo/web`
- `npm run test --workspace=@bukoo/web`
- `npm run build --workspace=@bukoo/web`
- Browser QA for logged-out and authenticated navbar states, both email CTAs, FAQ interaction, mobile drawer, asset loading, responsive crops, and horizontal overflow.
