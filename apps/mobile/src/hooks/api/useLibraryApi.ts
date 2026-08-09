import { useQuery } from '@tanstack/react-query';
import { libraryApi, ReadingProgressItemDto } from '../../services/api';

export function useUserLibrary() {
  return useQuery<ReadingProgressItemDto[]>({
    queryKey: ['library', 'progress'],
    queryFn: libraryApi.getReadingProgress,
    staleTime: 2 * 60 * 1000,
  });
}
