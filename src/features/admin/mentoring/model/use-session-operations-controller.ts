'use client';

import dayjs from 'dayjs';
import { useQueries } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { getAdminMentoringMentorDetail } from '@/features/mentoring/api/mentoring-lifecycle-api';
import { mentoringLifecycleQueryKeys } from '@/features/mentoring/model/mentoring-lifecycle-query-keys';
import { useAdminMentoringMentorsQuery } from './use-admin-mentoring-mentors-query';
import type {
  SessionMentorFilter,
  SessionOperationsActions,
  SessionOperationsState,
  SessionOperationsViewModel,
  SessionRequestRow,
  SessionScheduleRow,
} from '@/types/mentoring/admin-session-operations-view';

export const useSessionOperationsController = ({
  initialMentorId,
}: {
  initialMentorId?: number;
}) => {
  const mentorsQuery = useAdminMentoringMentorsQuery({
    page: 0,
    size: 100,
  });
  const mentors = mentorsQuery.mentors;
  const [selectedMentorId, setSelectedMentorId] =
    useState<SessionMentorFilter>('ALL');

  useEffect(() => {
    if (mentors.length === 0) {
      setSelectedMentorId('ALL');

      return;
    }

    if (
      typeof initialMentorId === 'number' &&
      mentors.some((mentor) => mentor.mentorId === initialMentorId)
    ) {
      setSelectedMentorId(initialMentorId);

      return;
    }

    if (
      selectedMentorId !== 'ALL' &&
      !mentors.some((mentor) => mentor.mentorId === selectedMentorId)
    ) {
      setSelectedMentorId('ALL');
    }
  }, [initialMentorId, mentors, selectedMentorId]);

  const filteredMentors = useMemo(() => {
    if (selectedMentorId === 'ALL') {
      return mentors;
    }

    return mentors.filter((mentor) => mentor.mentorId === selectedMentorId);
  }, [mentors, selectedMentorId]);

  const mentorDetails = useQueries({
    queries: filteredMentors.map((mentor) => ({
      queryKey: mentoringLifecycleQueryKeys.adminMentorDetail(mentor.mentorId, {
        requestsPage: 0,
        requestsSize: 50,
        sessionsPage: 0,
        sessionsSize: 50,
        reviewsPage: 0,
        reviewsSize: 20,
      }),
      queryFn: () =>
        getAdminMentoringMentorDetail({
          mentorId: mentor.mentorId,
          requestsPage: 0,
          requestsSize: 50,
          sessionsPage: 0,
          sessionsSize: 50,
          reviewsPage: 0,
          reviewsSize: 20,
        }),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      enabled: mentorsQuery.hasHydrated,
    })),
  });

  const requestRows = useMemo<SessionRequestRow[]>(() => {
    return mentorDetails
      .flatMap((detailQuery) => {
        const detail = detailQuery.data;
        if (!detail) {
          return [] as SessionRequestRow[];
        }

        return detail.requestsPage.items.map((request) => ({
          mentorMemberId: detail.memberId,
          ...request,
        }));
      })
      .sort((first, second) => {
        return (
          dayjs(second.requestedAt).valueOf() -
          dayjs(first.requestedAt).valueOf()
        );
      });
  }, [mentorDetails]);

  const sessionRows = useMemo<SessionScheduleRow[]>(() => {
    return mentorDetails
      .flatMap((detailQuery) => {
        const detail = detailQuery.data;
        if (!detail) {
          return [] as SessionScheduleRow[];
        }

        return detail.sessionsPage.items.map((session) => ({
          mentorMemberId: detail.memberId,
          ...session,
        }));
      })
      .sort((first, second) => {
        return (
          dayjs(second.startsAt).valueOf() - dayjs(first.startsAt).valueOf()
        );
      });
  }, [mentorDetails]);

  const summary = useMemo(() => {
    return {
      totalRequestCount: requestRows.length,
      pendingRequestCount: requestRows.filter(
        (request) => request.status === 'PENDING',
      ).length,
      closedNoteCount: requestRows.filter(
        (request) => request.method === 'note' && request.status === 'CLOSED',
      ).length,
      scheduledSessionCount: sessionRows.filter(
        (session) => session.status === 'SCHEDULED',
      ).length,
      completedSessionCount: sessionRows.filter(
        (session) => session.status === 'COMPLETED',
      ).length,
    };
  }, [requestRows, sessionRows]);

  const hasHydrated =
    mentorsQuery.hasHydrated &&
    mentorDetails.every((detailQuery) => !detailQuery.isLoading);

  return {
    state: {
      hasHydrated,
      mentors,
      selectedMentorId,
    } satisfies SessionOperationsState,
    viewModel: {
      requestRows,
      sessionRows,
      summary,
    } satisfies SessionOperationsViewModel,
    actions: {
      selectMentorId: setSelectedMentorId,
    } satisfies SessionOperationsActions,
  };
};
