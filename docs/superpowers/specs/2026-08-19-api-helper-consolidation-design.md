# Design Document: API Helper Consolidation — Tier, Cover URL, User Serializers

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspace**: `@bukoo/api` (apps/api) only
**Related**: Roadmap "BUKOO Tech-Debt Cleanup & Performance" (Task 5 — Phase B; depends on Task 4
shared-types). The API has three copy-pasted helpers across route files; consolidate them into
`src/lib/` with zero behavior change.

---

## 1. Executive Summary

Three helpers are duplicated verbatim across route files:
1. **`getUserTier()`** — identical in `books.ts` and `reading.ts` (resolves ACTIVE/TRIALING plan tier → `FREE`).
2. **`buildCoverUrl()`** — identical in `reading.ts` and `community.ts` (`https://bukoo.id/covers/<key>`).
3. **User serializers** — `toUserPublic()` (auth.ts, → `AuthUserDto`) and `serializeUser()` (users.ts,
   → `UserDto` which is `AuthUserDto` + `favoriteGenres` + `subscription`). `serializeUser` duplicates
   `toUserPublic`'s field mapping and owns a private `parseFavoriteGenres()`.

Goal: move each into a single `src/lib/` module and have all routes import it. **Zero behavior
change** — same queries, same output shapes (already typed against shared-types in Task 4).

**Non-goals**: no schema/endpoint changes; no new runtime behavior; no cross-app consolidation of
the cover-URL logic (mobile `services/coverUrl.ts` + web `lib/cover-url.ts` also duplicate it — that
is a future shared-runtime task, flagged in the Decision Log); no security fixes.

---

## 2. Inventory (all verified)

| # | Duplicate | Locations | Notes |
|---|---|---|---|
| 1 | `getUserTier(userId, db)` | `books.ts:27` (6 call sites), `reading.ts:21` (2 call sites) | Identical; returns `string` |
| 2 | `buildCoverUrl(coverKey)` | `reading.ts:157`, `community.ts:26` | Identical; pure |
| 3 | `toUserPublic(user)` | `auth.ts:95` | → `AuthUserDto` (typed in Task 4) |
| 4 | `serializeUser(user, sub)` + `parseFavoriteGenres()` | `users.ts:24` + `users.ts:14` | → `UserDto`; duplicates `toUserPublic` mapping |

---

## 3. Component Specs

### 3.1 New `src/lib/tier.ts`
```ts
import { eq } from 'drizzle-orm';
import { subscriptions } from '@bukoo/db';
import type { createDb } from '../db/index.js';

/**
 * Resolve the user's active subscription tier from D1.
 * ACTIVE/TRIALING subscriptions grant their plan tier; anything else → FREE.
 */
export async function getUserTier(userId: string, db: ReturnType<typeof createDb>): Promise<string> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) {
    return sub.planId.replace('plan_', '').toUpperCase();
  }
  return 'FREE';
}
```
- `books.ts` + `reading.ts`: **delete local defs**, `import { getUserTier } from '../lib/tier.js'` (call sites unchanged).

### 3.2 New `src/lib/cover-url.ts`
```ts
/** R2 cover keys are not public URLs — the web worker serves them at /covers/<key>. */
export function buildCoverUrl(coverKey: string | null): string | null {
  return coverKey ? `https://bukoo.id/covers/${coverKey}` : null;
}
```
- `reading.ts` + `community.ts`: **delete local defs**, import from `../lib/cover-url.js`.

### 3.3 New `src/lib/user-serializers.ts`
- Move `parseFavoriteGenres`, `toUserPublic`, `serializeUser` here (verbatim logic, with
  `toUserPublic` reused by `serializeUser` via spread):
```ts
import type { users } from '@bukoo/db';
import type { AuthUserDto, UserDto } from '@bukoo/shared-types';

/** Favorite genres are stored as a JSON text column; parse defensively on read. */
function parseFavoriteGenres(raw: string | null): string[] { /* verbatim from users.ts */ }

export interface SubscriptionLike {
  planId: string;
  currentPeriodEnd: string | null;
  status: string;
  paymentGateway: string | null;
}

/** Auth-response user (login/register/refresh) — subscription/favorites not included. */
export function toUserPublic(user: typeof users.$inferSelect): AuthUserDto { /* verbatim from auth.ts */ }

/** Full /users/me shape — AuthUserDto + favoriteGenres + subscription. */
export function serializeUser(user: typeof users.$inferSelect, sub: SubscriptionLike | null): UserDto {
  /* verbatim from users.ts, but base = { ...toUserPublic(user) } */
}
```
- `auth.ts`: **delete local `toUserPublic`**, `import { toUserPublic } from '../lib/user-serializers.js'`.
- `users.ts`: **delete local `parseFavoriteGenres` + `serializeUser`**, `import { serializeUser } from '../lib/user-serializers.js'`.
- Call sites unchanged (`serializeUser(user, sub ?? null)` where `user` is `$inferSelect` — compatible).

---

## 4. Layout / Styling Tokens
- N/A — backend only.

---

## 5. Verification Plan
Per AGENTS.md, run for `apps/api` (the only touched workspace):
1. `npx tsc --noEmit` → exit 0.
2. `npm run lint` → 0 errors.
3. `npm run test` → **14/14 pass** (ai 4 + community 4 + streak 6).

Additional manual checks:
- Grep `apps/api/src/routes` for `function getUserTier|function buildCoverUrl|function toUserPublic|function serializeUser|function parseFavoriteGenres` → **0 hits** (all now in `src/lib/`).
- Grep `apps/api/src/lib` for `getUserTier|buildCoverUrl|toUserPublic|serializeUser` → present in the 3 new files.
- No deploy required (no behavior/startup change).

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| Helper location | `src/lib/tier.ts`, `src/lib/cover-url.ts`, `src/lib/user-serializers.ts` | Matches existing `src/lib/` (cuid, jwt, mail, password, streak) |
| `serializeUser` reuses `toUserPublic` | Yes (spread base) | Removes duplicated field mapping; both typed against shared-types |
| `parseFavoriteGenres` | Moved into `user-serializers.ts` (not exported) | Only used by `serializeUser` |
| Cross-app cover URL | **Deferred** | Mobile `services/coverUrl.ts` + web `lib/cover-url.ts` duplicate `buildCoverUrl`; consolidating needs a shared runtime package — future task, noted |
| Behavior change | None | Same queries, same shapes |
