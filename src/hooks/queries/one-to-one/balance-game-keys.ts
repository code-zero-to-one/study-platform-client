export const BALANCE_GAME_QUERY_KEYS = {
  all: ['balanceGames'] as const,
  lists: () => [...BALANCE_GAME_QUERY_KEYS.all, 'list'] as const,
  list: (filters: {
    sort: 'latest' | 'popular';
    status?: 'active' | 'closed';
    tags?: string[];
    q?: string;
  }) => [...BALANCE_GAME_QUERY_KEYS.lists(), filters] as const,
  details: () => [...BALANCE_GAME_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BALANCE_GAME_QUERY_KEYS.details(), id] as const,
  comments: (id: number) =>
    [...BALANCE_GAME_QUERY_KEYS.detail(id), 'comments'] as const,
  tags: (query: string, size: number, minLength: number, sort: string) =>
    [
      ...BALANCE_GAME_QUERY_KEYS.all,
      'tags',
      query,
      size,
      minLength,
      sort,
    ] as const,
  searchSuggestions: () =>
    [...BALANCE_GAME_QUERY_KEYS.all, 'search-suggestions'] as const,
  searchSuggestionList: (params: {
    q: string;
    size: number;
    minLength: number;
    scope: 'title' | 'author' | 'all';
  }) => [...BALANCE_GAME_QUERY_KEYS.searchSuggestions(), params] as const,
};
