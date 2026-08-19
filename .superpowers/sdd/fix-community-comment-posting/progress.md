# SDD Ledger — Fix Community Comment Posting Crash

Plan: `docs/superpowers/plans/2026-08-19-fix-community-comment-posting.md`
Spec: `docs/superpowers/specs/2026-08-19-fix-community-comment-posting-design.md`
Started: 2026-08-19 · Mode: subagent-driven-development

## Progress

- **Task 1 (POST comment DTO)**: complete — `POST /v1/community/posts/:id/comments` now selects the inserted comment joined with `users` and returns `{ id, content, createdAt, user: { id, name, avatarUrl } }` (name fallback `'Pembaca BUKOO'`) instead of the raw Drizzle row. ✅
- **Task 2 (POST post DTO)**: complete — `POST /v1/community/posts` now selects the inserted post joined with `users` (inner) + `books` (left) and returns the full feed DTO incl. `likedByMe: false`, `bookmarkedByMe: false`, `user`, `book` (or `null`). ✅
- **Task 3 (PostCommentsModal defensive)**: complete — author access guarded with `c.user?.name ?? 'Pembaca BUKOO'` (avatar letter + author name). ✅
- **Task 4 (CommunityScreen defensive)**: complete — `post.user?.name ?? 'Pembaca BUKOO'`, `post.user?.avatarUrl`, `post.user?.id` guarded (share, avatar, name, delete ownership). ✅
- **Task 5 (verification)**: complete —
  - API: typecheck ✅, lint 0 errors (4 pre-existing console warnings in unrelated files), vitest 8/8 ✅.
  - Mobile: typecheck ✅, lint ✅ (no test script — stated explicitly).
  - **Local smoke test** (`wrangler dev` + local D1): `POST /posts/:id/comments` → 201 with `user` object (was raw row without `user`); `POST /posts` → 201 with `user` + `book: null`; `GET .../comments` → 200 correct shape. Temp `.dev.vars` (JWT_SECRET), `/tmp` token, and QA seed data all cleaned up. ✅

## Root cause (verified 2026-08-19)

`POST /v1/community/posts/:id/comments` returned the **raw Drizzle row**
(`{ id, postId, userId, content, createdAt }` — no `user` object). Mobile
`PostCommentsModal` prepends the response to the list and renders
`c.user.name.charAt(0)` → `c.user` is `undefined` → `TypeError: Cannot read
property 'name' of undefined`. `GET .../comments` already returned the correct
DTO with `user`, so only the freshly posted comment crashed.

Sibling bug (same class): `POST /posts` returned a raw post row (no `user`/`book`/
`likedByMe`/`bookmarkedByMe`) → `CommunityScreen` would crash the same way when
creating a post. Both fixed.

## Key notes / decisions
- Fix is primarily server-side (source of truth): create endpoints now return the same DTO shape as their GET counterparts.
- Mobile defensive rendering added as belt & suspenders so a stale deployed API (pre-redeploy) can't crash the app.
- No D1-mocking test infra exists in the API suite; existing community.test.ts covers auth/validation only — stated explicitly.
- **Deploy required**: `bukoo-api` needs a redeploy (wrangler) for production to return the fixed DTO. Mobile fix protects clients until then.

## Commits
- (pending)
