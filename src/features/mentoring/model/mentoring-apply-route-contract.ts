import type { MentoringMethodType } from '@/types/mentoring/domain';
import {
  mentorMethodTypeSchema,
  type MentoringRouteMentorIdParam,
  mentoringRouteMentorIdParamSchema,
} from '@/types/schemas/mentoring-route-schema';

export const parseMentoringApplyRouteMentorId = (
  rawId: string,
): MentoringRouteMentorIdParam | undefined => {
  const parsed = mentoringRouteMentorIdParamSchema.safeParse(rawId);

  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
};

export const parseMentoringApplySelectedType = (
  rawType: string | undefined,
): MentoringMethodType | undefined => {
  const parsed = mentorMethodTypeSchema.safeParse(rawType);

  if (!parsed.success) {
    return undefined;
  }

  return parsed.data;
};
