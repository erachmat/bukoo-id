# Design Spec — Public "Submit Judul" Page (un-gate /publisher/submit)

- **Date:** 2026-08-30
- **Workspace:** `apps/web` only
- **Status:** Approved ("Start implementation", 2026-08-30)

## Executive summary

Clicking **Submit Judul** anywhere on the site (`PublisherNav`, marketing footer,
`/penerbit-submit.html` alias, `/submit` short path) lands on `/publisher/submit` — but the
middleware role gate in `apps/web/src/middleware.ts` redirects anyone who is not a signed-in
`PUBLISHER` straight to `/publisher/login`, so prospects never see the rich "Submit Judul"
landing page.

The page itself already exists and is a full React port of the `penerbit-submit.html` prototype
(hero, Syarat Berkas grid, 4-step `SubmitForm` wizard routed to a `getPublisherUser()`-guarded
server action, Proses timeline). The gate is the only thing hiding it.

Fix: remove the `/publisher/submit` middleware block and mirror the proven
`/publisher/dashboard` pattern — signed-in `PUBLISHER` sees the real wizard; anonymous or
non-PUBLISHER visitors see the same page with the form section replaced by a "Masuk / Daftar
sebagai penerbit" CTA band (user decision: **Show page + CTA band**, no wizard preview).

## User decisions (2026-08-30)

1. Anonymous form UX → **page + CTA band** (form section shows Daftar/Masuk band instead of wizard).
2. `/publisher/books` middleware gate → **keep** (real catalog tooling stays protected).
3. Dashboard showcase CTA → **include** a "Submit Judul" link to the now-public page.

## Component specs

### `apps/web/src/middleware.ts` (modified)

Delete the entire block (~lines 113–118, including its comment):

```ts
// Protected publisher submit — require PUBLISHER role
if (pathname.startsWith("/publisher/submit")) { ... }
```

The adjacent `/publisher/books` block (lines ~106–112) is untouched. The HTML alias
`/penerbit-submit.html → /publisher/submit` (rewrite branch) and the publisher-host short-path
redirect `/submit → /publisher/submit` continue to work unchanged and become public automatically.

Defense in depth: the server action `submitPublisherSubmission`
(`apps/web/src/app/publisher/submit/actions.ts`) already throws for non-`PUBLISHER` users via
`getPublisherUser()` — no change needed there; anonymous users can never actually submit.

### `apps/web/src/app/publisher/submit/page.tsx` (modified — main change)

Copy the auth-branch pattern from `apps/web/src/app/publisher/dashboard/page.tsx`:

```tsx
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PublisherSubmitPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const isPublisher = userRole === "PUBLISHER";
  // ...
  {isPublisher ? <SubmitForm /> : <SubmitSignupBand />}
}
```

- `force-dynamic` + `auth()` are required so the branch is request-scoped (static caching would
  serve one variant to everyone).
- Hero, Syarat Berkas grid (`.req`), DRM `.disc` note, and the Proses timeline (`.proc`) render
  identically for both variants — the pièces are marketing content, safe to show publicly.
- New inline server component `SubmitSignupBand` in the same file, reusing existing
  `publisher.css` classes (pattern lifted from `dashboard/showcase.tsx` CTA band):

```tsx
function SubmitSignupBand() {
  return (
    <div className="dash-cta">
      <h3>Siap mengajukan judul pertama Anda?</h3>
      <p>Daftar sebagai penerbit mitra BUKOO atau masuk ke akun penerbit Anda untuk membuka formulir pengajuan 4 langkah.</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
        <Link href="/publisher/register" className="dash-cta-btn">Daftar sebagai penerbit &rarr;</Link>
        <Link href="/publisher/login?callbackUrl=/publisher/submit" className="btn-ghost btn-lg">Masuk</Link>
      </div>
    </div>
  );
}
```

- `callbackUrl=/publisher/submit` is a plain path — passes `safeCallbackUrl()` sanitization in
  `src/lib/auth-helpers.ts`; after publisher login the user lands directly on the wizard.
- Metadata export unchanged. No new CSS expected (`dash-cta`, `dash-cta-btn`, `btn-ghost btn-lg`
  all exist in `publisher.css`).

### `apps/web/src/app/publisher/dashboard/showcase.tsx` (modified — one line)

Add a third CTA link to the existing CTA band (after "Masuk ke Dashboard"):

```tsx
<Link href="/publisher/submit" className="btn-ghost btn-lg">Submit Judul</Link>
```

## Layout / styling tokens

No new CSS. Reuse the publisher design system already imported by
`apps/web/src/app/publisher/layout.tsx` → `publisher.css` (tokens `--forest #1E4035`,
`--forest-dd #0A1A15`, `--amber #C9952A`, `--teal #00C9A7`; Playfair Display + Plus Jakarta Sans
via the file's `@import`). The CTA band uses `.dash-cta` exactly as the dashboard showcase does.

## Security review

- Middleware gate removal only affects **visibility** of a marketing page.
- Actual submission path stays double-protected: the page only renders `<SubmitForm />` for
  `PUBLISHER` (JWT role), and the server action re-checks via `getPublisherUser()`.
- No D1/R2/API surface changes; anonymous users cannot write anything.

## Out of scope

`/publisher/books` gate changes, `apps/api`, DB migrations, anonymous submission drafts, mobile.

## Verification plan

1. `npm run typecheck --workspace=apps/web` — pass.
2. `npm run lint --workspace=apps/web` — pass.
3. `npm run test --workspace=apps/web` — pass (web has vitest: `dashboard/metrics.test.ts`; coverage status noted explicitly in ledger).
4. Manual:
   - Logged out: `/publisher/submit`, `/penerbit-submit.html` alias, and publisher-host `/submit`
     short path render the full page + CTA band (no login redirect).
   - Signed-in PUBLISHER: same URL renders the 4-step wizard and a real submission still succeeds.
   - Signed out: `/publisher/books` still redirects to login (gate preserved).
   - Login via the band's ghost button returns to `/publisher/submit` (callbackUrl).
   - Dashboard showcase (`/publisher/dashboard` logged out) shows the new Submit Judul CTA.
