# SDD Ledger — Web Quick Wins: Dead Code, Legacy Scripts, Misleading Names

Plan: `docs/superpowers/plans/2026-08-19-web-cleanup-quick-wins.md`
Spec: `docs/superpowers/specs/2026-08-19-web-cleanup-quick-wins-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (delete dead components)**: complete — deleted `src/components/catalog/book-card.tsx` (`BookCard`), `src/components/layout/header-search.tsx` (`HeaderSearch`) + empty `layout/` dir, `src/components/marketing/ComingSoonPage.tsx` (`ComingSoonPage`) — all verified zero usages. ✅
- **Task 2 (mock-books → CatalogBook)**: complete — `MockBook` type moved into `src/lib/data/book-mapper.ts` as exported **`CatalogBook`** (real DTO, not a mock); `book-catalog-card.tsx` updated to `import type { CatalogBook } from '@/lib/data/book-mapper'`; **`src/lib/data/mock-books.ts` deleted** (incl. the fake `mockBooks` array with Unsplash covers — nothing rendered it). ✅
- **Task 3 (rename mapper)**: complete — `prismaBookToCatalogBook` → **`bookRowToCatalogBook`** in `book-mapper.ts` + both callers (`book/[id]/page.tsx`, `library/page.tsx`). ✅
- **Task 4 (delete scripts)**: complete — `scripts/migrate-supabase-to-neon.ts`, `test-bcrypt-compat.ts`, `test-rename-migration.ts` + `scripts/` dir deleted (legacy Neon/Supabase era; excluded from tsconfig; no refs). ✅
- **Task 5 (delete backup dumps)**: complete — 12 `apps/web/backup-*.dump` files removed from disk (were untracked + gitignored). ✅
- **Task 6 (book page imports)**: complete — dropped unused `users as usersTable` from `@bukoo/db` import; merged the two `lucide-react` imports into one (`…, Share2, Lock`). ✅
- **Task 7 (verify)**: ✅ `npx tsc --noEmit` exit 0; `npm run lint` **0 errors** (18 pre-existing warnings in untouched files — pdf-viewer/auth); `npm run test` → **"Missing script: test"** — `apps/web` has NO test script (stated explicitly). Greps: `MockBook|mockBooks|prismaBookToCatalogBook|BookCard|HeaderSearch|ComingSoonPage` → **0 hits** in `src`; the only remaining `users as usersTable` are **legitimate** admin-page usages (`admin/page.tsx` ×5, `admin/users/page.tsx` ×9). `CatalogBook|bookRowToCatalogBook` → exactly the 4 expected files. `@base-ui/react` still imported by 9 files (untouched).
- **Task 8 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **`@base-ui/react` NOT removed** (roadmap correction, verified during discovery): actively used by 9 `components/ui/*` files — left untouched.
2. **`MockBook` type relocated + renamed `CatalogBook`** into `book-mapper.ts`; `mock-books.ts` deleted entirely (type + fake array). Cleaner than keeping a misnamed type in a misnamed file.
3. **Verification grep scoped correctly**: the two `users as usersTable` hits in admin pages are real usages (users listing/dashboard), not dead code — only the book-detail-page import was removed.

## Commits
- Not committed yet — changes in working tree (`book-mapper.ts`, `book-catalog-card.tsx`, `book/[id]/page.tsx`, `library/page.tsx`, deleted `book-card.tsx`/`header-search.tsx`/`ComingSoonPage.tsx`/`mock-books.ts`/`scripts/`/`backup-*.dump`, docs). Suggested commit: `refactor(web): quick wins — dead code, legacy scripts, misleading names`.
