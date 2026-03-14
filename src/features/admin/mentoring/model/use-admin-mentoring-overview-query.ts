'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminMentoringOverview } from '@/features/mentoring/api/mentoring-lifecycle-api';
import { mentoringLifecycleQueryKeys } from '@/features/mentoring/model/mentoring-lifecycle-query-keys';
import type { AdminMentoringDashboardMetrics } from '@/types/mentoring/admin-domain';

const EMPTY_METRICS: AdminMentoringDashboardMetrics = {
  registeredMentorCount: 0,
  pendingScreeningCount: 0,
  inReviewScreeningCount: 0,
  approvedMentorCount: 0,
  rejectedMentorCount: 0,
  pendingRequestCount: 0,
  scheduledSessionCount: 0,
  completedReviewCount: 0,
};

export const useAdminMentoringOverviewQuery = () => {
  const overviewQuery = useQuery({
    queryKey: mentoringLifecycleQueryKeys.adminMetrics(),
    queryFn: () => getAdminMentoringOverview(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  return {
    hasHydrated: !overviewQuery.isLoading,
    metrics: overviewQuery.data ?? EMPTY_METRICS,
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching,
    isError: overviewQuery.isError,
    error: overviewQuery.error,
  };
};
