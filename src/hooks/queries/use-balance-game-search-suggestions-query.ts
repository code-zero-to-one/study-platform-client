import { useQuery } from '@tanstack/react-query';
import { getBalanceGameSearchSuggestions } from '@/api/endpoints/balance-game/get-balance-game-search-suggestions';
import { BALANCE_GAME_QUERY_KEYS } from '@/hooks/queries/balance-game-keys';

export const useBalanceGameSearchSuggestionsQuery = (
  query: string,
  options?: {
    size?: number;
    minLength?: number;
    scope?: 'title' | 'author' | 'all';
    enabled?: boolean;
  },
) => {
  const size = options?.size ?? 10;
  const minLength = options?.minLength ?? 1;
  const scope = options?.scope ?? 'all';
  const enabled = options?.enabled ?? query.trim().length >= minLength;

  return useQuery({
    queryKey: BALANCE_GAME_QUERY_KEYS.searchSuggestionList({
      q: query,
      size,
      minLength,
      scope,
    }),
    queryFn: () =>
      getBalanceGameSearchSuggestions({ q: query, size, minLength, scope }),
    enabled,
    staleTime: 60_000,
  });
};
