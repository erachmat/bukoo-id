# Implementation Plan: API Helper Consolidation — Tier, Cover URL, User Serializers

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-api-helper-consolidation-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/api` (apps/api) only
**Ledger**: `.superpowers/sdd/api-helper-consolidation/progress.md`

---

## Task 1 — New `src/lib/tier.ts`

- [x] Create `getUserTier(userId, db)` (verbatim from books.ts/reading.ts).

## Task 2 — New `src/lib/cover-url.ts`

- [x] Create `buildCoverUrl(coverKey)` (verbatim from reading.ts/community.ts).

## Task 3 — New `src/lib/user-serializers.ts`

- [x] Move `parseFavoriteGenres` + `toUserPublic` + `serializeUser` (serializeUser reuses toUserPublic via spread; `SubscriptionLike` interface).

## Task 4 — Update route files (remove local defs, import from libs)

- [x] `books.ts`: remove local `getUserTier`; `import { getUserTier } from '../lib/tier.js'`.
- [x] `reading.ts`: remove local `getUserTier` + `buildCoverUrl`; import from `../lib/tier.js` + `../lib/cover-url.js`.
- [x] `community.ts`: remove local `buildCoverUrl`; import from `../lib/cover-url.js`.
- [x] `users.ts`: remove local `parseFavoriteGenres` + `serializeUser`; import `serializeUser` from `../lib/user-serializers.js`.
- [x] `auth.ts`: remove local `toUserPublic`; import from `../lib/user-serializers.js`.

## Task 5 — Verify (AGENTS.md)

- [x] `npx tsc --noEmit` → exit 0.
- [x] `npm run lint` → 0 errors.
- [x] `npm run test` → 14/14.
- [x] Grep `apps/api/src/routes` for `function getUserTier|function buildCoverUrl|function toUserPublic|function serializeUser|function parseFavoriteGenres` → 0 hits.
- [x] Grep `apps/api/src/lib` for the 4 symbols → present.

## Task 6 — Docs

- [x] Update root `task.md`; SDD ledger; mark plan checkboxes complete.
