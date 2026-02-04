import { useQuery } from '@tanstack/react-query';
import { getArchiveSearchSuggestions } from '@/features/study/one-to-one/archive/api/get-archive-search-suggestions';
import { ARCHIVE_QUERY_KEYS } from '@/features/study/one-to-one/archive/model/archive-keys';

export const useArchiveSearchSuggestionsQuery = (
  query: string,
  options?: {
    size?: number;
    minLength?: number;
    enabled?: boolean;
  },
) => {
  const size = options?.size ?? 10;
  const minLength = options?.minLength ?? 1;
  const enabled = options?.enabled ?? query.trim().length >= minLength;

  return useQuery({
    queryKey: ARCHIVE_QUERY_KEYS.searchSuggestionList({
      q: query,
      size,
      minLength,
    }),
    queryFn: () => getArchiveSearchSuggestions({ q: query, size, minLength }),
    enabled,
    staleTime: 60_000,
  });
};
