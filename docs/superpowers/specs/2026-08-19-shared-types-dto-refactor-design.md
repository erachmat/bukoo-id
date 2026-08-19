# Design Document: Shared Types — Make `@bukoo/shared-types` the Real DTO Contract

**Date**: 2026-08-19
**Status**: Draft — pending user approval
**Target Workspaces**: `packages/shared-types`, `@bukoo/mobile`, `@bukoo/web`, `@bukoo/api`
**Related**: Roadmap "BUKOO Tech-Debt Cleanup & Performance" (Task 4 — Phase B, the highest-leverage
task; blocks Tasks 5 & 8). Supersedes the stale types written for the old Prisma/Neon stack.

---

## 1. Executive Summary

`packages/shared-types` today exports stale, aspirational types (`User`, `Book`, `ReadingProgress`,
`Subscription`, `SubscriptionTier`, `TIER_ORDER`) that **nobody imports** — except `isBookAccessible`.
Meanwhile every app defines its own **duplicated** DTO types that drift from the API's real responses
(mobile: `BookItemDto`, `Community*Dto`, `UserPublicDto`, …; web: `Tier`, `CatalogBook`).

Goal: rewrite `@bukoo/shared-types` as the **single source of truth** for DTOs — each type extracted
verbatim from the API's actual responses (`formatBook`, `serializeUser`, `toUserPublic`, community
DTOs, reading DTOs) — then **adopt it** in mobile (`services/api.ts`, `authStore`), web
(`lib/subscription.ts`), and the API (annotating the DTO builders). Fix the real contract bugs the
drift caused. **Zero behavior change except the two bug fixes** (Library empty bug, CreatePost book
picker empty bug) and removing dead code.

**Non-goals**: no schema/migration changes; no endpoint changes; no new features; Task 5 (API helper
consolidation) and Task 8 (web consolidation) are separate — this task only establishes the types and
adopts them where cheap; `CatalogBook` (web) stays local (it's a UI DTO over D1 rows, not an API DTO).

---

## 2. Discovery summary (all verified)

### 2.1 Current shared-types staleness
| Export | Verdict |
|---|---|
| `isBookAccessible` | ✅ live (6 web + 2 api import sites) — keep unchanged |
| `SubscriptionTier` (5 values) | ❌ never imported; **must add `'PREMIUM'`** (web `Tier` includes it, `TIER_ORDER` already lists it) |
| `TIER_ORDER` (6 values) | ❌ never imported; retype as `SubscriptionTier[]` |
| `User` / `Book` / `ReadingProgress` / `Subscription` | ❌ never imported; stale (API returns `coverKey`/`ratingAverage`/`role`/`favoriteGenres`/`subscription` object — none modeled) |

### 2.2 Mobile duplication (to eliminate via re-export from shared-types)
`services/api.ts`: `BookItemDto`, `FeaturedBooksResponseDto`, `ReadingProgressItemDto`,
`CommunityPostType`, `CommunityUserDto`, `CommunityBookDto`, `CommunityPostDto`,
`CommunityPostsPageDto`, `CommunityCommentDto`, `CommunityEventDto`.
`stores/authStore.ts`: `UserPublicDto` (has dead `subscriptionTier` field — **never returned by any
API endpoint**), `UserSubscriptionDto`.

### 2.3 Real contract bugs found (fix in this task)
1. **`LibraryScreen.tsx:71`** — `GET /books` returns a **bare array**, but code reads
   `response.data.items || []` → **always `[]`** → Library tab is permanently empty.
2. **`CreatePostModal.tsx:51`** — same: `res.data.items || []` from `GET /books` → **book picker always empty**.
3. **`ProfileScreen.tsx` (goal modal)** — reads `goalsData?.goal?.dailyGoalMinutes` but `GET /goals`
   returns a raw row `{ id, userId, dailyGoalMinutes }` → always falls back to `'30'`.
4. **`ReadingGoalsWidget.tsx`** — reads `data.goal`/`data.todayProgress` (don't exist) **and is
   dead code** (only self-reference; live component is `ReadingGoalCard`) + has fake default
   `activeBookTitle = 'The Art of War'` → **delete the file**.

### 2.4 Casts to remove (5 sites)
`b as { coverKey?: string | null }` in `AiCompanionScreen.tsx:36`, `RelatedBooksCarousel.tsx:24`,
`HomeScreen.tsx:81`, `SearchScreen.tsx:64`, `SearchScreen.tsx:68` — all paired with
`b.coverUrl` (which doesn't exist on the API DTO). Once `BookDto` has `coverKey`, these become
`getCoverUrl(b.coverKey) || ''`.

### 2.5 `subscriptionTier` consumers to fix (3 sites)
`AiCompanionScreen.tsx:24`, `ProfileScreen.tsx:101` (`user?.subscriptionTier || 'FREE'` — dead
branch), `userProfileService.ts:74` (builds the field).

### 2.6 Wiring (already in place)
All 3 apps depend on `@bukoo/shared-types` (`"*"`). API has a tsconfig path alias → **source**;
mobile + web resolve via **`dist/`** (package `main`/`types`) → **rebuild `dist` after editing source**.
Mobile has no tsconfig paths alias; web uses `transpilePackages`.

---

## 3. Component Specs

### 3.1 `packages/shared-types/src/index.ts` — rewrite (full new content)

```ts
/** Canonical subscription tier values — must match D1 `subscriptionRequired` column + web Tier. */
export type SubscriptionTier = 'FREE' | 'PELAJAR' | 'PERSONAL' | 'PLUS' | 'FAMILY' | 'PREMIUM';

/** Ordered from lowest to highest access. */
export const TIER_ORDER: SubscriptionTier[] = ['FREE', 'PELAJAR', 'PERSONAL', 'PLUS', 'FAMILY', 'PREMIUM'];

/** True if userTier grants access to a book requiring `requiredTier`. (unchanged) */
export function isBookAccessible(userSubscriptionTier: string | null | undefined, bookRequiredTier: string): boolean { /* keep */ }

// ── Books ────────────────────────────────────────────────────────────────
/** Exact shape of `formatBook()` in apps/api/src/routes/books.ts (all book routes). */
export interface BookDto {
  id: string; title: string; author: string;
  publisher: string; description: string; synopsis: string;
  coverKey: string | null;          // R2 key — URL built client-side via getCoverUrl()
  epubKey: string | null;
  genre: string[]; tags: string[]; language: string;
  publishedYear: number; totalPages: number;
  ratingAverage: number; ratingCount: number; readCount: number; readTimeMinutes: number;
  isPublished: boolean;
  subscriptionRequired: SubscriptionTier;
  createdAt: string; updatedAt: string;
  is_accessible: boolean;           // snake_case — part of the real payload
  progress_percent: number;
  shelf_status: string | null;
}
export interface BookFeaturedResponse {
  continue_reading: BookDto[]; editors_choice: BookDto[]; trending: BookDto[]; new_releases: BookDto[];
}
export interface BookRecommendationDto extends BookDto { matchPercent: number; isGenreMatch: boolean; aiReason: string; }

// ── Users ────────────────────────────────────────────────────────────────
/** Shape of the user object in /v1/auth/* responses (toUserPublic). */
export interface AuthUserDto {
  id: string; name: string; email: string; avatarUrl: string | null;
  role: string; onboardingCompleted: boolean; createdAt: string;
}
export interface UserSubscriptionDto {
  active: boolean; tier: string; planId: string;
  expiresAt: string | null; status: string; paymentGateway: string | null;
}
/** Shape of GET/PATCH /v1/users/me (serializeUser). */
export interface UserDto extends AuthUserDto {
  favoriteGenres: string[];
  subscription: UserSubscriptionDto | null;
}

// ── Reading ──────────────────────────────────────────────────────────────
/** Flat recent-progress item from GET /v1/reading/recent (+ GET /v1/reading/progress). */
export interface ReadingProgressRecentDto {
  bookId: string; bookTitle: string; bookAuthor: string;
  bookCoverUrl: string | null;       // resolved URL (buildCoverUrl)
  progressPercent: number; currentPage: number; totalPages: number; lastReadAt: string;
}
/** Raw reading_progress row (GET /v1/reading/progress/:bookId). */
export interface ReadingProgressRowDto {
  id: string; userId: string; bookId: string;
  progressPercent: number; currentPage: number; totalPages: number;
  cfiPosition: string | null; readingTimeMinutes: number; readingTimeSeconds: number;
  lastReadAt: string; updatedAt: string;
}
export interface HighlightDto {
  id: string; userId: string; bookId: string; cfiRange: string; text: string;
  color: string; note: string | null; createdAt: string; updatedAt: string;
}
export interface BookmarkDto {
  id: string; userId: string; bookId: string; cfi: string;
  chapterTitle: string | null; progress: number | null; createdAt: string;
}

// ── Goals ────────────────────────────────────────────────────────────────
export interface GoalDto { id: string; userId: string; dailyGoalMinutes: number; }
export interface StreakRowDto { id: string; userId: string; date: string; minutesRead: number; goalMet: boolean; }
export interface RecordGoalResponseDto { date: string; minutesRead: number; goalMet: boolean; }
export interface CurrentStreakDto { currentStreak: number; }
export interface BooksThisYearDto { booksReadThisYear: number; }

// ── Community ────────────────────────────────────────────────────────────
export type CommunityPostType = 'REVIEW' | 'QUOTE' | 'DISCUSSION' | 'RECOMMENDATION';
export interface CommunityUserDto { id: string; name: string; avatarUrl: string | null; }
export interface CommunityBookDto { id: string; title: string; author: string; coverUrl: string | null; }
export interface CommunityPostDto {
  id: string; type: CommunityPostType; content: string; bookId: string | null;
  likeCount: number; commentCount: number; bookmarkCount: number;
  likedByMe: boolean; bookmarkedByMe: boolean; createdAt: string;
  user: CommunityUserDto; book: CommunityBookDto | null;
}
export interface CommunityPostsPageDto { items: CommunityPostDto[]; nextCursor: string | null; }
export interface CommunityCommentDto { id: string; content: string; createdAt: string; user: CommunityUserDto; }
export interface CommunityEventDto {
  id: string; title: string; description: string | null; bookId: string | null;
  startDate: string; endDate: string; targetProgressPercent: number;
  joinCount: number; joinedByMe: boolean; book: CommunityBookDto | null;
}
```
`dist/` is rebuilt via `npm run build` in `packages/shared-types`.

### 3.2 Mobile — `services/api.ts` re-export shared DTOs
- Replace all local DTO definitions with imports from `@bukoo/shared-types` and **re-export them
  under the existing local names** so the ~15 importer files compile unchanged:
  `export type { BookDto as BookItemDto, BookFeaturedResponse as FeaturedBooksResponseDto, ReadingProgressRecentDto as ReadingProgressItemDto, CommunityPostType, CommunityPostDto, CommunityUserDto, CommunityBookDto, CommunityPostsPageDto, CommunityCommentDto, CommunityEventDto } from '@bukoo/shared-types'`
- Fix `AuthResponseDto` → `{ accessToken; refreshToken; expiresIn: number; user: AuthUserDto }`
  (add `expiresIn`, use shared `AuthUserDto`); `RegisterResponseDto.user: AuthUserDto`.
- Keep local request types (`LoginData`, `RegisterData`, `SocialLoginData`, `SearchFilterParams`) —
  they are client-side, not server DTOs.

### 3.3 Mobile — `stores/authStore.ts` + consumers
- Remove local `UserPublicDto`/`UserSubscriptionDto`; `user: UserDto | null` from shared-types.
- `userProfileService.ts`: `updateProfile` builds `UserDto` (drop `subscriptionTier`; carry
  `subscription` from current user).
- Fix the 2 dead branches: `AiCompanionScreen.tsx:24` + `ProfileScreen.tsx:101` →
  `user?.subscription?.active ? user.subscription.tier : 'FREE'`.

### 3.4 Mobile — remove `coverKey` casts (5 sites)
- `AiCompanionScreen:36`, `RelatedBooksCarousel:24`, `HomeScreen:81`, `SearchScreen:64+68`:
  `getCoverUrl((b as { coverKey?: string | null }).coverKey) || b.coverUrl || ''`
  → `getCoverUrl(b.coverKey) || ''` (BookDto now has `coverKey`; no `coverUrl`).

### 3.5 Mobile — fix contract bugs
- `LibraryScreen.tsx:71`: `return response.data.items || []` → `return Array.isArray(response.data) ? response.data : (response.data?.items ?? [])` (**fixes empty Library**).
- `CreatePostModal.tsx:51`: same guard for the book picker (**fixes empty picker**).
- `ProfileScreen.tsx` (goal modal): `goalsData?.goal?.dailyGoalMinutes?.toString() || '30'` → `goalsData?.dailyGoalMinutes?.toString() || '30'`.
- **Delete dead `ReadingGoalsWidget.tsx`** (contract bug + fake `'The Art of War'` + unused).

### 3.6 Web — `lib/subscription.ts` adopts shared tiers
- `import { isBookAccessible, type SubscriptionTier } from '@bukoo/shared-types'` (already imports `isBookAccessible`).
- `type Tier = SubscriptionTier` (drop the local union — shared now includes `'PREMIUM'`).
- `tierFromSubscription(...): SubscriptionTier` (logic unchanged).
- `CatalogBook` in `book-mapper.ts` stays local (UI DTO over D1 rows) — noted, no change.

### 3.7 API — annotate DTO builders with shared types
- `books.ts`: `function formatBook(...): BookDto` (import type).
- `users.ts`: `function serializeUser(...): UserDto`.
- `auth.ts`: `function toUserPublic(...): AuthUserDto`.
- (Community/reading route-level annotation deferred to Task 5 — shapes are captured in
  shared-types and enforced on the mobile side here.)

### 3.8 Rebuild + wire check
- Run `npm run build` in `packages/shared-types` (regenerate `dist/` for mobile + web).
- No new wiring needed (deps + aliases already in place).

---

## 4. Layout / Styling Tokens
- N/A — types only.

---

## 5. Verification Plan
Per AGENTS.md, for **every touched workspace**:
1. `packages/shared-types`: `npm run build` (dist regenerated) + `npm run typecheck`.
2. `apps/api`: `npx tsc --noEmit`; `npm run lint`; `npm run test` (14 tests must pass).
3. `apps/mobile`: `npx tsc --noEmit`; `npm run lint`; `npm run test` — no test script (state explicitly).
4. `apps/web`: `npx tsc --noEmit`; `npm run lint`; `npm run test` — no test script (state explicitly).

Additional manual checks:
- Grep `apps/mobile/src/services/api.ts` for `^export interface (BookItemDto|…|CommunityEventDto)` → 0 (now re-exports).
- Grep `apps/mobile/src` for `subscriptionTier|as \{ coverKey|data\.goal|todayProgress` → 0 hits.
- Grep `apps/mobile/src` for `ReadingGoalsWidget` → 0 hits.
- Grep `apps/web/src/lib/subscription.ts` for `type Tier =` → only alias to `SubscriptionTier`.
- `dist/` of shared-types contains the new types (`node -e` import or grep `dist/index.d.ts` for `BookDto`).

---

## 6. Decision Log
| Decision | Choice | Rationale |
|---|---|---|
| `SubscriptionTier` | Add `'PREMIUM'` (6 values) | Matches web `Tier` + existing `TIER_ORDER`; lets web alias directly |
| Mobile DTO names | Re-export shared types under current local names | Zero importer churn; single source in shared-types |
| `BookDto.coverUrl` | **Not present** (only `coverKey`) | Matches API; cover URLs are always derived via `getCoverUrl()` |
| `UserDto` | Drops dead `subscriptionTier` | Field never returned by any endpoint; branches replaced with `'FREE'` fallback |
| Library / CreatePost empty bugs | Fix to bare-array handling | Direct consequence of contract drift; restores Library + book picker |
| `ReadingGoalsWidget.tsx` | Delete | Dead code + wrong shape + fake default |
| Web `CatalogBook` | Keep local | UI DTO over D1 rows; not an API DTO |
| API annotation | 3 builder functions only | `formatBook`/`serializeUser`/`toUserPublic`; community/reading annotation deferred to Task 5 |
