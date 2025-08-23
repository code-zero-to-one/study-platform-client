import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getReservationMembers,
  getStudyStatus,
  mapReservation,
  StudyStatus,
} from '../api/get-participation-data';
import { WeeklyReservationResponse } from '../api/participation-types';

export function useInfiniteReservation(firstMemberId?: number, pageSize = 50) {
  return useInfiniteQuery({
    queryKey: ['weeklyReservationMembers', { firstMemberId, pageSize }],
    initialPageParam: { cursor: null as number | null },
    queryFn: async ({ pageParam }) => {
      return getReservationMembers({
        cursor: pageParam?.cursor ?? null,
        pageSize,
        firstMemberId,
      });
    },

    getNextPageParam: (lastPage?: WeeklyReservationResponse) => {
      if (lastPage?.members?.hasNext) {
        return { cursor: lastPage.members.nextCursor };
      }

      return undefined;
    },
    select: (data) => {
      const pages = data?.pages ?? [];
      const items = pages.flatMap((p) =>
        (p?.members?.items ?? []).map(mapReservation),
      );
      const total = pages[0]?.totalMemberCount ?? items.length;
      const last = pages[pages.length - 1];
      const hasNextPage = last?.members?.hasNext ?? false;

      return {
        items,
        total,
        hasNextPage,
      };
    },
    staleTime: 60 * 1000,
  });
}

export const useStudyStatus = () => {
  return useQuery<StudyStatus>({
    queryKey: ['studyStatus'],
    queryFn: getStudyStatus,
    staleTime: 60 * 1000,
  });
};
