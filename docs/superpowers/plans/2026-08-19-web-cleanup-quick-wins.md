# Implementation Plan: Web Quick Wins — Dead Code, Legacy Scripts, Misleading Names

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-web-cleanup-quick-wins-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/web` (apps/web) only
**Ledger**: `.superpowers/sdd/web-cleanup-quick-wins/progress.md`

---

## Task 1 — Delete dead components

- [x] Delete `src/components/catalog/book-card.tsx` (dead `BookCard`).
- [x] Delete `src/components/layout/header-search.tsx` + empty `src/components/layout/` dir.
- [x] Delete `src/components/marketing/ComingSoonPage.tsx` (dead).

## Task 2 — `mock-books.ts` → relocate type as `CatalogBook`, delete file

- [x] `book-mapper.ts`: define exported `CatalogBook` type (from `MockBook`); drop `mock-books` import.
- [x] `book-catalog-card.tsx`: `import type { CatalogBook } from '@/lib/data/book-mapper'`; prop type `CatalogBook`.
- [x] Delete `src/lib/data/mock-books.ts`.

## Task 3 — Rename `prismaBookToCatalogBook` → `bookRowToCatalogBook`

- [x] `book-mapper.ts`: rename function.
- [x] `src/app/(app)/book/[id]/page.tsx`: update import + call.
- [x] `src/app/(app)/library/page.tsx`: update import + call.

## Task 4 — Delete legacy `scripts/`

- [x] Delete `scripts/migrate-supabase-to-neon.ts`, `test-bcrypt-compat.ts`, `test-rename-migration.ts` + `scripts/` dir.

## Task 5 — Delete backup dumps

- [x] Delete all `apps/web/backup-*.dump` (12 files; untracked + gitignored).

## Task 6 — `book/[id]/page.tsx` import cleanup

- [x] Drop `users as usersTable` from `@bukoo/db` import.
- [x] Merge two `lucide-react` imports into one (`…, Lock`).

## Task 7 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit` (apps/web) → exit 0.
- [x] `npm run lint` (apps/web) → 0 errors.
- [x] `npm run test` (apps/web) → no test script; state explicitly.
- [x] Grep `apps/web/src` for `BookCard|HeaderSearch|ComingSoonPage|mockBooks|MockBook|prismaBookToCatalogBook|users as usersTable` → 0 hits (remaining `users as usersTable` are legitimate admin usages).
- [x] Grep `apps/web/src` for `CatalogBook|bookRowToCatalogBook` → only in expected 4 files.
- [x] `scripts/` gone; `src/components/layout/` gone; `backup-*.dump` gone.
- [x] `@base-ui/react` untouched (still used by 9 files).

## Task 8 — Docs

- [x] Update root `task.md` with completed entry.
- [x] Update SDD ledger `.superpowers/sdd/web-cleanup-quick-wins/progress.md`.
- [x] Mark all plan checkboxes complete.
