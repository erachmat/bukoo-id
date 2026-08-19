# Design Spec — Fix Community Comment Posting Crash

- **Date:** 2026-08-19
- **Status:** Draft (awaiting approval)
- **Scope:** `apps/api` (community routes), `apps/mobile` (defensive rendering)
- **Related work:** `mobile-feature-hardening` (2026-08-18, community tables/routes)

## Executive summary

Posting a comment from the Community screen crashes the app with:

```
ERROR  [TypeError: Cannot read property 'name' of undefined]
```

### Root cause

`POST /v1/community/posts/:id/comments` (`apps/api/src/routes/community.ts`) returns
the **raw Drizzle row** from `db.query.communityComments.findFirst(...)`:

```json
{ "id": "...", "postId": "...", "userId": "...", "content": "...", "createdAt": "..." }
```

The row contains `userId`, not a `user` object. The mobile DTO
`CommunityCommentDto` (`apps/mobile/src/services/api.ts`) requires:

```ts
{ id: string; content: string; createdAt: string; user: { id; name; avatarUrl } }
```

`PostCommentsModal.handleAddComment` prepends the server response to the comments
list, and the render path reads `c.user.name.charAt(0)` / `c.user.name`. Since
`c.user` is `undefined`, rendering throws `Cannot read property 'name' of undefined`.

`GET /v1/community/posts/:id/comments` already returns the **correct** DTO shape
(with `user`), so the crash only happens on the comment just posted — existing
comments render fine.

### Sibling bug (same class, found while tracing)

`POST /v1/community/posts` also returns the raw post row (`{ id, userId, type,
content, bookId, likeCount, commentCount, bookmarkCount, createdAt }`) — no
`user`, no `book`, no `likedByMe`/`bookmarkedByMe`. `CommunityScreen` prepends it
to the feed and renders `post.user.name`, so creating a post would crash the same
way. Fix both so the API always returns the full DTO shape that its GET
counterpart returns.

## Component specs

### 1. API — `apps/api/src/routes/community.ts`

**Goal:** both POST create endpoints return the same DTO shape as their GET counterparts.

#### `POST /posts/:id/comments`

After inserting the comment, select it joined with the author and return:

```ts
{
  id, content, createdAt,
  user: { id, name: name ?? 'Pembaca BUKOO', avatarUrl: avatar },
}
```

Implementation: a `select(...).from(communityComments).innerJoin(users, eq(communityComments.userId, users.id)).where(eq(communityComments.id, id))`, mirroring the existing GET comments projection.

#### `POST /posts`

After inserting the post, select it joined with author (`users`) and optional book (`books`, left join) and return the full feed DTO:

```ts
{
  id, type, content, bookId, likeCount, commentCount, bookmarkCount,
  likedByMe: false, bookmarkedByMe: false,
  createdAt,
  user: { id, name: name ?? 'Pembaca BUKOO', avatarUrl: avatar },
  book: book ? { id, title, author, coverUrl: buildCoverUrl(coverKey) } : null,
}
```

(`likedByMe`/`bookmarkedByMe` are always `false` — the post was just created by the caller.)

### 2. Mobile — defensive rendering (belt & suspenders)

**Files:** `apps/mobile/src/screens/community/components/PostCommentsModal.tsx`, `apps/mobile/src/screens/community/CommunityScreen.tsx`

- Guard author access so a missing/`undefined` `user` (e.g. stale deployed API
  before this fix ships) renders a fallback instead of crashing:
  - `c.user?.name ?? 'Pembaca BUKOO'` for avatar letter + comment author name.
  - `post.user?.name ?? 'Pembaca BUKOO'` / `post.user?.avatarUrl` / `post.user?.id`
    for feed posts (share, avatar, name, delete-button ownership check).

## Layout / styling tokens

No visual changes. Fallback author display name is `'Pembaca BUKOO'` — the same
string the API already uses for `NULL` names.

## Verification plan

1. **API:** `npm run typecheck --workspace=@bukoo/api`, `npm run lint --workspace=@bukoo/api`, `npm run test --workspace=@bukoo/api` (existing community.test.ts covers auth/validation; no D1 mocking infra for a response-shape test — stated explicitly).
2. **Mobile:** `npm run typecheck --workspace=@bukoo/mobile`, `npm run lint --workspace=@bukoo/mobile` (no test script — stated explicitly).
3. **Local API smoke (wrangler dev + local D1):** seed a user + post; `POST /posts/:id/comments` → 201 with `user` object; `POST /posts` → 201 with `user` + `book`.
4. **Device QA:** post a comment in Community → appears at top of list without crash; create a post → appears in feed without crash.
5. **Deploy:** redeploy `bukoo-api` (wrangler) after approval so production returns the fixed DTO.

## Out of scope

- Post/comment deletion UX, moderation, editing.
- Adding D1-mocking test infrastructure to the API suite.
- Any mobile UI redesign.
