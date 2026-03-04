import { GetArchiveParams } from '@/types/one-to-one-study/archive';

export const ARCHIVE_QUERY_KEYS = {
  all: ['archive'] as const,
  list: (params: GetArchiveParams) =>
    [...ARCHIVE_QUERY_KEYS.all, params] as const,
  searchSuggestions: () =>
    [...ARCHIVE_QUERY_KEYS.all, 'search-suggestions'] as const,
  searchSuggestionList: (params: {
    q: string;
    size: number;
    minLength: number;
  }) => [...ARCHIVE_QUERY_KEYS.searchSuggestions(), params] as const,
};
