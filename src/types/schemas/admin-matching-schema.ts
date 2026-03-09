import { z } from 'zod';
import type {
  AdminMatchingScheduledDayOfWeek,
  AdminMatchingTemplateType,
} from '@/types/matching/admin-domain';
import { isMondayDateString } from '@/utils/time';

const positiveIntegerPattern = /^[1-9]\d*$/;
const ADMIN_MATCHING_REQUEST_LIST_PAGE_SIZE_VALUES = [
  '20',
  '50',
  '100',
] as const;
const ADMIN_MATCHING_SCHEDULED_DAY_VALUES = ['SATURDAY', 'SUNDAY'] as const;
const hhmmTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'YYYY-MM-DD 형식으로 입력해주세요.',
});

const mondayDateStringSchema = dateStringSchema.refine(isMondayDateString, {
  message: '월요일 날짜만 선택해주세요.',
});

const requiredPositiveIntegerSchema = z
  .string()
  .trim()
  .min(1, '필수 입력값입니다.')
  .refine((value) => positiveIntegerPattern.test(value), {
    message: '양의 정수를 입력해주세요.',
  })
  .transform((value) => Number(value));

const optionalPositiveIntegerTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value))
  .refine(
    (value) => value === undefined || positiveIntegerPattern.test(value),
    {
      message: '양의 정수를 입력해주세요.',
    },
  );

const optionalPositiveIntegerSchema =
  optionalPositiveIntegerTextSchema.transform((value) =>
    value === undefined ? undefined : Number(value),
  );

const optionalPositiveIntegerStringSchema =
  optionalPositiveIntegerTextSchema.transform((value) => value);

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value === '' ? undefined : value));

const optionalMondayDateStringSchema = optionalTextSchema
  .refine((value) => value === undefined || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'YYYY-MM-DD 형식으로 입력해주세요.',
  })
  .refine((value) => value === undefined || isMondayDateString(value), {
    message: '월요일 날짜만 선택해주세요.',
  });

export const ADMIN_MATCHING_FILTER_ALL_VALUE = 'ALL' as const;

export const adminMatchingSystemStatusSchema = z.enum([
  'RECRUITING',
  'STUDYING',
]);

export const adminMatchingRequestStatusSchema = z.enum([
  'PENDING',
  'RES_ACPT',
  'RES_AUTO',
  'RES_REJ',
  'AUTO',
  'DONE',
  'CANCEL',
]);

export const adminMatchingRequestTypeSchema = z.enum(['AUTO', 'MANUAL']);

export const adminMatchingTargetWeekSchema = z.enum(['CURRENT', 'NEXT']);

export const adminMatchingTemplateTypeSchema = z.enum([
  'STUDY',
  'TIME',
  'RANDOM',
]);

export const adminMatchingScheduledDayOfWeekSchema = z.enum(
  ADMIN_MATCHING_SCHEDULED_DAY_VALUES,
);

export const adminMatchingRequestResponseSchema = z
  .object({
    matchingRequestId: z.number(),
    memberId: z.number(),
    memberName: z.string().nullish(),
    partnerId: z.number(),
    partnerName: z.string().nullish(),
    status: adminMatchingRequestStatusSchema,
    type: adminMatchingRequestTypeSchema,
    content: z.string().nullish(),
    weeklyPeriodIdentifier: dateStringSchema.optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

export const adminMatchingSystemStatusResponseSchema = z
  .object({
    status: adminMatchingSystemStatusSchema.optional(),
  })
  .passthrough();

export const adminMatchingRequestListResponseSchema = z
  .object({
    content: z.array(adminMatchingRequestResponseSchema),
    page: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrevious: z.boolean(),
  })
  .passthrough();

export const adminMatchingAdminMemberResponseSchema = z
  .object({
    memberId: z.number(),
    memberName: z.string().trim().min(1, '관리자 이름이 비어 있습니다.'),
    memberNickname: z.string().nullish(),
  })
  .passthrough();

export const adminMatchingAdminMemberListResponseSchema = z
  .object({
    content: z.array(adminMatchingAdminMemberResponseSchema),
    page: z.number().optional(),
    size: z.number().optional(),
    totalElements: z.number().optional(),
    totalPages: z.number().optional(),
    hasNext: z.boolean().optional(),
    hasPrevious: z.boolean().optional(),
  })
  .passthrough();

export const adminMatchingSchedulerConfigResponseSchema = z
  .object({
    enabled: z.boolean().optional(),
    autoCycleEndEnabled: z.boolean().optional(),
    adminId: z.number().nullish(),
    adminName: z.string().nullish(),
    scheduledDayOfWeek: adminMatchingScheduledDayOfWeekSchema.optional(),
    scheduledTime: z.string().regex(hhmmTimePattern).nullish(),
    templateType: adminMatchingTemplateTypeSchema.nullish(),
    matchingKValue: z.number().nullish(),
    numberOfNearestNeighbors: z.number().nullish(),
    chunkSize: z.number().nullish(),
    saveResultsChunkSize: z.number().nullish(),
    updatedAt: z.string().nullish(),
  })
  .passthrough();

export const resetWeeklyMatchingResponseSchema = z
  .object({
    weeklyPeriodIdentifier: dateStringSchema.optional(),
    deletedMatchingRequests: z.number().optional(),
    deletedMatchingRequestPartners: z.number().optional(),
    deletedStudySpaces: z.number().optional(),
    deletedDailyStudies: z.number().optional(),
    deletedAttendances: z.number().optional(),
    deletedStudyMembers: z.number().optional(),
  })
  .passthrough();

export const adminMatchingRequestListFilterFormSchema = z.object({
  weeklyPeriodIdentifier: optionalMondayDateStringSchema,
  status: z.union([
    z.literal(ADMIN_MATCHING_FILTER_ALL_VALUE),
    adminMatchingRequestStatusSchema,
  ]),
  type: z.union([
    z.literal(ADMIN_MATCHING_FILTER_ALL_VALUE),
    adminMatchingRequestTypeSchema,
  ]),
  searchKeyword: optionalTextSchema,
  pageSize: z.enum(ADMIN_MATCHING_REQUEST_LIST_PAGE_SIZE_VALUES),
});

export const autoRunMatchingFormSchema = z.object({
  adminId: requiredPositiveIntegerSchema,
  targetWeek: adminMatchingTargetWeekSchema,
  templateType: adminMatchingTemplateTypeSchema,
  matchingKValue: optionalPositiveIntegerStringSchema,
  numberOfNearestNeighbors: optionalPositiveIntegerStringSchema,
  chunkSize: optionalPositiveIntegerSchema,
  saveResultsChunkSize: optionalPositiveIntegerStringSchema,
});

const optionalTemplateTypeSchema = optionalTextSchema
  .refine(
    (value) =>
      value === undefined || ['STUDY', 'TIME', 'RANDOM'].includes(value),
    {
      message: '매칭 템플릿을 선택해주세요.',
    },
  )
  .transform((value) => value as AdminMatchingTemplateType | undefined);

const optionalScheduledAdminIdSchema = optionalPositiveIntegerSchema;

const schedulerTimeSchema = z
  .string()
  .trim()
  .regex(hhmmTimePattern, 'HH:mm 형식으로 입력해주세요.');

export const adminMatchingSchedulerConfigFormSchema = z
  .object({
    enabled: z.boolean(),
    autoCycleEndEnabled: z.boolean(),
    adminId: optionalScheduledAdminIdSchema,
    scheduledDayOfWeek: adminMatchingScheduledDayOfWeekSchema,
    scheduledTime: schedulerTimeSchema,
    templateType: optionalTemplateTypeSchema,
    matchingKValue: optionalPositiveIntegerSchema,
    numberOfNearestNeighbors: optionalPositiveIntegerSchema,
    chunkSize: optionalPositiveIntegerSchema,
    saveResultsChunkSize: optionalPositiveIntegerSchema,
  })
  .superRefine((values, ctx) => {
    if (values.enabled && values.adminId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['adminId'],
        message: '자동 매칭 스케줄러를 활성화할 때 관리자 선택은 필수입니다.',
      });
    }

    if (
      values.scheduledDayOfWeek === 'SATURDAY' &&
      values.scheduledTime < '18:00'
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledTime'],
        message: '토요일 자동 매칭 실행 시각은 18:00 이후여야 합니다.',
      });
    }

    if (
      values.scheduledDayOfWeek === 'SUNDAY' &&
      values.scheduledTime > '22:00'
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledTime'],
        message: '일요일 자동 매칭 실행 시각은 22:00 이전이어야 합니다.',
      });
    }
  });

export const adminMatchingCreateFormSchema = z.object({
  memberId: requiredPositiveIntegerSchema,
  partnerId: requiredPositiveIntegerSchema,
  status: adminMatchingRequestStatusSchema,
  type: adminMatchingRequestTypeSchema,
  content: z.string().max(255, '255자 이하로 입력해주세요.'),
  weeklyPeriodIdentifier: mondayDateStringSchema,
});

export const adminMatchingUpdateFormSchema = z.object({
  partnerId: requiredPositiveIntegerSchema,
  status: adminMatchingRequestStatusSchema,
  content: z.string().max(255, '255자 이하로 입력해주세요.'),
});

export const resetWeeklyMatchingFormSchema = z.object({
  weeklyPeriodIdentifier: mondayDateStringSchema,
});

export type AdminMatchingRequestResponse = z.infer<
  typeof adminMatchingRequestResponseSchema
>;
export type AdminMatchingSystemStatusResponse = z.infer<
  typeof adminMatchingSystemStatusResponseSchema
>;
export type AdminMatchingRequestListResponse = z.infer<
  typeof adminMatchingRequestListResponseSchema
>;
export type AdminMatchingAdminMemberResponse = z.infer<
  typeof adminMatchingAdminMemberResponseSchema
>;
export type AdminMatchingAdminMemberListResponse = z.infer<
  typeof adminMatchingAdminMemberListResponseSchema
>;
export type AdminMatchingSchedulerConfigResponse = z.infer<
  typeof adminMatchingSchedulerConfigResponseSchema
>;
export type ResetWeeklyMatchingResponseDto = z.infer<
  typeof resetWeeklyMatchingResponseSchema
>;
export type AdminMatchingRequestListFilterFormInput = z.input<
  typeof adminMatchingRequestListFilterFormSchema
>;
export type AdminMatchingRequestListFilterFormValues = z.infer<
  typeof adminMatchingRequestListFilterFormSchema
>;
export type AutoRunMatchingFormInput = z.input<
  typeof autoRunMatchingFormSchema
>;
export type AutoRunMatchingFormValues = z.infer<
  typeof autoRunMatchingFormSchema
>;
export type AdminMatchingSchedulerConfigFormInput = z.input<
  typeof adminMatchingSchedulerConfigFormSchema
>;
export type AdminMatchingSchedulerConfigFormValues = z.infer<
  typeof adminMatchingSchedulerConfigFormSchema
>;
export type AdminMatchingCreateFormInput = z.input<
  typeof adminMatchingCreateFormSchema
>;
export type AdminMatchingCreateFormValues = z.infer<
  typeof adminMatchingCreateFormSchema
>;
export type AdminMatchingUpdateFormInput = z.input<
  typeof adminMatchingUpdateFormSchema
>;
export type AdminMatchingUpdateFormValues = z.infer<
  typeof adminMatchingUpdateFormSchema
>;
export type ResetWeeklyMatchingFormInput = z.input<
  typeof resetWeeklyMatchingFormSchema
>;
export type ResetWeeklyMatchingFormValues = z.infer<
  typeof resetWeeklyMatchingFormSchema
>;

export interface AdminMatchingSchedulerConfigUpdateRequest {
  adminId?: number;
  autoCycleEndEnabled: boolean;
  chunkSize?: number;
  clearChunkSize: boolean;
  clearMatchingKValue: boolean;
  clearNumberOfNearestNeighbors: boolean;
  clearSaveResultsChunkSize: boolean;
  clearTemplateType: boolean;
  enabled: boolean;
  matchingKValue?: number;
  numberOfNearestNeighbors?: number;
  saveResultsChunkSize?: number;
  scheduledDayOfWeek: AdminMatchingScheduledDayOfWeek;
  scheduledTime: string;
  templateType?: AdminMatchingTemplateType;
}

export const toAdminMatchingSchedulerConfigUpdateRequest = (
  values: AdminMatchingSchedulerConfigFormValues,
): AdminMatchingSchedulerConfigUpdateRequest => {
  return {
    enabled: values.enabled,
    autoCycleEndEnabled: values.autoCycleEndEnabled,
    ...(values.adminId !== undefined ? { adminId: values.adminId } : {}),
    scheduledDayOfWeek: values.scheduledDayOfWeek,
    scheduledTime: values.scheduledTime,
    ...(values.templateType !== undefined
      ? { templateType: values.templateType }
      : {}),
    clearTemplateType: values.templateType === undefined,
    ...(values.matchingKValue !== undefined
      ? { matchingKValue: values.matchingKValue }
      : {}),
    clearMatchingKValue: values.matchingKValue === undefined,
    ...(values.numberOfNearestNeighbors !== undefined
      ? { numberOfNearestNeighbors: values.numberOfNearestNeighbors }
      : {}),
    clearNumberOfNearestNeighbors:
      values.numberOfNearestNeighbors === undefined,
    ...(values.chunkSize !== undefined ? { chunkSize: values.chunkSize } : {}),
    clearChunkSize: values.chunkSize === undefined,
    ...(values.saveResultsChunkSize !== undefined
      ? { saveResultsChunkSize: values.saveResultsChunkSize }
      : {}),
    clearSaveResultsChunkSize: values.saveResultsChunkSize === undefined,
  };
};
