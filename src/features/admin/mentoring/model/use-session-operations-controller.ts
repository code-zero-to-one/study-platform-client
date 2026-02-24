'use client';

import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useAdminMentoringOverviewQuery } from '@/features/admin/mentoring/model/use-admin-mentoring-overview-query';
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
  const { hasHydrated, mentors } = useAdminMentoringOverviewQuery();
  const [selectedMentorId, setSelectedMentorId] =
    useState<SessionMentorFilter>('ALL');

  useEffect(() => {
    if (mentors.length === 0) {
      setSelectedMentorId('ALL');

      return;
    }

    const mentorIdQuery = initialMentorId;
    const hasMentorIdQuery = typeof mentorIdQuery === 'number';
    if (
      hasMentorIdQuery &&
      mentors.some((mentor) => mentor.mentorId === mentorIdQuery)
    ) {
      setSelectedMentorId(mentorIdQuery);

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

  const requestRows = useMemo<SessionRequestRow[]>(() => {
    return filteredMentors
      .flatMap((mentor) =>
        mentor.requests.map((request) => ({
          mentorId: mentor.mentorId,
          mentorMemberId: mentor.memberId,
          ...request,
        })),
      )
      .sort((first, second) => {
        return (
          dayjs(second.requestedAt).valueOf() -
          dayjs(first.requestedAt).valueOf()
        );
      });
  }, [filteredMentors]);

  const sessionRows = useMemo<SessionScheduleRow[]>(() => {
    return filteredMentors
      .flatMap((mentor) =>
        mentor.sessions.map((session) => ({
          mentorId: mentor.mentorId,
          mentorMemberId: mentor.memberId,
          ...session,
        })),
      )
      .sort((first, second) => {
        return (
          dayjs(second.startsAt).valueOf() - dayjs(first.startsAt).valueOf()
        );
      });
  }, [filteredMentors]);

  const summary = useMemo(() => {
    return {
      totalRequestCount: requestRows.length,
      pendingPaymentCount: requestRows.filter(
        (request) => request.paymentStatus === 'PENDING_TRANSFER',
      ).length,
      confirmedPaymentCount: requestRows.filter(
        (request) => request.paymentStatus === 'CONFIRMED',
      ).length,
      scheduledSessionCount: sessionRows.filter(
        (session) => session.status === 'SCHEDULED',
      ).length,
      readyToProcessCount: requestRows.filter(
        (request) =>
          request.paymentStatus === 'CONFIRMED' && request.status === 'PENDING',
      ).length,
    };
  }, [requestRows, sessionRows]);

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
