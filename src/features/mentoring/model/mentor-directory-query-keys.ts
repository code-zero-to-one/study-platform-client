import type {
  MentorDirectoryDetailQueryKey,
  MentorDirectoryListQueryKey,
  MentorDirectoryListQueryParams,
  MentorDirectoryQuerySnapshot,
} from '@/types/mentoring/directory-query';
import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentoringReview } from '@/types/mentoring/management-domain';

const toCreatedMentorSignature = (createdMentors: MentorProfile[]) => {
  if (createdMentors.length === 0) {
    return 'empty';
  }

  return createdMentors
    .map((mentor) => {
      const latestReviewDate = mentor.reviews[0]?.createdAt ?? '';

      return `${mentor.id}:${mentor.priority}:${mentor.rating}:${mentor.reviewCount}:${mentor.mentoringCount}:${latestReviewDate}`;
    })
    .join('|');
};

const toReviewSignature = (
  reviewsByMentor: Record<number, MentoringReview[]>,
) => {
  const sortedMentorIds = Object.keys(reviewsByMentor)
    .map(Number)
    .sort((first, second) => first - second);

  if (sortedMentorIds.length === 0) {
    return 'empty';
  }

  return sortedMentorIds
    .map((mentorId) => {
      const reviews = reviewsByMentor[mentorId] ?? [];
      const reviewSignature = reviews
        .map((review) => {
          return `${review.id}:${review.updatedAt}:${review.rating}:${review.content.length}`;
        })
        .join(',');

      return `${mentorId}[${reviewSignature}]`;
    })
    .join('|');
};

export const createMentorDirectoryQuerySnapshot = (
  createdMentors: MentorProfile[],
  reviewsByMentor: Record<number, MentoringReview[]>,
): MentorDirectoryQuerySnapshot => {
  return {
    createdMentorSignature: toCreatedMentorSignature(createdMentors),
    reviewSignature: toReviewSignature(reviewsByMentor),
  };
};

export const mentorDirectoryQueryKeys = {
  all: ['mentoring'] as const,
  directories: () =>
    [...mentorDirectoryQueryKeys.all, 'mentor-directory'] as const,
  lists: () => [...mentorDirectoryQueryKeys.directories(), 'list'] as const,
  list: (
    params: MentorDirectoryListQueryParams,
  ): MentorDirectoryListQueryKey => [
    ...mentorDirectoryQueryKeys.lists(),
    params.snapshot.createdMentorSignature,
    params.snapshot.reviewSignature,
    params.createdMentors,
    params.reviewsByMentor,
  ],
  details: () => [...mentorDirectoryQueryKeys.directories(), 'detail'] as const,
  detail: (
    mentorId: number,
    snapshot: MentorDirectoryQuerySnapshot,
  ): MentorDirectoryDetailQueryKey => [
    ...mentorDirectoryQueryKeys.details(),
    mentorId,
    snapshot.createdMentorSignature,
    snapshot.reviewSignature,
  ],
};

// 기존 상수명 사용처와의 호환을 위해 유지합니다.
export const MENTOR_DIRECTORY_QUERY_KEYS = mentorDirectoryQueryKeys;
