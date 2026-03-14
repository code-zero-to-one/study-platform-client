'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getMentorWorkspace } from '@/features/mentoring/api/mentoring-lifecycle-api';
import type {
  MentoringReview,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import { mentoringLifecycleQueryKeys } from './mentoring-lifecycle-query-keys';

const dedupeById = <T extends { id: string }>(items: T[]) => {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
};

export const useMentorWorkspaceQuery = ({
  mentorId,
  enabled = true,
}: {
  mentorId?: number;
  enabled?: boolean;
}) => {
  const workspaceQuery = useQuery({
    queryKey: mentoringLifecycleQueryKeys.mentorWorkspace(mentorId),
    queryFn: () => getMentorWorkspace(),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled,
  });

  const allRequests = useMemo(() => {
    const noteRequests =
      workspaceQuery.data?.noteRequests.map((item) => item.request) ?? [];
    const reservationRequests =
      workspaceQuery.data?.reservationRequests.map((item) => item.request) ??
      [];

    return dedupeById([...noteRequests, ...reservationRequests]);
  }, [
    workspaceQuery.data?.noteRequests,
    workspaceQuery.data?.reservationRequests,
  ]);

  const allSessions = useMemo<MentoringSession[]>(() => {
    const directSessions = workspaceQuery.data?.sessions ?? [];
    const requestSessions =
      workspaceQuery.data?.reservationRequests
        .map((item) => item.session)
        .filter((session): session is MentoringSession => Boolean(session)) ??
      [];

    return dedupeById([...directSessions, ...requestSessions]);
  }, [workspaceQuery.data?.reservationRequests, workspaceQuery.data?.sessions]);

  const allReviews = useMemo<MentoringReview[]>(() => {
    const reservationReviews =
      workspaceQuery.data?.reservationRequests
        .map((item) => item.review)
        .filter((review): review is MentoringReview => Boolean(review)) ?? [];
    const noteReviews =
      workspaceQuery.data?.noteRequests
        .map((item) => item.review)
        .filter((review): review is MentoringReview => Boolean(review)) ?? [];

    return dedupeById([...reservationReviews, ...noteReviews]);
  }, [workspaceQuery.data?.noteRequests, workspaceQuery.data?.reservationRequests]);

  const reviewCount = allReviews.length;

  return {
    data: workspaceQuery.data
      ? {
          ...workspaceQuery.data,
          allRequests,
          allSessions,
          allReviews,
          reviewCount,
        }
      : undefined,
    allRequests,
    allSessions,
    allReviews,
    reviewCount,
    error: workspaceQuery.error,
    isError: workspaceQuery.isError,
    isFetched: workspaceQuery.isFetched,
    isFetching: workspaceQuery.isFetching,
    isLoading: workspaceQuery.isLoading,
    refetch: workspaceQuery.refetch,
  };
};
