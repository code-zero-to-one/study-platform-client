import type { ZodIssue } from 'zod';
import type { MentorProfile, MentorSortType } from '@/types/mentoring-domain';
import type { MentoringReview } from '@/types/mentoring-management';
import {
  mentorDirectoryCreatedMentorsSchema,
  mentorDirectoryResponseSchema,
  mentorDirectoryReviewsByMentorSchema,
  mentorProfileListParamsSchema,
  type MentorProfileListParamsInput,
} from '@/types/schemas/mentor-directory-schema';

type MentorDirectoryContractScope =
  | 'profile-list-params'
  | 'query-input-created-mentors'
  | 'query-input-reviews-by-mentor'
  | 'query-response';

export class MentorDirectoryContractError extends Error {
  public readonly code = 'MENTOR_DIRECTORY_CONTRACT_ERROR';
  public readonly scope: MentorDirectoryContractScope;
  public readonly issues: ZodIssue[];

  public constructor({
    scope,
    issues,
  }: {
    scope: MentorDirectoryContractScope;
    issues: ZodIssue[];
  }) {
    super(`Mentor directory contract validation failed: ${scope}`);
    this.name = 'MentorDirectoryContractError';
    this.scope = scope;
    this.issues = issues;
  }
}

const toContractError = ({
  scope,
  issues,
}: {
  scope: MentorDirectoryContractScope;
  issues: ZodIssue[];
}) => {
  return new MentorDirectoryContractError({ scope, issues });
};

const toNumberKeyedReviews = (
  reviewsByMentor: Record<string, MentoringReview[]>,
) => {
  return Object.entries(reviewsByMentor).reduce<
    Record<number, MentoringReview[]>
  >((accumulator, [mentorIdString, reviews]) => {
    const mentorId = Number(mentorIdString);

    accumulator[mentorId] = reviews;

    return accumulator;
  }, {});
};

export const parseMentorProfileListParams = (
  input: MentorProfileListParamsInput,
): {
  initialKeyword: string;
  initialSortType: MentorSortType;
} => {
  const parsed = mentorProfileListParamsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      initialKeyword: '',
      initialSortType: 'default',
    };
  }

  return {
    initialKeyword: parsed.data.initialKeyword,
    initialSortType: parsed.data.initialSortType,
  };
};

export const parseMentorDirectoryQueryInputOrThrow = ({
  createdMentors,
  reviewsByMentor,
}: {
  createdMentors: MentorProfile[];
  reviewsByMentor: Record<number, MentoringReview[]>;
}) => {
  const parsedCreatedMentors =
    mentorDirectoryCreatedMentorsSchema.safeParse(createdMentors);
  if (!parsedCreatedMentors.success) {
    throw toContractError({
      scope: 'query-input-created-mentors',
      issues: parsedCreatedMentors.error.issues,
    });
  }

  const reviewsByMentorAsStringKey = Object.entries(reviewsByMentor).reduce<
    Record<string, MentoringReview[]>
  >((accumulator, [mentorId, reviews]) => {
    accumulator[mentorId] = reviews;

    return accumulator;
  }, {});
  const parsedReviewsByMentor = mentorDirectoryReviewsByMentorSchema.safeParse(
    reviewsByMentorAsStringKey,
  );
  if (!parsedReviewsByMentor.success) {
    throw toContractError({
      scope: 'query-input-reviews-by-mentor',
      issues: parsedReviewsByMentor.error.issues,
    });
  }

  return {
    createdMentors: parsedCreatedMentors.data as unknown as MentorProfile[],
    reviewsByMentor: toNumberKeyedReviews(
      parsedReviewsByMentor.data as Record<string, MentoringReview[]>,
    ),
  };
};

export const parseMentorDirectoryResponseOrThrow = (mentors: MentorProfile[]) => {
  const parsedResponse = mentorDirectoryResponseSchema.safeParse({
    mentors,
  });

  if (!parsedResponse.success) {
    throw toContractError({
      scope: 'query-response',
      issues: parsedResponse.error.issues,
    });
  }

  return parsedResponse.data.mentors as unknown as MentorProfile[];
};
