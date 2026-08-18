import { useQuery } from '@tanstack/react-query';
import { booksApi, FeaturedBooksResponseDto, BookItemDto, SearchFilterParams } from '../../services/api';

export function useFeaturedBooks() {
  return useQuery<FeaturedBooksResponseDto>({
    queryKey: ['books', 'featured'],
    queryFn: booksApi.getFeatured,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchBooks(paramsOrQuery: string | SearchFilterParams) {
  const queryStr = typeof paramsOrQuery === 'string' ? paramsOrQuery : paramsOrQuery.query || '';
  const filterKey = typeof paramsOrQuery === 'string' ? paramsOrQuery : JSON.stringify(paramsOrQuery);

  return useQuery<BookItemDto[]>({
    queryKey: ['books', 'search', filterKey],
    queryFn: () => booksApi.search(paramsOrQuery),
    enabled: queryStr.trim().length > 0 || (typeof paramsOrQuery !== 'string' && Boolean(paramsOrQuery.genre || paramsOrQuery.tier)),
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

export function useRecommendedBooks() {
  return useQuery<(BookItemDto & { matchPercent?: number; aiReason?: string })[]>({
    queryKey: ['books', 'recommendations'],
    queryFn: booksApi.getRecommendations,
    staleTime: 10 * 60 * 1000,
  });
}
