# SDD Ledger — web-ux-performance-hardening

Spec: docs/superpowers/specs/2026-08-29-web-ux-performance-hardening-design.md
Plan: docs/superpowers/plans/2026-08-29-web-ux-performance-hardening.md

- Phase 0: complete (spec + plan + ledger + task.md entry)
- Task 1 (Phase 1 — bugs + cleanup): complete
  - Real ratings on book detail (hide row when ratingCount = 0): `book-mapper.ts` + `book/[id]/page.tsx`
  - console.error removed from `admin/book-form.tsx`, `publisher/book-form.tsx`, `SubmitForm.tsx` (epub/pdf viewer sites deleted with the reader)
  - Junk deleted: `et -a`, `update_mobile_css.py`, `redesign-homepage.html`, `bukoo-publisher-dashboard.html`
  - DB dumps: already gitignored + never tracked (no action needed)
  - Dead code: only `ComparisonTable.tsx` still existed → deleted. `book-card.tsx`, `header-search.tsx`, `mock-books.ts` were already absent from the tree.
- Task 2 (Phase 2 — mobile-only reading): complete
  - Deleted: `components/reader/` (3 files), `(app)/book/[id]/read/`, `api/books/[id]/download.epub/`, `(app)/book/actions.ts` (updateReadingProgress), `catalog/resume-reading.tsx`
  - Middleware: `/book/:id/read` → `/book/:id` redirect (before auth checks — stale links work logged-out)
  - New: `lib/app-links.ts` (placeholder store URLs), `components/app/app-download-cta.tsx` (inline/strip variants, inline SVG badges)
  - Book detail: AppDownloadCta replaces reader link; dead Bookmark/Share removed; "Lanjutkan di aplikasi" card shows mobile-written progress + `bukoo://book/:id` deep link
  - Catalog card: "Baca Sekarang" → "Lihat Detail"
  - Deps removed: `react-reader`, `react-pdf` (no `epubjs`/`pdfjs-dist` direct deps existed); lockfile synced
  - Note: `.next/types` stale validator broke typecheck once after route deletion → cleared, then clean
- Task 3 (Phase 3 — funnel + UX + perf): complete
  - Copy sweep: Features ("Baca di Aplikasi BUKOO"), perangkat (hero + removed Web card), FAQ (app-only), login-form subtitle, Hero/CTA subtitles
  - AppDownloadCta strip added to library + account pages
  - loading.tsx skeletons: `(app)/library`, `publisher/(protected)/books`, `admin`
  - `refetchOnWindowFocus` → false; covers route restricted to `covers/` prefix; landing FeaturedBooks wrapped in Suspense
  - Dark mode: hand-rolled ThemeProvider + ThemeToggle in (app) header; `bukoo-theme` localStorage; follows prefers-color-scheme when unset; publisher host untouched
  - Root layout `auth()` finding: it feeds SessionProvider session for the whole app; removing it would break session propagation cheaply — left as-is (documented, not changed)
  - Fix during task: duplicate `objectKey` decl in covers route; react-hooks lint error on setState-in-effect → refactored to subscribe pattern
- Task 4 (Phase 4 — tests + hardening): complete
  - New tests: `app-links.test.ts` (3), `subscription.test.ts` (8), `otp.test.ts` (5), `rate-limit.test.ts` (7)
  - vitest.config.ts: added `@` → src alias (rate-limit.ts imports `@/lib/db` at module level)
  - Final: typecheck ✅ · lint 0 errors (29 pre-existing warnings) ✅ · tests 60/60 ✅ · `next build` ✅ with no reader routes in output
  - Test gaps stated: no component/render tests (no RTL/jsdom), no middleware integration tests, server actions untested
- Verification summary (apps/web — only touched workspace; packages/db, apps/api, mobile untouched):
  - `npm run typecheck --workspace=apps/web` ✅
  - `npm run lint --workspace=apps/web` ✅ (0 errors)
  - `npm run test --workspace=apps/web` ✅ 60/60 (was 37 — 23 new)
  - `npm run build --workspace=apps/web` ✅
- Remaining (user): replace placeholder URLs in `src/lib/app-links.ts` with real App Store / Play Store links; preview-deploy QA; D1 migrations: none needed.
