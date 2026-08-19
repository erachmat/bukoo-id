# SDD Ledger — Shared Types: Make `@bukoo/shared-types` the Real DTO Contract

Plan: `docs/superpowers/plans/2026-08-19-shared-types-dto-refactor.md`
Spec: `docs/superpowers/specs/2026-08-19-shared-types-dto-refactor-design.md`
Started: 2026-08-19 · Mode: executing-plans

## Progress

- **Task 1 (shared-types rewrite)**: complete — `packages/shared-types/src/index.ts` rewritten: kept `isBookAccessible`; `SubscriptionTier` now includes `'PREMIUM'`; `TIER_ORDER: SubscriptionTier[]`; added `BookDto`, `BookFeaturedResponse`, `BookRecommendationDto`, `AuthUserDto`, `UserSubscriptionDto`, `UserDto`, `ReadingProgressRecentDto`, `ReadingProgressRowDto`, `HighlightDto`, `BookmarkDto`, `GoalDto`, `StreakRowDto`, `RecordGoalResponseDto`, `CurrentStreakDto`, `BooksThisYearDto`, community DTOs. Typecheck + build ✅ (dist regenerated). ✅
- **Task 2 (mobile api.ts)**: complete — local DTO definitions replaced with shared-types imports + local type aliases (`BookItemDto = BookDto` etc.); `AuthResponseDto` gains `expiresIn` + uses `AuthUserDto`. ⚠️ **Note**: the initial `export type { BookDto as BookItemDto } from ...` re-export did NOT create usable local bindings (TS errors at usage sites) — switched to `import type { ... }` + `export type X = Y` aliases, which works. ✅
- **Task 3 (authStore → UserDto)**: complete — `UserPublicDto`/`UserSubscriptionDto` removed; `user: UserDto`; added `toUserDto(AuthUserDto)` adapter used at all 6 auth setUser sites (useAuth ×4, LoginScreen, api.ts refresh interceptor); dead `subscriptionTier` branches in AiCompanionScreen/ProfileScreen → `'FREE'` fallback; `userProfileService.updateProfile` builds `UserDto`. ✅
- **Task 4 (coverKey casts)**: complete — 5 cast sites (`AiCompanionScreen`, `RelatedBooksCarousel`, `HomeScreen`, `SearchScreen` ×2) → `getCoverUrl(b.coverKey) || ''`; `SearchScreen` explicit `(item: BookItemDto)` annotation removed (masked added `coverUrl`). ✅
- **Task 5 (contract bugs)**: complete — `LibraryScreen` `/books` now handles bare array (**fixes permanently-empty Library tab**); `CreatePostModal` book picker bare-array guard (**fixes empty picker**); `ProfileScreen` goal modal reads `dailyGoalMinutes` directly; **deleted dead `ReadingGoalsWidget.tsx`** (wrong shape + fake `'The Art of War'` default); `LibraryScreen` inline book-shape type removed (uses shared `BookItemDto`, typed query). ✅
- **Task 6 (web subscription)**: complete — `lib/subscription.ts`: `type Tier = SubscriptionTier` (imported from shared; union now includes `'PREMIUM'` so behavior identical). ✅
- **Task 7 (API annotations)**: complete — `formatBook(...): BookDto` (with `subscriptionRequired as SubscriptionTier` cast — D1 column is free-text `string`), `serializeUser(...): UserDto`, `toUserPublic(...): AuthUserDto`. tsc enforces the contract. ✅
- **Task 8 (verify)**: ✅ shared-types typecheck+build; API tsc ✅ / lint 0 errors (4 pre-existing warnings) / **14/14 tests** ✅; mobile tsc ✅ / lint ✅ / test = "No tests specified for mobile yet" (stated); web tsc ✅ / lint 0 errors (18 pre-existing warnings) / no test script (stated). Greps: `subscriptionTier|as { coverKey|data.goal|todayProgress|ReadingGoalsWidget` → **0** in mobile; api.ts local DTO interfaces → **0**; `dist/index.d.ts` contains new DTOs.
- **Task 9 (docs)**: complete — plan checkboxes ✅, `task.md` entry added, this ledger updated.

## Key decisions / amendments to spec
1. **Re-export quirk**: `export type { A as B } from '...'` failed to bind `B` locally in mobile — used `import type` + local `export type B = A` aliases instead.
2. **`toUserDto` adapter added** (beyond spec): auth responses return `AuthUserDto` (no subscription/favorites); the store needs `UserDto` — adapter fills `favoriteGenres: []`, `subscription: null`. Used at 6 call sites.
3. **`BookDto.subscriptionRequired` cast at API boundary**: D1 column is free-text `text()` → `string`; cast to `SubscriptionTier` documents the canonical set (seed only uses canonical values).
4. **`ActiveBookProgress.bookCoverUrl` widened** to `string | null` (matches `ReadingProgressRecentDto`).
5. **LibraryScreen query now typed** `BookItemDto[] | { items? }` with runtime bare-array guard — fixes the empty Library bug AND gives `books` a real type.

## Commits
- Not committed yet — changes span `packages/shared-types`, `apps/mobile` (~15 files), `apps/web/lib/subscription.ts`, `apps/api` (3 route files), docs. Suggested commit: `refactor: shared-types as real DTO contract + fix library/book-picker bugs`.
