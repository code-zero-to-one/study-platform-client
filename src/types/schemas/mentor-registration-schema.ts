import { z } from 'zod';
import {
  getCurrentMentorCareerEntryMonth,
  MENTOR_SCHEDULE_TIMEZONE,
  MENTOR_SCHEDULE_DRAFT_MAX_LENGTH,
  normalizeMentorCareerEntries,
} from '@/features/mentoring/model/mentor-settings';
import {
  extractImageUrls,
  hasAllowedMarkdownImageExtension,
  isHttpsMarkdownImageUrl,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
  normalizeMentorMarkdownContent,
} from '@/types/mentoring/markdown';
import {
  COMPANY_CATEGORY_OPTIONS,
  CONSULTING_DURATION_OPTIONS,
  CONTACT_COUNTRY_CODES,
  MENTOR_CAREER_ENTRY_MAX_COUNT,
  WEEKDAY_KEYS,
} from '@/types/mentoring/settings';

export const MENTORING_TITLE_MIN_LENGTH = 10;
export const MENTORING_TITLE_MAX_LENGTH = 40;
export const APPEAL_LINE_MIN_LENGTH = 2;
export const APPEAL_LINE_MAX_LENGTH = 24;
export const MENTOR_SKILL_TAG_MIN_LENGTH = 2;
export const MENTOR_SKILL_TAG_MAX_LENGTH = 13;
export const CAREER_ENTRY_MAX_COUNT = MENTOR_CAREER_ENTRY_MAX_COUNT;
export const MAJOR_HISTORY_ENTRY_MAX_LENGTH = 60;
export const SCHEDULE_DAY_MAX_SLOT_COUNT = 48;
export const MENTOR_DESCRIPTION_MIN_LENGTH = 30;
export const MENTOR_DESCRIPTION_MAX_LENGTH = 30_000;
export const INTERVIEW_QUESTION_MIN_LENGTH = 8;
export const INTERVIEW_QUESTION_MAX_LENGTH = 120;
export const INTERVIEW_QUESTION_MAX_COUNT = 8;
export const INTERVIEW_QUESTION_TEXTAREA_MAX_LENGTH =
  INTERVIEW_QUESTION_MAX_LENGTH * INTERVIEW_QUESTION_MAX_COUNT +
  (INTERVIEW_QUESTION_MAX_COUNT - 1);
export const PRICE_FIELD_HARD_MIN = 0;
export const PRICE_FIELD_HARD_MAX = 1_000_000;
export const METHOD_PRICE_LIMITS = {
  note: {
    min: 3000,
    max: 100_000,
  },
  simple: {
    min: 3000,
    max: 200_000,
  },
  deep: {
    min: 3000,
    max: 300_000,
  },
  offline: {
    min: 3000,
    max: 1_000_000,
  },
} as const;
const timeSlotSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):(00|30)$/,
    '시간은 30분 단위의 HH:mm 형식이어야 합니다.',
  );

const weeklyScheduleSchema = z
  .object({
    MON: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
    TUE: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
    WED: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
    THU: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
    FRI: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
    SAT: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
    SUN: z
      .array(timeSlotSchema)
      .max(
        SCHEDULE_DAY_MAX_SLOT_COUNT,
        '하루 스케줄은 최대 48개 슬롯까지 입력할 수 있습니다.',
      ),
  })
  .superRefine((weekly, ctx) => {
    WEEKDAY_KEYS.forEach((dayKey) => {
      const slots = weekly[dayKey];
      if (new Set(slots).size !== slots.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [dayKey],
          message: `${dayKey} 스케줄 시간은 중복 없이 입력해주세요.`,
        });
      }
    });
  });

const careerEntrySchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, '주요 이력 내용을 입력해주세요.')
      .max(
        MAJOR_HISTORY_ENTRY_MAX_LENGTH,
        `주요 이력은 ${MAJOR_HISTORY_ENTRY_MAX_LENGTH}자 이하로 입력해주세요.`,
      ),
    periodEnabled: z.boolean(),
    startMonth: z.string().trim(),
    endMonth: z.string().trim(),
    isCurrent: z.boolean(),
  })
  .superRefine((entry, ctx) => {
    if (!entry.periodEnabled) {
      return;
    }

    const hasStartMonth = entry.startMonth.length > 0;
    const hasEndMonth = entry.endMonth.length > 0;
    const currentMonth = getCurrentMentorCareerEntryMonth();
    const isCurrent = entry.isCurrent === true;

    if (!hasStartMonth && (hasEndMonth || isCurrent)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startMonth'],
        message: '시작 기간을 입력해주세요.',
      });
    }

    if (hasStartMonth && entry.startMonth > currentMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startMonth'],
        message: '시작 기간은 현재 월 이후로 입력할 수 없습니다.',
      });
    }

    if (hasStartMonth && !hasEndMonth && !isCurrent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMonth'],
        message: '종료 기간을 입력해주세요.',
      });
    }

    if (isCurrent && hasEndMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMonth'],
        message: '현재 재직 중이면 종료 기간을 비워주세요.',
      });
    }

    if (
      hasStartMonth &&
      hasEndMonth &&
      !isCurrent &&
      entry.startMonth > entry.endMonth
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMonth'],
        message: '종료 기간은 시작 기간보다 빠를 수 없습니다.',
      });
    }

    if (hasEndMonth && !isCurrent && entry.endMonth > currentMonth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endMonth'],
        message: '종료 기간은 현재 월 이후로 입력할 수 없습니다.',
      });
    }
  });

const careerEntryInputSchema = z.object({
  description: z.string().optional().default(''),
  periodEnabled: z.boolean().optional(),
  startMonth: z.string().optional().default(''),
  endMonth: z.string().optional().default(''),
  isCurrent: z.boolean().optional().default(false),
});

const scheduleSchema = z.object({
  timezone: z.literal(MENTOR_SCHEDULE_TIMEZONE),
  slotUnitMinutes: z.literal(30),
  weekly: weeklyScheduleSchema,
});

export const createEmptyMentorScheduleDrafts = (): Record<
  (typeof WEEKDAY_KEYS)[number],
  string[]
> => {
  return Object.fromEntries(
    WEEKDAY_KEYS.map((day): [(typeof WEEKDAY_KEYS)[number], string[]] => [
      day,
      [],
    ]),
  ) as Record<(typeof WEEKDAY_KEYS)[number], string[]>;
};

const scheduleDraftTextSchema = z
  .string()
  .max(
    MENTOR_SCHEDULE_DRAFT_MAX_LENGTH,
    `스케줄 입력은 ${MENTOR_SCHEDULE_DRAFT_MAX_LENGTH}자 이하로 입력해주세요.`,
  );

const scheduleDraftsSchema = z.object({
  MON: z.array(scheduleDraftTextSchema),
  TUE: z.array(scheduleDraftTextSchema),
  WED: z.array(scheduleDraftTextSchema),
  THU: z.array(scheduleDraftTextSchema),
  FRI: z.array(scheduleDraftTextSchema),
  SAT: z.array(scheduleDraftTextSchema),
  SUN: z.array(scheduleDraftTextSchema),
});

const legacyContactEmailSchema = z.string().trim().default('');

const hasAnySchedule = (schedule: z.infer<typeof scheduleSchema>) => {
  return WEEKDAY_KEYS.some((key) => schedule.weekly[key].length > 0);
};

export const mentorRegistrationSchema = z
  .object({
    contactCountryCode: z.enum(CONTACT_COUNTRY_CODES),
    contactPhone: z
      .string()
      .trim()
      .refine((value) => value === '' || /^\d{8,12}$/.test(value), {
        message: '연락처는 숫자 8~12자리로 입력해주세요.',
      }),
    contactEmail: legacyContactEmailSchema,
    categories: z.array(z.string().trim().min(1)).default([]),
    mentoringTitle: z
      .string()
      .trim()
      .min(
        MENTORING_TITLE_MIN_LENGTH,
        `멘토링명은 ${MENTORING_TITLE_MIN_LENGTH}자 이상 입력해주세요.`,
      )
      .max(
        MENTORING_TITLE_MAX_LENGTH,
        `멘토링명은 ${MENTORING_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
      ),
    appealLine: z
      .string()
      .trim()
      .min(
        APPEAL_LINE_MIN_LENGTH,
        `한 줄 어필은 ${APPEAL_LINE_MIN_LENGTH}자 이상 입력해주세요.`,
      )
      .max(
        APPEAL_LINE_MAX_LENGTH,
        `한 줄 어필은 ${APPEAL_LINE_MAX_LENGTH}자 이하로 입력해주세요.`,
      ),
    jobGroup: z.string().trim().min(1, '멘토 직군을 선택해주세요.'),
    jobTitle: z.string().trim().min(1, '멘토 직무를 선택해주세요.'),
    careerYears: z.string().trim().min(1, '멘토 경력을 선택해주세요.'),
    careerEntries: z
      .array(careerEntryInputSchema)
      .default([])
      .transform((entries) => normalizeMentorCareerEntries(entries))
      .pipe(
        z
          .array(careerEntrySchema)
          .max(
            CAREER_ENTRY_MAX_COUNT,
            `주요 이력은 최대 ${CAREER_ENTRY_MAX_COUNT}개까지 입력할 수 있습니다.`,
          ),
      ),
    skillTags: z
      .array(
        z
          .string()
          .trim()
          .min(
            MENTOR_SKILL_TAG_MIN_LENGTH,
            '핵심 키워드는 2자 이상이어야 합니다.',
          )
          .max(
            MENTOR_SKILL_TAG_MAX_LENGTH,
            `핵심 키워드는 ${MENTOR_SKILL_TAG_MAX_LENGTH}자 이하로 입력해주세요.`,
          ),
      )
      .min(1, '핵심 키워드를 최소 1개 선택해주세요.')
      .refine((skillTags) => new Set(skillTags).size === skillTags.length, {
        message: '핵심 키워드는 중복 없이 선택해주세요.',
      }),
    companyCategory: z.enum(COMPANY_CATEGORY_OPTIONS).default('기타'),
    companyName: z.string().default(''),
    hideCompanyName: z.boolean().default(true),
    listVisible: z.boolean(),
    maxParticipants: z.coerce
      .number()
      .int('최대인원은 정수여야 합니다.')
      .min(1, '최대인원은 1명 이상이어야 합니다.')
      .max(10, '최대인원은 10명 이하여야 합니다.'),
    noteEnabled: z.boolean(),
    notePrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(PRICE_FIELD_HARD_MIN, '가격은 0원 이상이어야 합니다.')
      .max(PRICE_FIELD_HARD_MAX, '가격은 1,000,000원 이하여야 합니다.'),
    simpleEnabled: z.boolean(),
    simplePrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(PRICE_FIELD_HARD_MIN, '가격은 0원 이상이어야 합니다.')
      .max(PRICE_FIELD_HARD_MAX, '가격은 1,000,000원 이하여야 합니다.'),
    deepEnabled: z.boolean(),
    deepPrice: z.coerce
      .number()
      .int('가격은 정수여야 합니다.')
      .min(PRICE_FIELD_HARD_MIN, '가격은 0원 이상이어야 합니다.')
      .max(PRICE_FIELD_HARD_MAX, '가격은 1,000,000원 이하여야 합니다.'),
    deepDurationMinutes: z.union(
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
      .min(PRICE_FIELD_HARD_MIN, '가격은 0원 이상이어야 합니다.')
      .max(PRICE_FIELD_HARD_MAX, '가격은 1,000,000원 이하여야 합니다.'),
    offlineDurationMinutes: z.union(
      CONSULTING_DURATION_OPTIONS.map((value) => z.literal(value)) as [
        z.ZodLiteral<30>,
        z.ZodLiteral<60>,
        z.ZodLiteral<90>,
      ],
    ),
    schedule: scheduleSchema,
    scheduleDrafts: scheduleDraftsSchema.default(
      createEmptyMentorScheduleDrafts,
    ),
    detailedDescription: z
      .string()
      .trim()
      .max(
        MENTOR_DESCRIPTION_MAX_LENGTH,
        `멘토 소개는 ${MENTOR_DESCRIPTION_MAX_LENGTH.toLocaleString()}자 이하로 입력해주세요.`,
      )
      .default(''),
    interviewQuestions: z
      .array(
        z
          .string()
          .trim()
          .min(
            INTERVIEW_QUESTION_MIN_LENGTH,
            `상담 전 준비사항은 ${INTERVIEW_QUESTION_MIN_LENGTH}자 이상 입력해주세요.`,
          )
          .max(
            INTERVIEW_QUESTION_MAX_LENGTH,
            `상담 전 준비사항은 ${INTERVIEW_QUESTION_MAX_LENGTH}자 이하로 입력해주세요.`,
          ),
      )
      .max(
        INTERVIEW_QUESTION_MAX_COUNT,
        `상담 전 준비사항은 최대 ${INTERVIEW_QUESTION_MAX_COUNT}개까지 입력할 수 있습니다.`,
      )
      .refine((questions) => new Set(questions).size === questions.length, {
        message: '상담 전 준비사항은 중복 없이 입력해주세요.',
      }),
    preNotice: z.string().default(''),
    updatedAt: z.string(),
  })
  .superRefine((values, ctx) => {
    const normalizedDescription = normalizeMentorMarkdownContent(
      values.detailedDescription,
    );
    const validateEnabledPriceRange = ({
      enabled,
      price,
      min,
      max,
      path,
      label,
    }: {
      enabled: boolean;
      price: number;
      min: number;
      max: number;
      path: 'notePrice' | 'simplePrice' | 'deepPrice' | 'offlinePrice';
      label: string;
    }) => {
      if (!enabled) {
        return;
      }

      if (price < min || price > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path],
          message: `${label} 가격은 ${min.toLocaleString()}원~${max.toLocaleString()}원 범위여야 합니다.`,
        });
      }
    };

    if (
      normalizedDescription.length > 0 &&
      normalizedDescription.length < MENTOR_DESCRIPTION_MIN_LENGTH
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detailedDescription'],
        message: `멘토 소개는 ${MENTOR_DESCRIPTION_MIN_LENGTH}자 이상 입력해주세요.`,
      });
    }

    validateEnabledPriceRange({
      enabled: values.noteEnabled,
      price: values.notePrice,
      min: METHOD_PRICE_LIMITS.note.min,
      max: METHOD_PRICE_LIMITS.note.max,
      path: 'notePrice',
      label: '쪽지상담',
    });
    validateEnabledPriceRange({
      enabled: values.simpleEnabled,
      price: values.simplePrice,
      min: METHOD_PRICE_LIMITS.simple.min,
      max: METHOD_PRICE_LIMITS.simple.max,
      path: 'simplePrice',
      label: '간편상담',
    });
    validateEnabledPriceRange({
      enabled: values.deepEnabled,
      price: values.deepPrice,
      min: METHOD_PRICE_LIMITS.deep.min,
      max: METHOD_PRICE_LIMITS.deep.max,
      path: 'deepPrice',
      label: '심층상담',
    });
    validateEnabledPriceRange({
      enabled: values.offlineEnabled,
      price: values.offlinePrice,
      min: METHOD_PRICE_LIMITS.offline.min,
      max: METHOD_PRICE_LIMITS.offline.max,
      path: 'offlinePrice',
      label: '대면상담',
    });

    if (
      (values.simpleEnabled || values.deepEnabled || values.offlineEnabled) &&
      !hasAnySchedule(values.schedule)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['schedule'],
        message:
          '간편/심층/대면 상담을 활성화한 경우 스케줄을 1개 이상 선택해주세요.',
      });
    }

    const markdownImageUrls = extractImageUrls(normalizedDescription);
    if (markdownImageUrls.length > MENTOR_MARKDOWN_MAX_IMAGE_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detailedDescription'],
        message: `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지만 등록할 수 있습니다.`,
      });
    }

    if (!markdownImageUrls.every(isHttpsMarkdownImageUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detailedDescription'],
        message: '이미지 URL은 http/https 또는 /images/** 경로만 허용됩니다.',
      });
    }

    if (!markdownImageUrls.every(hasAllowedMarkdownImageExtension)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['detailedDescription'],
        message: '이미지는 jpg/png/webp/gif 확장자만 허용됩니다.',
      });
    }

    const currentCareerEntryCount = values.careerEntries.filter(
      (entry) => entry.isCurrent === true,
    ).length;
    if (currentCareerEntryCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['careerEntries'],
        message: '현재 재직 항목은 1개만 선택할 수 있습니다.',
      });
    }
  });

export type MentorRegistrationFormValues = z.infer<
  typeof mentorRegistrationSchema
>;
export type MentorRegistrationFormInputValues = z.input<
  typeof mentorRegistrationSchema
>;
