'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getMyMentoringDashboard } from '@/features/mentoring/api/mentoring-lifecycle-api';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import { mentoringLifecycleQueryKeys } from './mentoring-lifecycle-query-keys';

const groupByMentorId = <T extends { mentorId: number }>(items: T[]) => {
  return items.reduce<Record<number, T[]>>((accumulator, item) => {
    const currentItems = accumulator[item.mentorId] ?? [];

    accumulator[item.mentorId] = [...currentItems, item];

    return accumulator;
  }, {});
};

export const useMyMentoringDashboardQuery = ({
  enabled = true,
  page = 0,
  size = 100,
}: {
  enabled?: boolean;
  page?: number;
  size?: number;
} = {}) => {
  const dashboardQuery = useQuery({
    queryKey: mentoringLifecycleQueryKeys.myDashboard({ page, size }),
    queryFn: () => getMyMentoringDashboard({ page, size }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled,
  });

  const requestsByMentor = useMemo<Record<number, MentoringRequest[]>>(() => {
    const requests =
      dashboardQuery.data?.items.map((item) => item.request) ?? [];

    return groupByMentorId(requests);
  }, [dashboardQuery.data?.items]);

  const sessionsByMentor = useMemo<Record<number, MentoringSession[]>>(() => {
    const sessions =
      dashboardQuery.data?.items
        .map((item) => item.session)
        .filter((session): session is MentoringSession => Boolean(session)) ??
      [];

    return groupByMentorId(sessions);
  }, [dashboardQuery.data?.items]);

  const reviewsByMentor = useMemo<Record<number, MentoringReview[]>>(() => {
    const reviews =
      dashboardQuery.data?.items
        .map((item) => item.review)
        .filter((review): review is MentoringReview => Boolean(review)) ?? [];

    return groupByMentorId(reviews);
  }, [dashboardQuery.data?.items]);

  return {
    data: dashboardQuery.data,
    error: dashboardQuery.error,
    isError: dashboardQuery.isError,
    isFetching: dashboardQuery.isFetching,
    isLoading: dashboardQuery.isLoading,
    isSuccess: dashboardQuery.isSuccess,
    refetch: dashboardQuery.refetch,
    requestsByMentor,
    sessionsByMentor,
    reviewsByMentor,
  };
};
