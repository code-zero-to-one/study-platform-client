import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getBalanceGameComments,
  getBalanceGameDetail,
  getBalanceGameList,
} from '../api/balance-game-api';

export const BALANCE_GAME_KEYS = {
  all: ['balanceGames'] as const,
  lists: () => [...BALANCE_GAME_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...BALANCE_GAME_KEYS.lists(), filters] as const,
  details: () => [...BALANCE_GAME_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...BALANCE_GAME_KEYS.details(), id] as const,
  comments: (id: number) => [...BALANCE_GAME_KEYS.detail(id), 'comments'] as const,
};

export const useBalanceGameListQuery = (
  sort: 'latest' | 'popular' = 'latest',
  status?: 'active' | 'closed'
) => {
  return useInfiniteQuery({
    queryKey: BALANCE_GAME_KEYS.list({ sort, status }),
    queryFn: ({ pageParam = 0 }) =>
      getBalanceGameList({ page: pageParam, size: 10, sort, status }),
    getNextPageParam: (lastPage) => {
      // lastPage가 유효하고 pageable 정보가 있는지 확인 (방어 코드)
      if (lastPage && lastPage.pageable && lastPage.totalPages) {
        if (lastPage.pageable.pageNumber < lastPage.totalPages - 1) {
          return lastPage.pageable.pageNumber + 1;
        }
      }
      return undefined;
    },
    initialPageParam: 0,
  });
};

export const useBalanceGameDetailQuery = (gameId: number) => {
  return useQuery({
    queryKey: BALANCE_GAME_KEYS.detail(gameId),
    queryFn: () => getBalanceGameDetail(gameId),
    enabled: !!gameId,
  });
};

export const useBalanceGameCommentsQuery = (
  gameId: number,
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: BALANCE_GAME_KEYS.comments(gameId),
    queryFn: ({ pageParam = 0 }) =>
      getBalanceGameComments(gameId, { page: pageParam, size: 10 }),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.pageable && lastPage.totalPages) {
        if (lastPage.pageable.pageNumber < lastPage.totalPages - 1) {
          return lastPage.pageable.pageNumber + 1;
        }
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!gameId && (options?.enabled !== false),
  });
};
