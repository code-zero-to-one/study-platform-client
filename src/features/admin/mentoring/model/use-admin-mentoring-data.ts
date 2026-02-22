'use client';

import { useMemo } from 'react';
import {
  getMentorSettings,
  type MentorProfile,
} from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import {
  type MentoringRequest,
  type MentoringReview,
  type MentoringSession,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';
import {
  DEFAULT_MENTOR_OPERATION_RECORD,
  type MentorOperationRecord,
  useMentorOperationStore,
} from '@/stores/useMentorOperationStore';
import {
  DEFAULT_MENTOR_SCREENING_RECORD,
  type MentorScreeningRecord,
  useMentorScreeningStore,
} from '@/stores/useMentorScreeningStore';

export interface AdminMentorItem {
  mentor: MentorProfile;
  mentorId: number;
  memberId?: number;
  screening: MentorScreeningRecord;
  operation: MentorOperationRecord;
  requests: MentoringRequest[];
  sessions: MentoringSession[];
  reviews: MentoringReview[];
  counts: {
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    scheduledSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    reviews: number;
  };
}

export interface AdminMentoringDashboardMetrics {
  registeredMentorCount: number;
  pendingScreeningCount: number;
  inReviewScreeningCount: number;
  approvedMentorCount: number;
  rejectedMentorCount: number;
  pendingRequestCount: number;
  scheduledSessionCount: number;
  completedReviewCount: number;
}

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

export const useAdminMentoringData = () => {
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

  const mentors = useMemo<AdminMentorItem[]>(() => {
    const memberIdByMentorId = buildMemberIdByMentorId(mentorIdByMember);

    const records = createdMentors.map((mentor) => {
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
    });

    return records.sort((first, second) => {
      const byUpdatedAt =
        toSafeTime(second.mentor.mentorSettings?.updatedAt) -
        toSafeTime(first.mentor.mentorSettings?.updatedAt);
      if (byUpdatedAt !== 0) {
        return byUpdatedAt;
      }

      return second.mentorId - first.mentorId;
    });
  }, [
    createdMentors,
    mentorIdByMember,
    requestsByMentor,
    reviewsByMentor,
    operationByMentor,
    screeningByMentor,
    sessionsByMentor,
  ]);

  const metrics = useMemo<AdminMentoringDashboardMetrics>(() => {
    return mentors.reduce<AdminMentoringDashboardMetrics>(
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
  }, [mentors]);

  return {
    hasHydrated:
      mentorStoreHydrated &&
      mentoringStoreHydrated &&
      screeningStoreHydrated &&
      operationStoreHydrated,
    mentors,
    metrics,
  };
};
