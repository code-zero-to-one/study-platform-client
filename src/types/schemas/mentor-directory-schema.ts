import { z } from 'zod';

export const mentorMethodTypeSchema = z.enum([
  'note',
  'phone',
  'online',
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
});

const mentorMethodOptionSchema = z.object({
  type: mentorMethodTypeSchema,
  label: z.string(),
  durationLabel: z.string(),
  price: z.number(),
  description: z.string(),
  enabled: z.boolean().optional(),
  requiresSchedule: z.boolean(),
  timeSlots: z.array(z.string()),
});

const mentorReviewSchema = z.object({
  id: z.union([z.number(), z.string()]),
  authorName: z.string(),
  rating: z.number(),
  createdAt: z.string(),
  content: z.string(),
  method: mentorMethodTypeSchema,
});

const mentorSettingsBoundarySchema = z
  .object({
    mentoringTitle: z.string().optional(),
    appealLine: z.string().optional(),
    companyCategory: z.string().optional(),
    jobTitle: z.string().optional(),
    careerYears: z.string().optional(),
    skillTags: z.array(z.string()).optional(),
  })
  .passthrough();

export const mentorProfileBoundarySchema = z.object({
  id: z.number(),
  priority: z.number(),
  headline: z.string(),
  nickname: z.string(),
  role: z.string(),
  career: z.string(),
  company: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  mentoringCount: z.number(),
  menteeCount: z.number().optional(),
  tags: z.array(z.string()),
  summary: z.string(),
  bio: z.string(),
  careerHistory: z.array(z.string()),
  strengths: z.array(z.string()),
  avatarEmoji: z.string().optional(),
  imageUrl: z.string().optional(),
  methods: z.object({
    note: mentorMethodOptionSchema,
    phone: mentorMethodOptionSchema,
    online: mentorMethodOptionSchema,
    offline: mentorMethodOptionSchema,
  }),
  reviews: z.array(mentorReviewSchema),
  mentorSettings: mentorSettingsBoundarySchema.optional(),
});

const mentoringReviewSchema = z.object({
  id: z.string(),
  mentorId: z.number(),
  requestId: z.string(),
  sessionId: z.string().optional(),
  menteeMemberId: z.number(),
  menteeName: z.string(),
  method: mentorMethodTypeSchema,
  rating: z.number(),
  recommendation: z.enum(['RECOMMEND', 'NOT_RECOMMEND']),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mentorDirectoryCreatedMentorsSchema = z.array(
  mentorProfileBoundarySchema,
);

export const mentorDirectoryReviewsByMentorSchema = z.record(
  z.string().regex(/^\d+$/),
  z.array(mentoringReviewSchema),
);

export const mentorDirectoryResponseSchema = z.object({
  mentors: z.array(mentorProfileBoundarySchema),
});

export type MentorProfileListParamsInput = z.input<
  typeof mentorProfileListParamsSchema
>;

export type MentorProfileListParams = z.infer<
  typeof mentorProfileListParamsSchema
>;
