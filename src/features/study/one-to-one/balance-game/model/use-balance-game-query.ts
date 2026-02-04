import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import { BALANCE_GAME_QUERY_KEYS } from '@/features/study/one-to-one/balance-game/model/balance-game-keys';
import {
  getBalanceGameComments,
  getBalanceGameDetail,
  getBalanceGameList,
  getBalanceGameTagSuggestions,
} from '../api/balance-game-api';

export const useBalanceGameListQuery = (
  sort: 'latest' | 'popular' = 'latest',
  status?: 'active' | 'closed',
  tags?: string[],
  q?: string,
  options?: {
    initialPage?: Awaited<ReturnType<typeof getBalanceGameList>>;
  },
) => {
  return useInfiniteQuery({
    queryKey: BALANCE_GAME_QUERY_KEYS.list({ sort, status, tags, q }),
    queryFn: ({ pageParam = 1 }) =>
      getBalanceGameList({ page: pageParam, size: 10, sort, status, tags, q }),
    placeholderData: keepPreviousData,
    getNextPageParam: (lastPage) => {
      // lastPage가 유효하고 pageable 정보가 있는지 확인
      if (
        !lastPage ||
        !lastPage.pageable ||
        typeof lastPage.totalPages !== 'number'
      ) {
        return undefined;
      }

      // Spring Data Page의 pageable.pageNumber는 0-based
      // 백엔드 API는 page 파라미터를 1-based로 받지만, 내부적으로 0-based로 변환
      // 예: 요청 page=1 → 내부 page=0 → 응답 pageable.pageNumber=0
      //     요청 page=2 → 내부 page=1 → 응답 pageable.pageNumber=1
      const currentPageNumber = lastPage.pageable.pageNumber; // 0-based
      const totalPages = lastPage.totalPages;

      // 다음 페이지가 존재하는지 확인 (0-based 기준)
      // currentPageNumber는 0-based이므로, totalPages와 비교할 때는 +1 해서 비교
      if (currentPageNumber + 1 < totalPages) {
        // 다음 페이지를 1-based로 요청해야 하므로, 0-based + 1 + 1 = +2
        return currentPageNumber + 2;
      }

      return undefined;
    },
    initialPageParam: 1, // 백엔드는 1부터 시작
    initialData: options?.initialPage
      ? { pages: [options.initialPage], pageParams: [1] }
      : undefined,
  });
};

export const useBalanceGameDetailQuery = (gameId: number) => {
  return useQuery({
    queryKey: BALANCE_GAME_QUERY_KEYS.detail(gameId),
    queryFn: () => getBalanceGameDetail(gameId),
    enabled: !!gameId,
  });
};

export const useBalanceGameCommentsQuery = (
  gameId: number,
  options?: { enabled?: boolean },
) => {
  return useInfiniteQuery({
    queryKey: BALANCE_GAME_QUERY_KEYS.comments(gameId),
    queryFn: ({ pageParam = 0 }) =>
      getBalanceGameComments(gameId, { page: pageParam, size: 10 }),
    getNextPageParam: (lastPage) => {
      // lastPage가 유효하고 pageable 정보가 있는지 확인
      if (
        !lastPage ||
        !lastPage.pageable ||
        typeof lastPage.totalPages !== 'number'
      ) {
        return undefined;
      }

      const currentPage = lastPage.pageable.pageNumber;
      const totalPages = lastPage.totalPages;

      // 다음 페이지가 존재하는지 확인 (현재 페이지 + 1 < 전체 페이지 수)
      if (currentPage + 1 < totalPages) {
        return currentPage + 1;
      }

      return undefined;
    },
    initialPageParam: 0,
    enabled: !!gameId && options?.enabled !== false,
  });
};

export const useBalanceGameTagSuggestionsQuery = (
  query: string,
  options?: {
    limit?: number;
    enabled?: boolean;
    minLength?: number;
    sort?: 'popular' | 'alphabetical';
  },
) => {
  const limit = options?.limit ?? 10;
  const minLength = options?.minLength ?? 1;
  const sort = options?.sort ?? 'popular';
  const enabled = options?.enabled ?? query.trim().length >= minLength;

  return useQuery({
    queryKey: BALANCE_GAME_QUERY_KEYS.tags(query, limit, minLength, sort),
    queryFn: () =>
      getBalanceGameTagSuggestions({ q: query, limit, minLength, sort }),
    enabled,
    staleTime: 60_000,
  });
};
