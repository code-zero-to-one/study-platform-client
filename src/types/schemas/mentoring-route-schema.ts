import { z } from 'zod';
import { mentorMethodTypeSchema } from '@/types/schemas/mentor-directory-schema';

export { mentorMethodTypeSchema };

export const mentoringRouteMentorIdParamSchema = z.coerce
  .number()
  .int()
  .positive();
export const mentoringRequestIdParamSchema = z.string().trim().min(1);

export type MentoringRouteMentorIdParam = z.infer<
  typeof mentoringRouteMentorIdParamSchema
>;
export type MentoringRequestIdParam = z.infer<
  typeof mentoringRequestIdParamSchema
>;
