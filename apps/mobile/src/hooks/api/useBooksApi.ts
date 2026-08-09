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
