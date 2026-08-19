# Implementation Plan: Fix Community Comment Posting Crash

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-fix-community-comment-posting-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspace**: `@bukoo/api` (apps/api) + `@bukoo/mobile` (apps/mobile)
**Ledger**: `.superpowers/sdd/fix-community-comment-posting/progress.md`

---

## Task 1 — `apps/api/src/routes/community.ts`: `POST /posts/:id/comments` returns full comment DTO

- [x] After inserting the comment, select it joined with the author (`users`) and return `{ id, content, createdAt, user: { id, name, avatarUrl } }` (name fallback `'Pembaca BUKOO'`), mirroring the GET comments projection — instead of the raw Drizzle row.

## Task 2 — `apps/api/src/routes/community.ts`: `POST /posts` returns full post DTO

- [x] After inserting the post, select it with author (`users` inner join) + optional book (`books` left join) and return the full feed DTO:
  `{ id, type, content, bookId, likeCount, commentCount, bookmarkCount, likedByMe: false, bookmarkedByMe: false, createdAt, user: { id, name, avatarUrl }, book: { id, title, author, coverUrl } | null }`.

## Task 3 — `apps/mobile/src/screens/community/components/PostCommentsModal.tsx`: defensive author access

- [x] Guard `c.user?.name ?? 'Pembaca BUKOO'` for avatar letter + comment author name (no `.charAt(0)` crash when `user` missing).

## Task 4 — `apps/mobile/src/screens/community/CommunityScreen.tsx`: defensive author access

- [x] Guard `post.user?.name ?? 'Pembaca BUKOO'`, `post.user?.avatarUrl`, and `post.user?.id` (share, avatar, name, delete ownership) so feed posts never crash on a missing `user`.

## Task 5 — Verification

- [x] `npm run typecheck --workspace=@bukoo/api && npm run lint --workspace=@bukoo/api && npm run test --workspace=@bukoo/api` (existing community.test.ts covers auth/validation only — no D1 mocking infra, stated explicitly).
- [x] `npm run typecheck --workspace=@bukoo/mobile && npm run lint --workspace=@bukoo/mobile` (no test script — stated explicitly).
- [x] Local API smoke (`wrangler dev` + local D1): `POST /posts/:id/comments` → 201 with `user` object; `POST /posts` → 201 with `user` + `book`. Verified live against local server; temp `.dev.vars`/token/seed data cleaned up.
- [x] Update ledger + root `task.md`.

## Files touched
- `apps/api/src/routes/community.ts`
- `apps/mobile/src/screens/community/components/PostCommentsModal.tsx`
- `apps/mobile/src/screens/community/CommunityScreen.tsx`
