# Task 1 Brief: API Services & Custom React Query Hooks for Books

**Task Goal**: Add `booksApi` methods to `apps/mobile/src/services/api.ts` and create `apps/mobile/src/hooks/api/useBooksApi.ts` providing `useFeaturedBooks()`, `useSearchBooks(query)`, and `useGenreBooks(genre)`.

**Files to modify/create**:
- Modify: `apps/mobile/src/services/api.ts`
- Create: `apps/mobile/src/hooks/api/useBooksApi.ts`

**Specifications**:
1. In `apps/mobile/src/services/api.ts`:
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

2. Create `apps/mobile/src/hooks/api/useBooksApi.ts`:
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

3. Verification:
Run `npm run typecheck --workspace=apps/mobile` and `npm run lint --workspace=apps/mobile`.

4. Commit:
Commit changes with `git commit -m "feat(mobile): add booksApi service and custom React Query hooks"`.
