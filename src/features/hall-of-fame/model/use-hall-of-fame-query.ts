import { useQuery } from '@tanstack/react-query';
import { getHallOfFame } from '../api/hall-of-fame-api';
import type { HallOfFameData } from '../types';

export const HALL_OF_FAME_KEYS = {
  all: ['hallOfFame'] as const,
  detail: () => [...HALL_OF_FAME_KEYS.all, 'detail'] as const,
} as const;

/**
 * 명예의 전당 정보 조회 훅
 */
export const useHallOfFameQuery = () => {
  return useQuery<HallOfFameData>({
    queryKey: HALL_OF_FAME_KEYS.detail(),
    queryFn: getHallOfFame,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
};

