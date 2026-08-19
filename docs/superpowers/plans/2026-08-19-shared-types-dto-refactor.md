# Implementation Plan: Shared Types — Make `@bukoo/shared-types` the Real DTO Contract

**Date**: 2026-08-19
**Spec**: `docs/superpowers/specs/2026-08-19-shared-types-dto-refactor-design.md`
**Mode**: `superpowers:subagent-driven-development`
**Workspaces**: `packages/shared-types`, `@bukoo/mobile`, `@bukoo/web`, `@bukoo/api`
**Ledger**: `.superpowers/sdd/shared-types-dto-refactor/progress.md`

---

## Task 1 — Rewrite `packages/shared-types`

- [x] Rewrite `src/index.ts` (keep `isBookAccessible`; `SubscriptionTier` + `'PREMIUM'`; `TIER_ORDER: SubscriptionTier[]`; new `BookDto`, `BookFeaturedResponse`, `BookRecommendationDto`, `AuthUserDto`, `UserSubscriptionDto`, `UserDto`, `ReadingProgressRecentDto`, `ReadingProgressRowDto`, `HighlightDto`, `BookmarkDto`, `GoalDto`, `StreakRowDto`, `RecordGoalResponseDto`, `CurrentStreakDto`, `BooksThisYearDto`, `CommunityPostType`, `CommunityUserDto`, `CommunityBookDto`, `CommunityPostDto`, `CommunityPostsPageDto`, `CommunityCommentDto`, `CommunityEventDto`).
- [x] `npm run typecheck` + `npm run build` (regenerate `dist/`).

## Task 2 — Mobile `services/api.ts` re-export shared DTOs

- [x] Import + re-export shared DTOs under current local names (`BookItemDto`, `FeaturedBooksResponseDto`, `ReadingProgressItemDto`, `CommunityPostType`, `CommunityPostDto`, `CommunityUserDto`, `CommunityBookDto`, `CommunityPostsPageDto`, `CommunityCommentDto`, `CommunityEventDto`); delete local defs. (Note: used `import type` + local `export type X = Y` aliases — the direct `export type { A as B } from` form didn't bind locally.)
- [x] `AuthResponseDto` → `{ accessToken; refreshToken; expiresIn: number; user: AuthUserDto }`; `RegisterResponseDto.user: AuthUserDto`.

## Task 3 — Mobile `authStore` → shared `UserDto`

- [x] `stores/authStore.ts`: remove local `UserPublicDto`/`UserSubscriptionDto`; `user: UserDto | null`; add `toUserDto(AuthUserDto)` adapter.
- [x] `userProfileService.ts`: `updateProfile` builds `UserDto` (drop `subscriptionTier`; carry `subscription`).
- [x] Fix `AiCompanionScreen.tsx` + `ProfileScreen.tsx` tier branches → `'FREE'` fallback.
- [x] Apply `toUserDto` at all 6 auth setUser sites (useAuth ×4, LoginScreen, api.ts refresh interceptor).

## Task 4 — Mobile: remove `coverKey` casts (5 sites)

- [x] `AiCompanionScreen`, `RelatedBooksCarousel`, `HomeScreen`, `SearchScreen` ×2 → `getCoverUrl(b.coverKey) || ''`; remove masking `(item: BookItemDto)` annotation in SearchScreen.

## Task 5 — Mobile: fix contract bugs

- [x] `LibraryScreen` → bare-array guard + typed query (**fixes empty Library**).
- [x] `CreatePostModal` → bare-array guard (**fixes empty book picker**).
- [x] `ProfileScreen` goal modal → `goalsData?.dailyGoalMinutes?.toString() || '30'`.
- [x] Delete dead `ReadingGoalsWidget.tsx`; remove inline book-shape type in LibraryScreen.

## Task 6 — Web `lib/subscription.ts` adopts shared tiers

- [x] `type Tier = SubscriptionTier` (import from shared); logic unchanged.

## Task 7 — API: annotate DTO builders

- [x] `books.ts` `formatBook(...): BookDto` (+ `subscriptionRequired as SubscriptionTier` cast); `users.ts` `serializeUser(...): UserDto`; `auth.ts` `toUserPublic(...): AuthUserDto`.

## Task 8 — Verify (AGENTS.md, every touched workspace)

- [x] shared-types: typecheck + build.
- [x] api: tsc / lint / test (14).
- [x] mobile: tsc / lint / test (no test script — stated).
- [x] web: tsc / lint / test (no test script — stated).
- [x] Greps: `subscriptionTier|as { coverKey|data.goal|todayProgress|ReadingGoalsWidget` in mobile → 0; local DTO interfaces gone from api.ts; `dist/index.d.ts` contains `BookDto`.

## Task 9 — Docs

- [x] Update root `task.md`; SDD ledger; mark plan checkboxes complete.
