# SDD Ledger — API Helper Consolidation: Tier, Cover URL, User Serializers

Plan: `docs/superpowers/plans/2026-08-19-api-helper-consolidation.md`
Spec: `docs/superpowers/specs/2026-08-19-api-helper-consolidation-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (tier.ts)**: complete — `getUserTier(userId, db)` moved verbatim to `src/lib/tier.ts` (was duplicated in books.ts + reading.ts). ✅
- **Task 2 (cover-url.ts)**: complete — `buildCoverUrl(coverKey)` moved verbatim to `src/lib/cover-url.ts` (was duplicated in reading.ts + community.ts). ✅
- **Task 3 (user-serializers.ts)**: complete — `parseFavoriteGenres` + `toUserPublic` + `serializeUser` moved to `src/lib/user-serializers.ts`; `serializeUser` now spreads `toUserPublic(user)` (removes duplicated field mapping); `SubscriptionLike` interface added. ✅
- **Task 4 (routes)**: complete — books.ts/reading.ts/community.ts/users.ts/auth.ts all drop their local helpers and import from the libs; removed now-unused `subscriptions` imports (books.ts, reading.ts) and `UserDto`/`AuthUserDto` type imports (users.ts, auth.ts). ✅
- **Task 5 (verify)**: ✅ `npx tsc --noEmit` exit 0; `npm run lint` 0 errors (4 pre-existing no-console warnings in auth.ts/ai.ts — not from this change); `npm run test` **14/14**. Greps: `function getUserTier|buildCoverUrl|toUserPublic|serializeUser|parseFavoriteGenres` in `src/routes` → **0 hits**; lib exports present (`getUserTier` is `export async function`). No deploy.
- **Task 6 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **No behavior change** — same queries, same DTO shapes (already typed against shared-types from Task 4).
2. **`serializeUser` reuses `toUserPublic`** via spread — one canonical field mapping for users.
3. **Cross-app cover-URL duplication remains** (mobile `services/coverUrl.ts`, web `lib/cover-url.ts`) — flagged for a future shared-runtime task; out of scope here.
4. **Deferred (noted)**: web's `tierFromSubscription`/`getUserTierFromDb` (lib/subscription.ts) still mirrors `getUserTier` — web queries D1 directly, so sharing the API lib isn't wired; noted for Task 8 (web consolidation).

## Commits
- Not committed yet — changes in working tree (`src/lib/tier.ts`, `src/lib/cover-url.ts`, `src/lib/user-serializers.ts` new; 5 route files edited; docs). Suggested: `refactor(api): consolidate getUserTier/buildCoverUrl/user serializers into src/lib`.
