# Design Spec — Bukoo Web: Mobile-Only Reading, Bug Fixes, UX & Performance

Date: 2026-08-29
Status: Approved (user confirmed priorities & mobile-only reading strategy)
Workflow: `superpowers:subagent-driven-development`
Plan: `docs/superpowers/plans/2026-08-29-web-ux-performance-hardening.md`

## Executive Summary

Bukoo's web presence (bukoo.id + publisher.bukoo.id, `apps/web` on Cloudflare Workers) gets a four-phase improvement:

1. **Bug fixes + cleanup** — real ratings instead of hardcoded 4.8, console.error hygiene, junk-file removal, dead-code removal.
2. **Mobile-only reading (core strategy change)** — remove the web reader entirely; the web becomes browse/discovery (Netflix model) with "Baca di Aplikasi" CTAs. Reading happens only in the mobile app.
3. **Web→app funnel + UX** — "Lanjutkan di aplikasi" card driven by mobile-written reading progress, dark mode toggle, loading skeletons, perf fixes.
4. **Tests + hardening** — vitest coverage for pure libs, dependency removal, full verification.

**Out of scope**: `apps/api`, mobile app code, payments/checkout, the 3-CSS-systems refactor, FTS triggers, publisher.css redesign.

## Component Specs

### S1 — Book detail real ratings
**File**: `apps/web/src/app/(app)/book/[id]/page.tsx`
- Replace hardcoded `4.8` with `book.ratingAverage`, and fabricated `(x.xk ulasan)` (derived from readCount) with `book.ratingCount`.
- **Hide the rating row entirely when `ratingCount === 0`** (do not show "0 ulasan" or "no ratings" — just omit).
- Data source: existing `bookRowToCatalogBook` mapping (`src/lib/data/book-mapper.ts`); no schema change.

### S2 — Console.error hygiene
Remove or convert to silent-handling the 8 leftover `console.error` sites:
- `src/app/(auth)/actions.ts` (~line 302)
- `src/app/admin/_components/book-form.tsx` + `src/app/publisher/(protected)/books/book-form.tsx`
- `src/app/publisher/submit/SubmitForm.tsx` (~line 52)
- `src/components/reader/epub-viewer.tsx` (3 sites) — **moot if Phase 2 deletes the file first; order phases so reader deletion happens before touching these**
- `src/components/reader/pdf-viewer.tsx` — same

Rule: replace `console.error(e)` with user-visible error state where one exists; otherwise drop the log (client catch-and-ignore is acceptable for non-critical paths like progress sync).

### S3 — Repo/app cleanup
- Delete: `apps/web/et -a` (shell artifact), `apps/web/update_mobile_css.py`, `apps/web/redesign-homepage.html`, `apps/web/bukoo-publisher-dashboard.html`.
- Untrack (add to `.gitignore`, `git rm --cached`, do NOT delete local files): repo-root `production-full-backup.dump`, `user-table-backup.dump`.
- Verify-then-delete dead code: `src/components/catalog/book-card.tsx`, `src/components/layout/header-search.tsx`, `src/components/marketing/ComparisonTable.tsx`, `mockBooks` array in `src/lib/data/mock-books.ts` (keep `MockBook` type if referenced).

### S4 — Web reader removal (mobile-only reading)

Deleted (after verifying no remaining importers):
- Route: `src/app/(app)/book/[id]/read/` (page.tsx)
- Components: `src/components/reader/` (reader-shell.tsx, epub-viewer.tsx, pdf-viewer.tsx)
- API route: `src/app/api/books/[id]/download.epub/route.ts`
- Server action `updateReadingProgress` in `src/app/(app)/book/actions.ts` (only known callers are the reader components)
- Component `src/components/catalog/resume-reading.tsx` + its use in `library/page.tsx` (web progress no longer exists)
- Deps from `apps/web/package.json`: `react-reader`, `epubjs` (transitive), `react-pdf`, `pdfjs-dist` (verify actual dep list before removal)

Kept / unchanged:
- D1 tables `reading_progress`, `bookmarks`, `highlights` (mobile + API write them) — **no migration**.
- `apps/api` `/v1/books/:id/download` — mobile EPUB streaming unaffected.
- Publisher analytics — fed by mobile via `recordPublisherReadingMetric`, unaffected.
- Subscription gating logic (`canReadBook`, `isBookAccessible`) — still used for CTA display.

Replacements:
- **Book detail CTA** (`book/[id]/page.tsx`): reader `Link` → `AppDownloadCta` component ("Baca di Aplikasi" + store badges). `canRead` false still shows "Khusus Premium" subscribe prompt.
- **Catalog card** (`book-catalog-card.tsx`): "Baca Sekarang" → "Lihat Detail".
- **Middleware** (`src/middleware.ts`): rewrite `/book/:id/read` → `/book/:id` (stale link safety).
- **Book detail actions**: dead Bookmark/Share buttons removed (superseded by CTA change).

### S5 — App funnel
**New file**: `src/lib/app-links.ts` — single source of truth:
```ts
export const APP_STORE_URL = "https://apps.apple.com/app/bukoo" // placeholder — user to replace
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=id.bukoo.app" // placeholder
```
**New component**: `src/components/app/app-download-cta.tsx` ('use client' not required; server OK) — variant `inline` (book detail) and `strip` (library/account). Official store badge SVGs inlined as components (no external fetch).

**"Lanjutkan di aplikasi" card** (`book/[id]/page.tsx`): if a `reading_progress` row exists for the session user + book (written by mobile), show last-position card: "Lanjutkan di aplikasi — {progressPercent}%" with an app deep-link (`bukoo://book/{id}` fallback store URL). Read-only; no web progress writes.

### S6 — Marketing copy sweep (mobile-only framing)
- `components/marketing/Features.tsx` — "Baca di Semua Perangkat" section → iOS/Android app framing, add badges.
- `(marketing)/perangkat/page.tsx` — drop "Baca langsung dari browser desktop", add download section.
- `components/marketing/FAQ.tsx` — "Tersedia di iOS, Android, dan web browser" → app-only; sync answer unchanged (mobile syncs via API).
- `components/auth/login-form.tsx` — subtitle "melanjutkan membaca" → app framing.
- `components/marketing/Hero.tsx`, `CallToAction.tsx` — CTA buttons → app badges (keep visual style).
- `ComparisonTable.tsx` — moot if deleted as dead code in S3.

### S7 — Loading states + perf
- Add `loading.tsx` (skeleton) for: `(app)/library`, `publisher/(protected)/books`, `admin` group root.
- `SessionProvider` `refetchOnWindowFocus` → false (find provider location: likely `(app)/layout.tsx`).
- `covers/[...key]/route.ts`: reject keys outside `covers/` prefix (404) — closes "serve any R2 object" surface.
- Landing `(marketing)/page.tsx`: wrap `<FeaturedBooks />` in `<Suspense>` with skeleton fallback so static shell streams.
- Investigate root layout `auth()` cost; only move if trivially safe (document findings in ledger either way).

### S8 — Dark mode toggle (customer host)
- Hand-rolled `ThemeProvider` (no new deps): `src/components/theme/theme-provider.tsx` — `light | dark`, persists to localStorage key `bukoo-theme`, sets `document.documentElement.classList`.
- Toggle button in `(app)` header + marketing `Navbar`.
- Default: light (current look). `publisher.*` host untouched (dark by design).
- Inline-style pages (library, book detail) keep light styles this phase; toggle only affects token-based UI (globals.css consumers). Honest scope note in UI: where pages are inline-styled, dark mode applies to shadcn surfaces only.

## Verification Plan

Per phase, for `apps/web` (and any touched workspace):
1. `npm run typecheck --workspace=apps/web`
2. `npm run lint --workspace=apps/web`
3. `npm run test --workspace=apps/web` (web has 5 pure-logic tests; new lib tests added in Phase 4 — gaps stated, never silently skipped)
4. Phase 2 QA: `/book/:id/read` redirects to detail; no EPUB route; CTA shows badges; typecheck proves no dangling imports.
5. Phase 3 QA (preview deploy): "Lanjutkan di aplikasi" renders using mobile-written progress; covers route rejects non-cover keys; dark toggle persists.
6. D1 changes: none expected; if any appear, only via `migrate-d1.yml`.
7. If `@bukoo/db` schema touched (not expected): `npm run build --workspace=@bukoo/db` before web typecheck.

## Open Items (user)
- Real App Store / Play Store URLs → fill `src/lib/app-links.ts` (placeholders until provided).
- MailChannels key rotation + OTP deploy smoke tests (pre-existing task.md items, separate from this effort).
