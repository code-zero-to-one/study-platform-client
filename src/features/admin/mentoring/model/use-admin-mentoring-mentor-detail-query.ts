'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminMentoringMentorDetail } from '@/features/mentoring/api/mentoring-lifecycle-api';
import { mentoringLifecycleQueryKeys } from '@/features/mentoring/model/mentoring-lifecycle-query-keys';

export const useAdminMentoringMentorDetailQuery = ({
  mentorId,
  enabled = true,
  requestsPage = 0,
  requestsSize = 20,
  sessionsPage = 0,
  sessionsSize = 20,
  reviewsPage = 0,
  reviewsSize = 20,
}: {
  mentorId?: number;
  enabled?: boolean;
  requestsPage?: number;
  requestsSize?: number;
  sessionsPage?: number;
  sessionsSize?: number;
  reviewsPage?: number;
  reviewsSize?: number;
}) => {
  const detailQuery = useQuery({
    queryKey:
      typeof mentorId === 'number'
        ? mentoringLifecycleQueryKeys.adminMentorDetail(mentorId, {
            requestsPage,
            requestsSize,
            sessionsPage,
            sessionsSize,
            reviewsPage,
            reviewsSize,
          })
        : [...mentoringLifecycleQueryKeys.admin(), 'mentors', 'detail-empty'],
    queryFn: () =>
      getAdminMentoringMentorDetail({
        mentorId: mentorId as number,
        requestsPage,
        requestsSize,
        sessionsPage,
        sessionsSize,
        reviewsPage,
        reviewsSize,
      }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled: enabled && typeof mentorId === 'number',
  });

  return {
    data: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isFetching: detailQuery.isFetching,
    isError: detailQuery.isError,
    error: detailQuery.error,
    refetch: detailQuery.refetch,
  };
};
