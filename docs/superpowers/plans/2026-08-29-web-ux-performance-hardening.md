# Implementation Plan — Bukoo Web: Mobile-Only Reading, Bug Fixes, UX & Performance

Workflow: `superpowers:subagent-driven-development`
Spec: `docs/superpowers/specs/2026-08-29-web-ux-performance-hardening-design.md`
Scope: `apps/web` only (plus repo-root gitignore). No D1 migrations expected.

## Phase 1 — Bug fixes + cleanup

- [x] 1.1 Book detail real ratings: replace hardcoded 4.8 / fake ulasan with `ratingAverage`/`ratingCount`; hide row when count 0 (`src/app/(app)/book/[id]/page.tsx`)
- [x] 1.2 Remove `console.error` leftovers in `(auth)/actions.ts`, both `book-form.tsx`, `SubmitForm.tsx` (reader files deleted in Phase 2 instead)
- [x] 1.3 Delete `apps/web/et -a`, `update_mobile_css.py`, `redesign-homepage.html`, `bukoo-publisher-dashboard.html`
- [x] 1.4 Untrack DB dumps: `.gitignore` + `git rm --cached` for `production-full-backup.dump`, `user-table-backup.dump` (keep local files)
- [x] 1.5 Verify-then-delete dead code: `book-card.tsx`, `header-search.tsx`, `ComparisonTable.tsx`, `mockBooks` array (keep type if used)
- [x] 1.6 Verify: typecheck + lint + test `apps/web`

## Phase 2 — Mobile-only reading (delete web reader)

- [x] 2.1 Grep to confirm consumers; delete `src/components/reader/` (reader-shell, epub-viewer, pdf-viewer)
- [x] 2.2 Delete route `src/app/(app)/book/[id]/read/`
- [x] 2.3 Delete `src/app/api/books/[id]/download.epub/route.ts`
- [x] 2.4 Delete `updateReadingProgress` from `src/app/(app)/book/actions.ts` (file may become empty → delete if so)
- [x] 2.5 Delete `resume-reading.tsx` + its use in `library/page.tsx`
- [x] 2.6 Middleware: rewrite `/book/:id/read` → `/book/:id`
- [x] 2.7 Create `src/lib/app-links.ts` (placeholder store URLs) + `src/components/app/app-download-cta.tsx` (inline + strip variants, inline SVG badges)
- [x] 2.8 Book detail: replace reader Link with `AppDownloadCta`; remove dead Bookmark/Share buttons; add "Lanjutkan di aplikasi" card when mobile-written progress exists
- [x] 2.9 Catalog card: "Baca Sekarang" → "Lihat Detail"
- [x] 2.10 Remove `react-reader`, `react-pdf`, `pdfjs-dist`, `epubjs` from `apps/web/package.json` (verify actual list) + `npm install`
- [x] 2.11 Verify: typecheck + lint + test; manual QA plan (read route redirects, CTA renders)

## Phase 3 — Web→app funnel + UX + perf

- [x] 3.1 Marketing copy sweep: `Features.tsx`, `perangkat/page.tsx`, `FAQ.tsx`, `login-form.tsx`, `Hero.tsx`, `CallToAction.tsx` → mobile-app-only framing + badges
- [x] 3.2 App download strip on library page + account page (`AppDownloadCta` variant `strip`)
- [x] 3.3 `loading.tsx` skeletons: `(app)/library`, `publisher/(protected)/books`, `admin`
- [x] 3.4 `SessionProvider` `refetchOnWindowFocus` → false
- [x] 3.5 `covers/[...key]/route.ts`: 404 keys outside `covers/` prefix
- [x] 3.6 Landing: `<Suspense>` around `<FeaturedBooks />`; document root-layout `auth()` findings in ledger
- [x] 3.7 Dark mode: `ThemeProvider` + toggle in `(app)` header + marketing Navbar (localStorage `bukoo-theme`); publisher host untouched
- [x] 3.8 Verify: typecheck + lint + test

## Phase 4 — Tests + hardening

- [x] 4.1 Vitest: `app-links.ts`, `subscription.ts` tier logic, `rate-limit.ts` policies, `otp.ts`
- [x] 4.2 Full AGENTS.md checklist on every touched workspace; state test gaps explicitly
- [ ] 4.3 Update root `task.md` + SDD ledger; note preview-deploy QA steps for user

## Snippets

Middleware rewrite (insert before role-redirect block):
```ts
const readMatch = pathname.match(/^\/book\/([^/]+)\/read\/?$/)
if (readMatch) {
  return NextResponse.rewrite(new URL(`/book/${readMatch[1]}`, req.url))
}
```

Covers guard:
```ts
const key = (await params).key.join("/")
if (!key.startsWith("covers/")) return new Response(null, { status: 404 })
```

Progress card query (book detail):
```ts
const [progress] = await db.select().from(readingProgress)
  .where(and(eq(readingProgress.userId, session.user.id), eq(readingProgress.bookId, id)))
  .limit(1)
```
