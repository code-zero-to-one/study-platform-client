'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  MENTOR_PROFILES,
  withMentorSettings,
} from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentorProfile, MentorReview } from '@/types/mentoring-domain';
import type { MentoringReview } from '@/types/mentoring-management';
import {
  parseMentorDirectoryQueryInputOrThrow,
  parseMentorDirectoryResponseOrThrow,
} from './mentor-directory-contract';
import {
  createMentorDirectoryQuerySnapshot,
  mentorDirectoryQueryKeys,
} from './mentor-directory-query-keys';

const toMaskedAuthorName = (rawName: string) => {
  const trimmedName = rawName.trim();
  if (trimmedName.length === 0) {
    return '익명';
  }

  return `${trimmedName[0]}OO`;
};

const parseReviewDate = (rawDate: string) => {
  const parsed = dayjs(rawDate.replace(/\./g, '-'));

  return parsed.isValid() ? parsed.valueOf() : 0;
};

const toMentorReview = (review: MentoringReview): MentorReview => {
  return {
    id: review.id,
    authorName: toMaskedAuthorName(review.menteeName),
    rating: review.rating,
    createdAt: dayjs(review.updatedAt).format('YYYY.MM.DD'),
    content: review.content,
    method: review.method,
  };
};

const mergeMentors = (
  staticMentors: MentorProfile[],
  createdMentors: MentorProfile[],
  reviewsByMentor: Record<number, MentoringReview[]>,
) => {
  const mentorMap = new Map<number, MentorProfile>();

  [...staticMentors, ...createdMentors].forEach((mentor) => {
    const dynamicReviews = (reviewsByMentor[mentor.id] ?? []).map(
      toMentorReview,
    );
    const mergedReviews = [...dynamicReviews, ...mentor.reviews].sort(
      (first, second) => {
        return (
          parseReviewDate(second.createdAt) - parseReviewDate(first.createdAt)
        );
      },
    );
    const nextRating =
      mergedReviews.length === 0
        ? 0
        : Number(
            (
              mergedReviews.reduce((sum, review) => sum + review.rating, 0) /
              mergedReviews.length
            ).toFixed(1),
          );

    mentorMap.set(
      mentor.id,
      withMentorSettings({
        ...mentor,
        reviews: mergedReviews,
        reviewCount: mergedReviews.length,
        rating: nextRating,
      }),
    );
  });

  return Array.from(mentorMap.values());
};

const getMentorDirectory = ({
  createdMentors,
  reviewsByMentor,
}: {
  createdMentors: MentorProfile[];
  reviewsByMentor: Record<number, MentoringReview[]>;
}) => {
  const parsedInput = parseMentorDirectoryQueryInputOrThrow({
    createdMentors,
    reviewsByMentor,
  });
  const mergedMentors = mergeMentors(
    MENTOR_PROFILES,
    parsedInput.createdMentors,
    parsedInput.reviewsByMentor,
  );

  return parseMentorDirectoryResponseOrThrow(mergedMentors);
};

export const useMentorDirectoryListQuery = () => {
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const reviewsByMentor = useMentoringManagementStore(
    (state) => state.reviewsByMentor,
  );
  const snapshot = useMemo(() => {
    return createMentorDirectoryQuerySnapshot(createdMentors, reviewsByMentor);
  }, [createdMentors, reviewsByMentor]);
  const fallbackMentors = useMemo(() => {
    try {
      return getMentorDirectory({ createdMentors, reviewsByMentor });
    } catch {
      return [];
    }
  }, [createdMentors, reviewsByMentor]);

  const mentorDirectoryQuery = useQuery({
    queryKey: mentorDirectoryQueryKeys.list({
      snapshot,
      createdMentors,
      reviewsByMentor,
    }),
    queryFn: () => getMentorDirectory({ createdMentors, reviewsByMentor }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled: hasHydrated,
    placeholderData: keepPreviousData,
  });

  return {
    mentors: mentorDirectoryQuery.data ?? fallbackMentors,
    hasHydrated,
    isLoading: !hasHydrated || mentorDirectoryQuery.isLoading,
    isFetching: mentorDirectoryQuery.isFetching,
    isError: mentorDirectoryQuery.isError,
    error: mentorDirectoryQuery.error,
  };
};

// 기존 훅명 사용처와의 호환을 위해 유지합니다.
export const useMentorDirectoryQuery = useMentorDirectoryListQuery;
