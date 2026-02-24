import { z } from 'zod';
import { mentorMethodTypeSchema } from '@/types/schemas/mentor-directory-schema';

const mentoringRequestStatusSchema = z.enum(['PENDING', 'ACCEPTED', 'REJECTED']);
const mentoringSessionStatusSchema = z.enum([
  'SCHEDULED',
  'CANCELLED',
  'COMPLETED',
]);
const mentoringPaymentModeSchema = z.enum([
  'TOSS_PAYMENTS',
  'MANUAL_TRANSFER',
  'FREE_REQUEST',
]);
const mentoringPaymentStatusSchema = z.enum([
  'PENDING_TRANSFER',
  'NOT_REQUIRED',
  'CONFIRMED',
]);
const mentoringReviewRecommendationSchema = z.enum([
  'RECOMMEND',
  'NOT_RECOMMEND',
]);
const mentorScreeningStatusSchema = z.enum([
  'PENDING',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
]);
const mentorOperationStatusSchema = z.enum([
  'OPEN',
  'REQUESTS_PAUSED',
  'SUSPENDED',
]);
const mentorSettlementPayerTypeSchema = z.enum([
  'INDIVIDUAL',
  'BUSINESS',
  'OVERSEAS',
]);

const mentorSettingsSummarySchema = z
  .object({
    contactCountryCode: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().optional(),
    categories: z.array(z.string()).optional(),
    mentoringTitle: z.string().optional(),
    jobGroup: z.string().optional(),
    jobTitle: z.string().optional(),
    careerYears: z.string().optional(),
    skillTags: z.array(z.string()).optional(),
    companyCategory: z.string().optional(),
    companyName: z.string().optional(),
    hideCompanyName: z.boolean().optional(),
    maxParticipants: z.number().optional(),
    noteEnabled: z.boolean().optional(),
    notePrice: z.number().optional(),
    phoneEnabled: z.boolean().optional(),
    phonePrice: z.number().optional(),
    onlineEnabled: z.boolean().optional(),
    onlinePrice: z.number().optional(),
    onlineDurationMinutes: z.number().optional(),
    offlineEnabled: z.boolean().optional(),
    offlinePrice: z.number().optional(),
    offlineDurationMinutes: z.number().optional(),
    schedule: z
      .object({
        weekly: z.record(z.string(), z.array(z.string())),
      })
      .optional(),
    holidays: z
      .array(
        z.object({
          id: z.string(),
          startDate: z.string(),
          endDate: z.string(),
          memo: z.string(),
        }),
      )
      .optional(),
    settlementDraft: z
      .object({
        payerType: mentorSettlementPayerTypeSchema.optional(),
        contractName: z.string().optional(),
        accountHolder: z.string().optional(),
        bankCode: z.string().optional(),
        accountNumber: z.string().optional(),
        verified: z.boolean(),
      })
      .nullable()
      .optional(),
    detailedDescription: z.string().optional(),
    interviewQuestions: z.array(z.string()).optional(),
    preNotice: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

const mentorProfileSummarySchema = z
  .object({
    id: z.number(),
    headline: z.string(),
    mentorSettings: mentorSettingsSummarySchema.optional(),
  })
  .passthrough();

const mentoringRequestSummarySchema = z
  .object({
    id: z.string(),
    mentorId: z.number(),
    method: mentorMethodTypeSchema,
    paymentMode: mentoringPaymentModeSchema,
    paymentStatus: mentoringPaymentStatusSchema,
    menteeName: z.string(),
    menteeRole: z.string(),
    requestedAt: z.string(),
    status: mentoringRequestStatusSchema,
  })
  .passthrough();

const mentoringSessionSummarySchema = z
  .object({
    id: z.string(),
    mentorId: z.number(),
    requestId: z.string(),
    menteeName: z.string(),
    method: mentorMethodTypeSchema,
    startsAt: z.string(),
    endsAt: z.string(),
    status: mentoringSessionStatusSchema,
  })
  .passthrough();

const mentoringReviewSummarySchema = z
  .object({
    id: z.string(),
    mentorId: z.number(),
    requestId: z.string(),
    menteeMemberId: z.number(),
    menteeName: z.string(),
    method: mentorMethodTypeSchema,
    rating: z.number(),
    recommendation: mentoringReviewRecommendationSchema,
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .passthrough();

const mentorScreeningRecordSchema = z.object({
  status: mentorScreeningStatusSchema,
  note: z.string().optional(),
  startedAt: z.string().optional(),
  startedByMemberId: z.number().optional(),
  reviewedAt: z.string().optional(),
  reviewedByMemberId: z.number().optional(),
});

const mentorOperationHistoryEntrySchema = z.object({
  id: z.string(),
  fromStatus: z.union([mentorOperationStatusSchema, z.literal('INITIAL')]),
  toStatus: mentorOperationStatusSchema,
  reason: z.string().optional(),
  changedAt: z.string(),
  changedByMemberId: z.number().optional(),
});

const mentorOperationRecordSchema = z.object({
  status: mentorOperationStatusSchema,
  reason: z.string().optional(),
  changedAt: z.string().optional(),
  changedByMemberId: z.number().optional(),
  history: z.array(mentorOperationHistoryEntrySchema),
});

const adminMentorCountsSchema = z.object({
  pendingRequests: z.number(),
  acceptedRequests: z.number(),
  rejectedRequests: z.number(),
  scheduledSessions: z.number(),
  completedSessions: z.number(),
  cancelledSessions: z.number(),
  reviews: z.number(),
});

const adminMentorItemSchema = z.object({
  mentor: mentorProfileSummarySchema,
  mentorId: z.number(),
  memberId: z.number().optional(),
  screening: mentorScreeningRecordSchema,
  operation: mentorOperationRecordSchema,
  requests: z.array(mentoringRequestSummarySchema),
  sessions: z.array(mentoringSessionSummarySchema),
  reviews: z.array(mentoringReviewSummarySchema),
  counts: adminMentorCountsSchema,
});

const adminMentoringDashboardMetricsSchema = z.object({
  registeredMentorCount: z.number(),
  pendingScreeningCount: z.number(),
  inReviewScreeningCount: z.number(),
  approvedMentorCount: z.number(),
  rejectedMentorCount: z.number(),
  pendingRequestCount: z.number(),
  scheduledSessionCount: z.number(),
  completedReviewCount: z.number(),
});

export const adminMentoringOverviewResponseSchema = z.object({
  mentors: z.array(adminMentorItemSchema),
  metrics: adminMentoringDashboardMetricsSchema,
});

const mentorIdSearchParamSchema = z
  .string()
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value), {
    message: 'mentorId must be a finite number.',
  });

export const sessionOperationsSearchParamsSchema = z.object({
  mentorId: mentorIdSearchParamSchema.optional(),
});

export type AdminMentoringOverviewResponse = z.infer<
  typeof adminMentoringOverviewResponseSchema
>;
export type SessionOperationsSearchParamsInput = z.input<
  typeof sessionOperationsSearchParamsSchema
>;
export type SessionOperationsSearchParams = z.infer<
  typeof sessionOperationsSearchParamsSchema
>;
