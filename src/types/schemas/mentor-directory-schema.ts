import { z } from 'zod';

export const mentorMethodTypeSchema = z.enum([
  'note',
  'simple',
  'deep',
  'offline',
]);

export const mentorSortTypeSchema = z.enum([
  'default',
  'rating',
  'review',
  'low-price',
]);

export const mentorProfileListParamsSchema = z.object({
  initialKeyword: z.string().optional().default(''),
  initialSortType: mentorSortTypeSchema.optional().default('default'),
  initialCareerCodes: z.array(z.string()).optional().default([]),
});

export type MentorProfileListParamsInput = z.input<
  typeof mentorProfileListParamsSchema
>;

export type MentorProfileListParams = z.infer<
  typeof mentorProfileListParamsSchema
>;
