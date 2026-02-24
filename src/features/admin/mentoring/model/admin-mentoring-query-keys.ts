import type {
  MentorOperationRecord,
  MentorScreeningRecord,
} from '@/types/mentoring/admin-domain';
import type {
  AdminMentoringOverviewQueryKey,
  AdminMentoringOverviewQueryKeyParams,
  AdminMentoringOverviewSnapshot,
} from '@/types/mentoring/admin-query';
import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringSession,
} from '@/types/mentoring/management-domain';

const toCreatedMentorSignature = (createdMentors: MentorProfile[]) => {
  if (createdMentors.length === 0) {
    return 'empty';
  }

  return [...createdMentors]
    .sort((first, second) => first.id - second.id)
    .map((mentor) => {
      const settings = mentor.mentorSettings;
      const methodSignature = Object.entries(mentor.methods)
        .sort(([firstMethod], [secondMethod]) =>
          firstMethod.localeCompare(secondMethod),
        )
        .map(([method, option]) => {
          return `${method}:${option.enabled ? 1 : 0}:${option.price}:${option.timeSlots.length}`;
        })
        .join(',');

      return `${mentor.id}:${mentor.priority}:${mentor.rating}:${mentor.reviewCount}:${mentor.mentoringCount}:${settings?.updatedAt ?? ''}:${methodSignature}`;
    })
    .join('|');
};

const toMentorMemberMappingSignature = (
  mentorIdByMember: Record<number, number>,
) => {
  const entries = Object.entries(mentorIdByMember);

  if (entries.length === 0) {
    return 'empty';
  }

  return entries
    .map(([memberId, mentorId]) => `${memberId}:${mentorId}`)
    .sort((first, second) => first.localeCompare(second))
    .join('|');
};

const toRequestSignature = (
  requestsByMentor: Record<number, MentoringRequest[]>,
) => {
  const mentorIds = Object.keys(requestsByMentor)
    .map(Number)
    .sort((first, second) => first - second);

  if (mentorIds.length === 0) {
    return 'empty';
  }

  return mentorIds
    .map((mentorId) => {
      const requestSignature = (requestsByMentor[mentorId] ?? [])
        .map((request) => {
          return [
            request.id,
            request.status,
            request.paymentMode,
            request.paymentStatus,
            request.requestedAt,
            request.acceptedAt ?? '',
            request.rejectedAt ?? '',
            request.linkedSessionId ?? '',
          ].join(':');
        })
        .join(',');

      return `${mentorId}[${requestSignature}]`;
    })
    .join('|');
};

const toSessionSignature = (
  sessionsByMentor: Record<number, MentoringSession[]>,
) => {
  const mentorIds = Object.keys(sessionsByMentor)
    .map(Number)
    .sort((first, second) => first - second);

  if (mentorIds.length === 0) {
    return 'empty';
  }

  return mentorIds
    .map((mentorId) => {
      const sessionSignature = (sessionsByMentor[mentorId] ?? [])
        .map((session) => {
          return [
            session.id,
            session.status,
            session.startsAt,
            session.endsAt,
            session.updatedAt,
          ].join(':');
        })
        .join(',');

      return `${mentorId}[${sessionSignature}]`;
    })
    .join('|');
};

const toReviewSignature = (reviewsByMentor: Record<number, MentoringReview[]>) => {
  const mentorIds = Object.keys(reviewsByMentor)
    .map(Number)
    .sort((first, second) => first - second);

  if (mentorIds.length === 0) {
    return 'empty';
  }

  return mentorIds
    .map((mentorId) => {
      const reviewSignature = (reviewsByMentor[mentorId] ?? [])
        .map((review) => {
          return [
            review.id,
            review.rating,
            review.recommendation,
            review.updatedAt,
            review.content.length,
          ].join(':');
        })
        .join(',');

      return `${mentorId}[${reviewSignature}]`;
    })
    .join('|');
};

const toScreeningSignature = (
  screeningByMentor: Record<number, MentorScreeningRecord>,
) => {
  const mentorIds = Object.keys(screeningByMentor)
    .map(Number)
    .sort((first, second) => first - second);

  if (mentorIds.length === 0) {
    return 'empty';
  }

  return mentorIds
    .map((mentorId) => {
      const record = screeningByMentor[mentorId];

      return [
        mentorId,
        record.status,
        record.note ?? '',
        record.startedAt ?? '',
        record.reviewedAt ?? '',
        record.reviewedByMemberId ?? '',
      ].join(':');
    })
    .join('|');
};

const toOperationSignature = (
  operationByMentor: Record<number, MentorOperationRecord>,
) => {
  const mentorIds = Object.keys(operationByMentor)
    .map(Number)
    .sort((first, second) => first - second);

  if (mentorIds.length === 0) {
    return 'empty';
  }

  return mentorIds
    .map((mentorId) => {
      const record = operationByMentor[mentorId];
      const historySignature = record.history
        .map((entry) =>
          [
            entry.id,
            entry.fromStatus,
            entry.toStatus,
            entry.reason ?? '',
            entry.changedAt,
            entry.changedByMemberId ?? '',
          ].join(':'),
        )
        .join(',');

      return [
        mentorId,
        record.status,
        record.reason ?? '',
        record.changedAt ?? '',
        historySignature,
      ].join(':');
    })
    .join('|');
};

export const createAdminMentoringOverviewSnapshot = ({
  createdMentors,
  mentorIdByMember,
  requestsByMentor,
  sessionsByMentor,
  reviewsByMentor,
  screeningByMentor,
  operationByMentor,
}: {
  createdMentors: MentorProfile[];
  mentorIdByMember: Record<number, number>;
  requestsByMentor: Record<number, MentoringRequest[]>;
  sessionsByMentor: Record<number, MentoringSession[]>;
  reviewsByMentor: Record<number, MentoringReview[]>;
  screeningByMentor: Record<number, MentorScreeningRecord>;
  operationByMentor: Record<number, MentorOperationRecord>;
}): AdminMentoringOverviewSnapshot => {
  return {
    createdMentorSignature: toCreatedMentorSignature(createdMentors),
    mentorMemberMappingSignature: toMentorMemberMappingSignature(
      mentorIdByMember,
    ),
    requestSignature: toRequestSignature(requestsByMentor),
    sessionSignature: toSessionSignature(sessionsByMentor),
    reviewSignature: toReviewSignature(reviewsByMentor),
    screeningSignature: toScreeningSignature(screeningByMentor),
    operationSignature: toOperationSignature(operationByMentor),
  };
};

export const adminMentoringQueryKeys = {
  all: ['mentoring'] as const,
  admin: () => [...adminMentoringQueryKeys.all, 'admin'] as const,
  overviews: () => [...adminMentoringQueryKeys.admin(), 'overview'] as const,
  overview: (
    params: AdminMentoringOverviewQueryKeyParams,
  ): AdminMentoringOverviewQueryKey => {
    const { snapshot } = params;

    return [
      ...adminMentoringQueryKeys.overviews(),
      snapshot.createdMentorSignature,
      snapshot.mentorMemberMappingSignature,
      snapshot.requestSignature,
      snapshot.sessionSignature,
      snapshot.reviewSignature,
      snapshot.screeningSignature,
      snapshot.operationSignature,
      params.createdMentors,
      params.mentorIdByMember,
      params.requestsByMentor,
      params.sessionsByMentor,
      params.reviewsByMentor,
      params.screeningByMentor,
      params.operationByMentor,
    ];
  },
};

// 기존 상수 네이밍과의 호환성을 유지합니다.
export const ADMIN_MENTORING_QUERY_KEYS = adminMentoringQueryKeys;
