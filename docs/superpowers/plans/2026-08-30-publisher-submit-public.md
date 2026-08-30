# Implementation Plan — Public "Submit Judul" Page

- **Date:** 2026-08-30
- **Workflow:** superpowers:subagent-driven-development
- **Spec:** `docs/superpowers/specs/2026-08-30-publisher-submit-public-design.md`
- **Workspace:** `apps/web` only
- **SDD ledger:** `.superpowers/sdd/publisher-submit-public/progress.md`

## Context

`/publisher/submit` exists (React port of `penerbit-submit.html`) but the middleware gate in
`apps/web/src/middleware.ts` (~lines 113–118) redirects non-`PUBLISHER` visitors to login. Fix =
remove gate + auth branch in page (copy `dashboard/page.tsx` showcase pattern) + CTA band for
anonymous visitors + one-line showcase link. Server action stays `getPublisherUser()`-guarded.

## Tasks

- [ ] Task 1: Remove the `/publisher/submit` middleware gate
  - File: `apps/web/src/middleware.ts`
  - Delete the block `// Protected publisher submit — require PUBLISHER role` through its
    closing brace. Keep the `/publisher/books` block above it byte-identical.
  - Verify: `npx tsc --noEmit` in apps/web still clean.

- [ ] Task 2: Auth branch + CTA band in submit page
  - File: `apps/web/src/app/publisher/submit/page.tsx`
  - Add `import Link from "next/link"`, `import { auth } from "@/lib/auth"`.
  - Add `export const dynamic = "force-dynamic"`; convert the default export to `async`,
    `const session = await auth()`, `const isPublisher = roleOf(session) === "PUBLISHER"`
    (role cast pattern from `dashboard/page.tsx`).
  - Add local `SubmitSignupBand()` server component using `.dash-cta` +
    `.dash-cta-btn` (`/publisher/register`) + `.btn-ghost btn-lg`
    (`/publisher/login?callbackUrl=/publisher/submit`), copy per spec.
  - Render `{isPublisher ? <SubmitForm /> : <SubmitSignupBand />}` in the Formulir section;
    all other sections unchanged.
  - Verify: typecheck/lint.

- [ ] Task 3: Showcase CTA link
  - File: `apps/web/src/app/publisher/dashboard/showcase.tsx`
  - Add `<Link href="/publisher/submit" className="btn-ghost btn-lg">Submit Judul</Link>`
    inside the existing CTA band flex row (after the Masuk link). `Link` already imported.

- [ ] Task 4: Verification
  - `npm run typecheck --workspace=apps/web` → pass
  - `npm run lint --workspace=apps/web` → pass
  - `npm run test --workspace=apps/web` → pass (note coverage status)
  - Manual checks per spec section "Verification plan" (dev server or preview URL).
  - Update root `task.md` + SDD ledger; commit.

## Risks / notes

- Role is baked into the JWT — testing the PUBLISHER view requires a real PUBLISHER login
  (demo: `demo-publisher@bukoo.id`).
- `callbackUrl` plain path passes `safeCallbackUrl()` — no helper change.
- No DB/API changes; expected zero impact on `/health` or CI beyond lint/typecheck/test.
