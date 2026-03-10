import type { MentorSortType } from '@/types/mentoring/domain';
import {
  mentorProfileListParamsSchema,
  type MentorProfileListParamsInput,
} from '@/types/schemas/mentor-directory-schema';

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
