# Mobile Backend API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Bukoo Mobile React Native application (`apps/mobile`) to NestJS backend API endpoints (`apps/api`), replacing hardcoded JSON mock data with live React Query data hooks.

**Architecture:** Custom React Query hooks in `apps/mobile/src/hooks/api/` wrap `axios` calls from `api.ts`. Components consume these hooks with loading, error, and fallback states.

**Tech Stack:** React Native, Expo, TypeScript, `@tanstack/react-query`, Axios, NestJS.

## Global Constraints

- TypeScript strict mode — no `any` types.
- Format with Prettier/ESLint rules.
- Follow verification workflow: run `npm run typecheck --workspace=apps/mobile`, `npm run lint --workspace=apps/mobile`, and `npm run test --workspace=apps/mobile`.

---

### Task 1: API Services & Custom React Query Hooks for Books

**Files:**
- Modify: [apps/mobile/src/services/api.ts](file:///home/erachmat/Projects/bukoo/apps/mobile/src/services/api.ts)
- Create: `apps/mobile/src/hooks/api/useBooksApi.ts`

**Interfaces:**
- Consumes: [api.ts](file:///home/erachmat/Projects/bukoo/apps/mobile/src/services/api.ts)
- Produces: `useFeaturedBooks()`, `useSearchBooks(query)`, `useGenreBooks(genre)`

- [ ] **Step 1: Add booksApi service methods in `api.ts`**

Add `booksApi` object to `api.ts`:
```typescript
export interface BookItemDto {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  publisher?: string;
  synopsis?: string;
  ratingAverage?: number;
  ratingCount?: number;
  subscriptionRequired?: string;
  is_accessible?: boolean;
}

export interface FeaturedBooksResponseDto {
  continue_reading: BookItemDto[];
  editors_choice: BookItemDto[];
  trending: BookItemDto[];
  new_releases: BookItemDto[];
}

export const booksApi = {
  getFeatured: async (): Promise<FeaturedBooksResponseDto> => {
    const res = await api.get<FeaturedBooksResponseDto>('/books/featured');
    return res.data;
  },
  search: async (query: string): Promise<BookItemDto[]> => {
    if (!query.trim()) return [];
    const res = await api.get<{ items: BookItemDto[] } | BookItemDto[]>(`/books/search?q=${encodeURIComponent(query)}`);
    return Array.isArray(res.data) ? res.data : (res.data.items || []);
  },
  getByGenre: async (genre: string): Promise<BookItemDto[]> => {
    const res = await api.get<BookItemDto[]>(`/books?genre=${encodeURIComponent(genre)}`);
    return res.data;
  },
};
```

- [ ] **Step 2: Create `apps/mobile/src/hooks/api/useBooksApi.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { booksApi, FeaturedBooksResponseDto, BookItemDto } from '../../services/api';

export function useFeaturedBooks() {
  return useQuery<FeaturedBooksResponseDto>({
    queryKey: ['books', 'featured'],
    queryFn: booksApi.getFeatured,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchBooks(query: string) {
  return useQuery<BookItemDto[]>({
    queryKey: ['books', 'search', query],
    queryFn: () => booksApi.search(query),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useGenreBooks(genre: string) {
  return useQuery<BookItemDto[]>({
    queryKey: ['books', 'genre', genre],
    queryFn: () => booksApi.getByGenre(genre),
    enabled: genre.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
```

- [ ] **Step 3: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/services/api.ts apps/mobile/src/hooks/api/useBooksApi.ts
git commit -m "feat(mobile): add booksApi service and custom React Query hooks"
```

---

### Task 2: Connect `HomeScreen.tsx` to Live Backend API

**Files:**
- Modify: [apps/mobile/src/screens/home/HomeScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/home/HomeScreen.tsx)

**Interfaces:**
- Consumes: `useFeaturedBooks` from `apps/mobile/src/hooks/api/useBooksApi.ts`
- Produces: Live feed rendering on `HomeScreen` with fallback to default books if API is empty/unreachable.

- [ ] **Step 1: Integrate `useFeaturedBooks` into `HomeScreen.tsx`**

Import `useFeaturedBooks` and update `HomeScreen`:
```typescript
import { useFeaturedBooks } from '../../hooks/api/useBooksApi';

// Inside HomeScreen component:
const { data: featuredData, isLoading, refetch } = useFeaturedBooks();

const displayTrending = featuredData?.trending && featuredData.trending.length > 0 
  ? featuredData.trending 
  : sampleTrending;

const displayHero = featuredData?.editors_choice && featuredData.editors_choice.length > 0
  ? featuredData.editors_choice[0]
  : null;
```

- [ ] **Step 2: Add RefreshControl for pull-to-refresh on `HomeScreen`**

In `<ScrollView>` add:
```typescript
refreshControl={
  <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[COLORS.gold]} tintColor={COLORS.gold} />
}
```

- [ ] **Step 3: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/screens/home/HomeScreen.tsx
git commit -m "feat(mobile): connect HomeScreen to live featured books API"
```

---

### Task 3: Connect `SearchScreen.tsx` to Live Search & Category API

**Files:**
- Modify: [apps/mobile/src/screens/search/SearchScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/search/SearchScreen.tsx)

**Interfaces:**
- Consumes: `useSearchBooks`, `useGenreBooks` from `apps/mobile/src/hooks/api/useBooksApi.ts`
- Produces: Dynamic search and category filtering in `SearchScreen`.

- [ ] **Step 1: Update `SearchScreen.tsx` to use `useSearchBooks` and `useGenreBooks`**

Replace local queries with custom hooks:
```typescript
import { useSearchBooks, useGenreBooks } from '../../hooks/api/useBooksApi';

const { data: searchResults, isLoading: isSearching } = useSearchBooks(searchQuery);
const { data: genreResults } = useGenreBooks(selectedCategory);
```

- [ ] **Step 2: Connect results display to API data**

Use `searchResults` or `genreResults` with fallback to `exploreBooks` / `originalBooks` when empty.

- [ ] **Step 3: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/screens/search/SearchScreen.tsx
git commit -m "feat(mobile): connect SearchScreen to live backend search and genre API"
```

---

### Task 4: API Services & Hooks for User Library & Stats

**Files:**
- Modify: [apps/mobile/src/services/api.ts](file:///home/erachmat/Projects/bukoo/apps/mobile/src/services/api.ts)
- Create: `apps/mobile/src/hooks/api/useLibraryApi.ts`
- Modify: [apps/mobile/src/screens/library/LibraryScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/library/LibraryScreen.tsx)

**Interfaces:**
- Consumes: `GET /reading/progress`, `GET /users/me`
- Produces: Dynamic active reading card & user stats in `LibraryScreen`.

- [ ] **Step 1: Add `libraryApi` methods to `api.ts`**

```typescript
export interface ReadingProgressItemDto {
  bookId: string;
  bookTitle: string;
  bookCoverUrl?: string;
  progressPercent: number;
  lastReadAt: string;
}

export const libraryApi = {
  getReadingProgress: async (): Promise<ReadingProgressItemDto[]> => {
    const res = await api.get<ReadingProgressItemDto[]>('/reading/progress');
    return res.data;
  },
};
```

- [ ] **Step 2: Create `apps/mobile/src/hooks/api/useLibraryApi.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { libraryApi, ReadingProgressItemDto } from '../../services/api';

export function useUserLibrary() {
  return useQuery<ReadingProgressItemDto[]>({
    queryKey: ['library', 'progress'],
    queryFn: libraryApi.getReadingProgress,
    staleTime: 2 * 60 * 1000,
  });
}
```

- [ ] **Step 3: Connect `LibraryScreen.tsx` to `useUserLibrary`**

Import and consume `useUserLibrary()` in `LibraryScreen.tsx`.

- [ ] **Step 4: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/services/api.ts apps/mobile/src/hooks/api/useLibraryApi.ts apps/mobile/src/screens/library/LibraryScreen.tsx
git commit -m "feat(mobile): connect LibraryScreen to user reading progress API"
```

---

### Task 5: Final Workspaces Verification & Checklist Run

**Files:** None (Verification phase)

- [ ] **Step 1: Run typecheck**
Run: `npm run typecheck --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run lint**
Run: `npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 3: Run test**
Run: `npm run test --workspace=apps/mobile`
Expected: Verified output ("No tests specified for mobile yet").
