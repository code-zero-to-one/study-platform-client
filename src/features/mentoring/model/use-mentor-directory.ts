'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  MENTOR_PROFILES,
  type MentorReview,
  type MentorProfile,
  withMentorSettings,
} from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import {
  type MentoringReview,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';

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

export const useMentorDirectory = () => {
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const hasHydrated = useMentorDirectoryStore((state) => state.hasHydrated);
  const reviewsByMentor = useMentoringManagementStore(
    (state) => state.reviewsByMentor,
  );

  const mentors = useMemo(() => {
    return mergeMentors(MENTOR_PROFILES, createdMentors, reviewsByMentor);
  }, [createdMentors, reviewsByMentor]);

  return {
    mentors,
    hasHydrated,
  };
};

export const findMentorById = (mentors: MentorProfile[], mentorId: number) => {
  return mentors.find((mentor) => mentor.id === mentorId);
};
