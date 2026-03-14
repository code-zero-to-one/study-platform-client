'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminMentoringMentors } from '@/features/mentoring/api/mentoring-lifecycle-api';
import { mentoringLifecycleQueryKeys } from '@/features/mentoring/model/mentoring-lifecycle-query-keys';
import type {
  AdminMentorItem,
  MentorOperationStatus,
  MentorScreeningStatus,
} from '@/types/mentoring/admin-domain';

const EMPTY_PAGE = {
  items: [] as AdminMentorItem[],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

export const useAdminMentoringMentorsQuery = ({
  page = 0,
  size = 20,
  mentorId,
  screeningStatus,
  operationStatus,
  enabled = true,
}: {
  page?: number;
  size?: number;
  mentorId?: number;
  screeningStatus?: MentorScreeningStatus;
  operationStatus?: MentorOperationStatus;
  enabled?: boolean;
} = {}) => {
  const mentorsQuery = useQuery({
    queryKey: mentoringLifecycleQueryKeys.adminMentors({
      page,
      size,
      mentorId,
      screeningStatus,
      operationStatus,
    }),
    queryFn: () =>
      getAdminMentoringMentors({
        page,
        size,
        mentorId,
        screeningStatus,
        operationStatus,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });

  return {
    hasHydrated: !mentorsQuery.isLoading,
    pageData: mentorsQuery.data ?? EMPTY_PAGE,
    mentors: mentorsQuery.data?.items ?? EMPTY_PAGE.items,
    isLoading: mentorsQuery.isLoading,
    isFetching: mentorsQuery.isFetching,
    isError: mentorsQuery.isError,
    error: mentorsQuery.error,
    refetch: mentorsQuery.refetch,
  };
};
