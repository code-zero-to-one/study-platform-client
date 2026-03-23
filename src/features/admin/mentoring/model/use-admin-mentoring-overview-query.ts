'use client';

import { useMemo } from 'react';
import { getMentorSettings } from '@/features/mentoring/model/mentor-profile-utils';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import {
  DEFAULT_MENTOR_OPERATION_RECORD,
  useMentorOperationStore,
} from '@/stores/useMentorOperationStore';
import {
  DEFAULT_MENTOR_SCREENING_RECORD,
  useMentorScreeningStore,
} from '@/stores/useMentorScreeningStore';
import type {
  AdminMentorItem,
  AdminMentoringDashboardMetrics,
  AdminMentoringOverviewQueryResult,
} from '@/types/mentoring/admin-domain';
import {
  normalizeAdminMentoringOverviewQueryError,
  parseAdminMentoringOverviewResponseOrThrow,
} from './admin-mentoring-contract';

const toSafeTime = (value: string | undefined) => {
  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  return timestamp;
};

const buildMemberIdByMentorId = (mentorIdByMember: Record<number, number>) => {
  return Object.fromEntries(
    Object.entries(mentorIdByMember).map(([memberId, mentorId]) => [
      Number(mentorId),
      Number(memberId),
    ]),
  ) as Record<number, number>;
};

const buildAdminMentoringOverview = ({
  createdMentors,
  mentorIdByMember,
  requestsByMentor,
  sessionsByMentor,
  reviewsByMentor,
  screeningByMentor,
  operationByMentor,
}: {
  createdMentors: ReturnType<
    typeof useMentorDirectoryStore.getState
  >['createdMentors'];
  mentorIdByMember: ReturnType<
    typeof useMentorDirectoryStore.getState
  >['mentorIdByMember'];
  requestsByMentor: ReturnType<
    typeof useMentoringManagementStore.getState
  >['requestsByMentor'];
  sessionsByMentor: ReturnType<
    typeof useMentoringManagementStore.getState
  >['sessionsByMentor'];
  reviewsByMentor: ReturnType<
    typeof useMentoringManagementStore.getState
  >['reviewsByMentor'];
  screeningByMentor: ReturnType<
    typeof useMentorScreeningStore.getState
  >['recordsByMentorId'];
  operationByMentor: ReturnType<
    typeof useMentorOperationStore.getState
  >['recordsByMentorId'];
}): AdminMentoringOverviewQueryResult => {
  const memberIdByMentorId = buildMemberIdByMentorId(mentorIdByMember);

  const mentors = createdMentors
    .map<AdminMentorItem>((mentor) => {
      const settings = getMentorSettings(mentor);
      const mentorRequests = requestsByMentor[mentor.id] ?? [];
      const mentorSessions = sessionsByMentor[mentor.id] ?? [];
      const mentorReviews = reviewsByMentor[mentor.id] ?? [];
      const screening =
        screeningByMentor[mentor.id] ?? DEFAULT_MENTOR_SCREENING_RECORD;
      const operation =
        operationByMentor[mentor.id] ?? DEFAULT_MENTOR_OPERATION_RECORD;

      return {
        mentor: {
          ...mentor,
          mentorSettings: settings,
        },
        mentorId: mentor.id,
        memberId: memberIdByMentorId[mentor.id],
        screening,
        operation,
        requests: mentorRequests,
        sessions: mentorSessions,
        reviews: mentorReviews,
        counts: {
          pendingRequests: mentorRequests.filter(
            (request) => request.status === 'PENDING',
          ).length,
          acceptedRequests: mentorRequests.filter(
            (request) => request.status === 'ACCEPTED',
          ).length,
          rejectedRequests: mentorRequests.filter(
            (request) => request.status === 'REJECTED',
          ).length,
          scheduledSessions: mentorSessions.filter(
            (session) => session.status === 'SCHEDULED',
          ).length,
          completedSessions: mentorSessions.filter(
            (session) => session.status === 'COMPLETED',
          ).length,
          cancelledSessions: mentorSessions.filter(
            (session) => session.status === 'CANCELLED',
          ).length,
          reviews: mentorReviews.length,
        },
      };
    })
    .sort((first, second) => {
      const byUpdatedAt =
        toSafeTime(second.mentor.mentorSettings?.updatedAt) -
        toSafeTime(first.mentor.mentorSettings?.updatedAt);
      if (byUpdatedAt !== 0) {
        return byUpdatedAt;
      }

      return second.mentorId - first.mentorId;
    });

  const metrics = mentors.reduce<AdminMentoringDashboardMetrics>(
    (accumulator, mentor) => {
      if (mentor.screening.status === 'PENDING') {
        accumulator.pendingScreeningCount += 1;
      }
      if (mentor.screening.status === 'IN_REVIEW') {
        accumulator.inReviewScreeningCount += 1;
      }
      if (mentor.screening.status === 'APPROVED') {
        accumulator.approvedMentorCount += 1;
      }
      if (mentor.screening.status === 'REJECTED') {
        accumulator.rejectedMentorCount += 1;
      }

      accumulator.pendingRequestCount += mentor.counts.pendingRequests;
      accumulator.scheduledSessionCount += mentor.counts.scheduledSessions;
      accumulator.completedReviewCount += mentor.counts.reviews;

      return accumulator;
    },
    {
      registeredMentorCount: mentors.length,
      pendingScreeningCount: 0,
      inReviewScreeningCount: 0,
      approvedMentorCount: 0,
      rejectedMentorCount: 0,
      pendingRequestCount: 0,
      scheduledSessionCount: 0,
      completedReviewCount: 0,
    },
  );

  return {
    mentors,
    metrics,
  };
};

const getAdminMentoringOverview = ({
  createdMentors,
  mentorIdByMember,
  requestsByMentor,
  sessionsByMentor,
  reviewsByMentor,
  screeningByMentor,
  operationByMentor,
}: {
  createdMentors: ReturnType<
    typeof useMentorDirectoryStore.getState
  >['createdMentors'];
  mentorIdByMember: ReturnType<
    typeof useMentorDirectoryStore.getState
  >['mentorIdByMember'];
  requestsByMentor: ReturnType<
    typeof useMentoringManagementStore.getState
  >['requestsByMentor'];
  sessionsByMentor: ReturnType<
    typeof useMentoringManagementStore.getState
  >['sessionsByMentor'];
  reviewsByMentor: ReturnType<
    typeof useMentoringManagementStore.getState
  >['reviewsByMentor'];
  screeningByMentor: ReturnType<
    typeof useMentorScreeningStore.getState
  >['recordsByMentorId'];
  operationByMentor: ReturnType<
    typeof useMentorOperationStore.getState
  >['recordsByMentorId'];
}) => {
  const overview = buildAdminMentoringOverview({
    createdMentors,
    mentorIdByMember,
    requestsByMentor,
    sessionsByMentor,
    reviewsByMentor,
    screeningByMentor,
    operationByMentor,
  });

  return parseAdminMentoringOverviewResponseOrThrow(overview);
};

const EMPTY_ADMIN_MENTORING_OVERVIEW: AdminMentoringOverviewQueryResult = {
  mentors: [],
  metrics: {
    registeredMentorCount: 0,
    pendingScreeningCount: 0,
    inReviewScreeningCount: 0,
    approvedMentorCount: 0,
    rejectedMentorCount: 0,
    pendingRequestCount: 0,
    scheduledSessionCount: 0,
    completedReviewCount: 0,
  },
};

export const useAdminMentoringOverviewQuery = () => {
  const mentorStoreHydrated = useMentorDirectoryStore(
    (state) => state.hasHydrated,
  );
  const mentoringStoreHydrated = useMentoringManagementStore(
    (state) => state.hasHydrated,
  );
  const screeningStoreHydrated = useMentorScreeningStore(
    (state) => state.hasHydrated,
  );
  const operationStoreHydrated = useMentorOperationStore(
    (state) => state.hasHydrated,
  );

  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const sessionsByMentor = useMentoringManagementStore(
    (state) => state.sessionsByMentor,
  );
  const reviewsByMentor = useMentoringManagementStore(
    (state) => state.reviewsByMentor,
  );
  const screeningByMentor = useMentorScreeningStore(
    (state) => state.recordsByMentorId,
  );
  const operationByMentor = useMentorOperationStore(
    (state) => state.recordsByMentorId,
  );

  const hasHydrated =
    mentorStoreHydrated &&
    mentoringStoreHydrated &&
    screeningStoreHydrated &&
    operationStoreHydrated;

  const overviewState = useMemo(() => {
    try {
      return {
        data: getAdminMentoringOverview({
          createdMentors,
          mentorIdByMember,
          requestsByMentor,
          sessionsByMentor,
          reviewsByMentor,
          screeningByMentor,
          operationByMentor,
        }),
        error: undefined,
      } as const;
    } catch (error) {
      return {
        data: EMPTY_ADMIN_MENTORING_OVERVIEW,
        error: normalizeAdminMentoringOverviewQueryError(error),
      } as const;
    }
  }, [
    createdMentors,
    mentorIdByMember,
    operationByMentor,
    requestsByMentor,
    reviewsByMentor,
    screeningByMentor,
    sessionsByMentor,
  ]);

  return {
    hasHydrated,
    mentors: overviewState.data.mentors,
    metrics: overviewState.data.metrics,
    isLoading: !hasHydrated,
    isFetching: false,
    isError: overviewState.error !== undefined,
    error: overviewState.error,
  };
};

// 관리자 멘토링 집계가 확장되면 오버뷰 외의 세부 훅으로 분리합니다.
export const useAdminMentoringQuery = useAdminMentoringOverviewQuery;
