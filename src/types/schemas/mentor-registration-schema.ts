import { z } from 'zod';
import {
  CONSULTING_DURATION_OPTIONS,
  CONTACT_COUNTRY_CODES,
  WEEKDAY_KEYS,
} from '@/features/mentoring/model/mentor-settings';

const timeSlotSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, '시간 형식은 HH:mm 이어야 합니다.');

const weeklyScheduleSchema = z.object({
  MON: z.array(timeSlotSchema),
  TUE: z.array(timeSlotSchema),
  WED: z.array(timeSlotSchema),
  THU: z.array(timeSlotSchema),
  FRI: z.array(timeSlotSchema),
  SAT: z.array(timeSlotSchema),
  SUN: z.array(timeSlotSchema),
});

const holidaySchema = z
  .object({
    id: z.string().min(1),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    memo: z
      .string()
      .trim()
      .min(1, '휴가 메모를 입력해주세요.')
      .max(100, '휴가 메모는 100자 이하로 입력해주세요.'),
  })
  .refine((holiday) => holiday.startDate <= holiday.endDate, {
    message: '휴가 종료일은 시작일보다 빠를 수 없습니다.',
    path: ['endDate'],
  });

const settlementDraftSchema = z
  .object({
    payerType: z.enum(['INDIVIDUAL', 'BUSINESS', 'OVERSEAS']),
    contractName: z
      .string()
      .trim()
      .min(1, '계약자명을 입력해주세요.')
      .max(50, '계약자명은 50자 이하로 입력해주세요.'),
    accountHolder: z
      .string()
      .trim()
      .min(1, '정산자명을 입력해주세요.')
      .max(50, '정산자명은 50자 이하로 입력해주세요.'),
    bankCode: z.string().trim().min(1, '은행을 선택해주세요.'),
    accountNumber: z
      .string()
      .trim()
      .min(8, '계좌번호를 입력해주세요.')
      .max(30, '계좌번호는 30자 이하로 입력해주세요.')
      .regex(/^[0-9-]+$/, '계좌번호는 숫자와 하이픈만 입력할 수 있습니다.'),
    residentId: z
      .string()
      .trim()
      .regex(/^[0-9]*$/, '주민등록번호는 숫자만 입력해주세요.')
      .optional()
      .or(z.literal('')),
    businessName: z.string().trim().max(60).optional().or(z.literal('')),
    businessRegistrationNumber: z
      .string()
      .trim()
      .regex(
        /^[0-9-]*$/,
        '사업자등록번호는 숫자와 하이픈만 입력할 수 있습니다.',
      )
      .optional()
      .or(z.literal('')),
    verified: z.boolean(),
    updatedAt: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.verified) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['verified'],
        message: '정산정보 인증을 완료해주세요.',
      });
    }

    if (values.payerType === 'INDIVIDUAL' && !values.residentId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['residentId'],
        message: '주민등록번호를 입력해주세요.',
      });
    }

    if (values.payerType === 'BUSINESS') {
      if (!values.businessName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['businessName'],
          message: '사업체명을 입력해주세요.',
        });
      }
      if (!values.businessRegistrationNumber?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['businessRegistrationNumber'],
          message: '사업자등록번호를 입력해주세요.',
        });
      }
    }
  });

const scheduleSchema = z.object({
  timezone: z.literal('Asia/Seoul'),
  slotUnitMinutes: z.literal(30),
  weekly: weeklyScheduleSchema,
});

const hasDuplicateHolidayRange = (
  holidays: Array<z.infer<typeof holidaySchema>>,
) => {
  for (let index = 0; index < holidays.length; index += 1) {
    const current = holidays[index];

    for (
      let compareIndex = index + 1;
      compareIndex < holidays.length;
      compareIndex += 1
    ) {
      const compare = holidays[compareIndex];
      const isOverlapped =
        current.startDate <= compare.endDate &&
        compare.startDate <= current.endDate;

      if (isOverlapped) {
        return true;
      }
    }
  }

  return false;
};

const isAnyMethodEnabled = (values: {
  noteEnabled: boolean;
  phoneEnabled: boolean;
  onlineEnabled: boolean;
  offlineEnabled: boolean;
}) => {
  return (
    values.noteEnabled ||
    values.phoneEnabled ||
    values.onlineEnabled ||
    values.offlineEnabled
  );
};

const hasAnySchedule = (schedule: z.infer<typeof scheduleSchema>) => {
  return WEEKDAY_KEYS.some((key) => schedule.weekly[key].length > 0);
};

export const mentorRegistrationSchema = z
  .object({
    contactCountryCode: z.enum(CONTACT_COUNTRY_CODES),
    contactPhone: z
      .string()
      .trim()
      .regex(/^\d{8,12}$/, '연락처는 숫자 8~12자리로 입력해주세요.'),
    contactEmail: z.string().trim().email('이메일 형식이 올바르지 않습니다.'),
    categories: z
      .array(z.string().trim().min(1))
      .min(1, '카테고리를 선택해주세요.')
      .refine((categories) => new Set(categories).size === categories.length, {
        message: '카테고리는 중복 없이 선택해주세요.',
      }),
    mentoringTitle: z
      .string()
      .trim()
      .min(10, '멘토링명은 10자 이상 입력해주세요.')
      .max(120, '멘토링명은 120자 이하로 입력해주세요.'),
    jobGroup: z.string().trim().min(1, '멘토 직군을 선택해주세요.'),
    jobTitle: z.string().trim().min(1, '멘토 직무를 선택해주세요.'),
    careerYears: z.string().trim().min(1, '멘토 경력을 선택해주세요.'),
    skillTags: z
      .array(
        z
          .string()
          .trim()
          .min(2, '스킬 태그는 2자 이상이어야 합니다.')
          .max(24, '스킬 태그는 24자 이하로 입력해주세요.'),
      )
      .min(1, '멘토링 스킬 태그를 최소 1개 선택해주세요.')
      .max(5, '멘토링 스킬 태그는 최대 5개까지 선택할 수 있습니다.'),
    companyName: z
      .string()
      .trim()
      .max(40, '회사명은 40자 이하로 입력해주세요.'),
    hideCompanyName: z.boolean(),
    maxParticipants: z.coerce
      .number()
      .int('최대인원은 정수여야 합니다.')
      .min(1, '최대인원은 1명 이상이어야 합니다.')
      .max(10, '최대인원은 10명 이하여야 합니다.'),
    noteEnabled: z.boolean(),
    notePrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(3000, '가격은 3,000원 이상이어야 합니다.')
      .max(1000000, '가격은 1,000,000원 이하여야 합니다.'),
    phoneEnabled: z.boolean(),
    phonePrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(3000, '가격은 3,000원 이상이어야 합니다.')
      .max(1000000, '가격은 1,000,000원 이하여야 합니다.'),
    onlineEnabled: z.boolean(),
    onlinePrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(3000, '가격은 3,000원 이상이어야 합니다.')
      .max(1000000, '가격은 1,000,000원 이하여야 합니다.'),
    onlineDurationMinutes: z.union(
      CONSULTING_DURATION_OPTIONS.map((value) => z.literal(value)) as [
        z.ZodLiteral<30>,
        z.ZodLiteral<60>,
        z.ZodLiteral<90>,
      ],
    ),
    offlineEnabled: z.boolean(),
    offlinePrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(3000, '가격은 3,000원 이상이어야 합니다.')
      .max(1000000, '가격은 1,000,000원 이하여야 합니다.'),
    offlineDurationMinutes: z.union(
      CONSULTING_DURATION_OPTIONS.map((value) => z.literal(value)) as [
        z.ZodLiteral<30>,
        z.ZodLiteral<60>,
        z.ZodLiteral<90>,
      ],
    ),
    schedule: scheduleSchema,
    holidays: z.array(holidaySchema),
    detailedDescription: z
      .string()
      .trim()
      .min(30, '상세설명은 30자 이상 입력해주세요.')
      .max(5000, '상세설명은 5000자 이하로 입력해주세요.'),
    interviewQuestions: z
      .array(
        z
          .string()
          .trim()
          .min(8, '인터뷰 질문은 8자 이상 입력해주세요.')
          .max(120, '인터뷰 질문은 120자 이하로 입력해주세요.'),
      )
      .max(8, '인터뷰 질문은 최대 8개까지 입력할 수 있습니다.')
      .refine((questions) => new Set(questions).size === questions.length, {
        message: '인터뷰 질문은 중복 없이 입력해주세요.',
      }),
    preNotice: z
      .string()
      .trim()
      .max(2000, '사전 안내는 2000자 이하로 입력해주세요.'),
    settlementDraft: settlementDraftSchema.nullable(),
    schemaVersion: z.literal(3),
    updatedAt: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!isAnyMethodEnabled(values)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['noteEnabled'],
        message: '최소 1개 이상의 멘토링 방식을 활성화해주세요.',
      });
    }

    if (
      (values.phoneEnabled || values.onlineEnabled || values.offlineEnabled) &&
      !hasAnySchedule(values.schedule)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['schedule'],
        message:
          '전화/온라인/대면 상담을 활성화한 경우 스케줄을 1개 이상 선택해주세요.',
      });
    }

    if (hasDuplicateHolidayRange(values.holidays)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['holidays'],
        message: '휴가 기간이 서로 겹치지 않게 설정해주세요.',
      });
    }
  });

export type MentorRegistrationFormValues = z.infer<
  typeof mentorRegistrationSchema
>;
export type MentorRegistrationFormInputValues = z.input<
  typeof mentorRegistrationSchema
>;
