import { z } from 'zod';
import { mentorMethodTypeSchema } from '@/types/schemas/mentor-directory-schema';

export { mentorMethodTypeSchema };

export const mentoringRouteMentorIdParamSchema = z.coerce
  .number()
  .int()
  .positive();

export type MentoringRouteMentorIdParam = z.infer<
  typeof mentoringRouteMentorIdParamSchema
>;
