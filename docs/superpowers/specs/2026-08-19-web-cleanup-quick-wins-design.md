# Design Document: Web Quick Wins — Dead Code, Legacy Scripts, Misleading Names

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/web` (apps/web) only
**Related**: Roadmap "BUKOO Tech-Debt Cleanup & Performance" (Task 2). Phase A quick wins, parallel
to Task 1 (mobile) and Task 3 (API).

---

## 1. Executive Summary

`apps/web` carries dead components, legacy migration scripts from the decommissioned
Neon/Supabase era, gitignored backup dumps, and misleading names (`MockBook` type, `prismaBookToCatalogBook`
function) that survive from the old Prisma stack. None affect real features.

Goal: delete all dead code and stale artifacts, fix two import smells in the book detail page,
and rename the leftover Prisma-era symbols to truthful names — all with **zero behavior change**.

**Correction to the roadmap (verified):** `@base-ui/react` is **actively used** by 10 UI
components (`badge`, `button`, `checkbox`, `dropdown-menu`, `input`, `scroll-area`, `select`,
`separator`, `tabs`) — it is **NOT** unused and will **not** be removed.

**Non-goals**: no API/schema changes; no changes to `apps/mobile`, `apps/api`, `packages/*`; no
dependency changes (except nothing); no style/behavior refactors.

---

## 2. Inventory (all verified)

| # | File | What | Type |
|---|---|---|---|
| 1 | `src/components/catalog/book-card.tsx` | `BookCard` — zero imports/usages anywhere | Dead code |
| 2 | `src/components/layout/header-search.tsx` (+ `layout/` dir) | `HeaderSearch` — zero imports; the dir contains only this file | Dead code |
| 3 | `src/components/marketing/ComingSoonPage.tsx` | `ComingSoonPage` — zero imports (bonus find) | Dead code |
| 4 | `src/lib/data/mock-books.ts` | `mockBooks` array (fake Unsplash data) — zero usages; `MockBook` **type** used by 2 live files (`book-mapper.ts`, `book-catalog-card.tsx`) | Dead array + misnamed type |
| 5 | `src/lib/data/book-mapper.ts` | `prismaBookToCatalogBook` — Prisma-era name, still the core mapper; called by `book/[id]/page.tsx` + `library/page.tsx` | Misleading name |
| 6 | `scripts/` (3 files) | `migrate-supabase-to-neon.ts`, `test-bcrypt-compat.ts`, `test-rename-migration.ts` — legacy; git-tracked; excluded from tsconfig; no CI/code refs | Legacy scripts |
| 7 | `apps/web/backup-*.dump` (12 files) | 6× neon + 6× supabase dumps; **untracked + gitignored** (`*.dump`) | Stale artifacts |
| 8 | `src/app/(app)/book/[id]/page.tsx` L4 | `users as usersTable` imported but **never used** in the file | Unused import |
| 9 | `src/app/(app)/book/[id]/page.tsx` L10 + L13 | Two separate `lucide-react` import lines (`{ Star, BookOpen, … }` and `{ Lock }`) | Mergeable |

---

## 3. Component Specs

### 3.1 Delete dead components
- Delete `src/components/catalog/book-card.tsx`.
- Delete `src/components/layout/header-search.tsx` + the now-empty `src/components/layout/` dir.
- Delete `src/components/marketing/ComingSoonPage.tsx` (verified unused; `privasi`/`syarat-ketentuan`
  use `MarketingDocPage`, not this).

### 3.2 `mock-books.ts` → relocate type, delete file
- **Move** the `MockBook` type into `src/lib/data/book-mapper.ts`, renamed **`CatalogBook`**
  (it's the real catalog DTO, not a mock), and **delete `mock-books.ts`** entirely (array + file).
- `src/components/catalog/book-catalog-card.tsx` L5:
  `import type { MockBook } from '@/lib/data/mock-books'` → `import type { CatalogBook } from '@/lib/data/book-mapper'`
  (and `BookCatalogCard({ book }: { book: MockBook })` → `CatalogBook`).
- The `mockBooks` fake array (Sitti Nurbaya / Salah Asuhan / Atomic Habits (Mock) / etc. with
  Unsplash covers) is removed — nothing renders it.

### 3.3 Rename `prismaBookToCatalogBook` → `bookRowToCatalogBook`
- `src/lib/data/book-mapper.ts`: rename the function; it now owns the `CatalogBook` type.
- Update 2 live callers:
  - `src/app/(app)/book/[id]/page.tsx` (import L6 + call L49)
  - `src/app/(app)/library/page.tsx` (import L3 + call L22)

### 3.4 Delete legacy `scripts/`
- Delete `scripts/migrate-supabase-to-neon.ts`, `scripts/test-bcrypt-compat.ts`,
  `scripts/test-rename-migration.ts` + the `scripts/` dir. (tsconfig already excludes `scripts`;
  nothing references them.)

### 3.5 Delete backup dumps
- Delete the 12 `apps/web/backup-*.dump` files from disk (already gitignored/untracked — safe).

### 3.6 `book/[id]/page.tsx` import cleanup
- L4: drop `users as usersTable` → `import { books as booksTable, subscriptions, readingProgress } from '@bukoo/db'`
- Merge L10 + L13 into one: `import { Star, BookOpen, Globe, ArrowLeft, BookmarkPlus, Share2, Lock } from 'lucide-react'`
- (Renames from §3.3 also apply here.)

### 3.7 `@base-ui/react` — NO change
- Verified actively used by 10 `components/ui/*` primitives. Left untouched.

---

## 4. Layout / Styling Tokens
- N/A — no UI changes (dead components deleted, no visible surface).

---

## 5. Verification Plan
Per AGENTS.md, run for `apps/web` (the only touched workspace):
1. `npx tsc --noEmit` (from `apps/web`).
2. `npm run lint` (from `apps/web`).
3. `npm run test` (from `apps/web`) — **no test script** in `apps/web` package.json; state
   explicitly, don't claim tests pass.

Additional manual checks:
- Grep `apps/web/src` for `BookCard|HeaderSearch|ComingSoonPage|mockBooks|MockBook|prismaBookToCatalogBook|users as usersTable` → **0 hits**.
- Grep `apps/web/src` for `CatalogBook|bookRowToCatalogBook` → hits only in `book-mapper.ts`, `book-catalog-card.tsx`, `book/[id]/page.tsx`, `library/page.tsx`.
- Confirm `apps/web/scripts/` gone; `apps/web/src/components/layout/` gone; `apps/web/backup-*.dump` gone (12 files).
- `@base-ui/react` still in package.json + still imported by 10 components (no change).

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| `BookCard` / `HeaderSearch` / `ComingSoonPage` | Delete | Verified zero usages |
| `MockBook` type | Relocate to `book-mapper.ts` as `CatalogBook` + delete `mock-books.ts` | Type is the real DTO, not a mock; deletes the misleading name and fake array together |
| `prismaBookToCatalogBook` | Rename → `bookRowToCatalogBook` | Removes Prisma-era leftover naming; 2 callers updated |
| `scripts/*` + backup dumps | Delete | Legacy Neon/Supabase era; no refs; dumps untracked/gitignored |
| `@base-ui/react` | **Keep (no change)** | Correction to roadmap — actively used by 10 UI components |
| Book page imports | Drop unused `usersTable`; merge lucide imports | Pure hygiene |
