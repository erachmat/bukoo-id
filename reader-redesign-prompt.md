# Reader Redesign Prompt — Kindle/Apple Books Parity (apps/mobile)

You are working in the `bukoo-id` monorepo, scoped to `@bukoo/mobile` (`apps/mobile`).
Follow `AGENTS.md` and `GEMINI.md` at the repo root strictly before taking any action.

## Goal
Redesign the book reader in `apps/mobile` to achieve feature parity, sub-16ms page turns, and typography elegance comparable to Apple Books and Kindle.

## Priorities & Build Order
1. **Phase 0 — Rendering Architecture Audit & Decision Gate** (STOP GATE — blocks all rendering implementation)
2. **Phase 1 — Navigation** (Nested TOC, in-book full-text search, draggable quick-jump slider)
3. **Phase 2 — Personalization** (Theme, font family, font size, line spacing, margins)
4. **Phase 3 — Engagement** (Backend annotation sync: highlights, bookmarks, notes + Prisma models + API endpoints)
5. **Phase 4 — Visual Polish & Motion** (Page-turn animations, typography defaults, accessibility, chrome auto-hide)
6. **Phase 5 — Content Cleanup** (Remove PDF rendering paths & resolve sample PDF books)

## Strict Rules
1. **Never edit `packages/shared-types`, `apps/api`, or Prisma schema silently.** Flag shared DTO or schema changes explicitly.
2. **Prisma Migrations**: For backend annotation models, run `prisma migrate dev --create-only` first, manually inspect SQL for safe `RENAME` vs destructive `DROP`, and validate on a Neon branch parented from `production`.
3. **Verification**: After completing work in any workspace, run `npm run typecheck`, `npm run lint`, and `npm run test` for that workspace. Note explicitly if a workspace has no unit tests.
4. **Task Tracking**: Keep `task.md` updated by checking off sub-steps as completed.
