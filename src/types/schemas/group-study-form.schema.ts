import { z } from 'zod';
import {
  STUDY_TYPES,
  TARGET_ROLE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  REGULAR_MEETINGS,
  THUMBNAIL_EXTENSION,
  STUDY_METHODS,
} from '@/config/group-study-const';

import type {
  BasicInfoCommon,
  GroupStudyCreateRequest,
  GroupStudyRequestCommon,
  GroupStudyUpdateRequest,
} from '@/types/api/group-study.types';
import { getKoreaDate } from '@/utils/time';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const GROUP_STUDY_TITLE_MAX_LENGTH = 100;
export const GROUP_STUDY_SUMMARY_MAX_LENGTH = 200;
export const GROUP_STUDY_DESCRIPTION_MAX_LENGTH = 1000;
export const GROUP_STUDY_LOCATION_MAX_LENGTH = 255;
export const GROUP_STUDY_INTERVIEW_Q_MAX_LENGTH = 500;

export const STUDY_CLASSIFICATION = ['GROUP_STUDY', 'PREMIUM_STUDY'] as const;
export type StudyClassification = (typeof STUDY_CLASSIFICATION)[number];

export interface GroupStudyPendingDescriptionImage {
  file: File;
  objectUrl: string;
  macroFilename: string;
}

const GroupStudyPendingDescriptionImageSchema = z.object({
  file: z.instanceof(File),
  objectUrl: z.string().trim().min(1),
  macroFilename: z.string().trim().min(1),
});

const GroupStudyBaseObjectSchema = z.object({
  classification: z.enum(STUDY_CLASSIFICATION),
  // 스터디 리더 참여 여부(1)
  studyLeaderParticipation: z.boolean({
    error: '참여 여부를 체크해주세요',
  }),
  // 스터디 유형(1)
  type: z.enum(STUDY_TYPES),
  // 모집 대상(1)
  targetRoles: z
    .array(z.enum(TARGET_ROLE_OPTIONS))
    .min(1, '역할을 1개 이상 선택해 주세요.'),
  // 모집 인원(1)
  maxMembersCount: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, '최소 1명 이상을 선택해주세요.'),
  // 경력 여부(1)
  experienceLevels: z
    .array(z.enum(EXPERIENCE_LEVEL_OPTIONS))
    .min(1, '경력을 1개 이상 선택해 주세요.'),
  // 진행 방식(1)
  method: z.enum(STUDY_METHODS),
  // 진행 방식 (위치) optional (1)
  location: z
    .string()
    .trim()
    .max(
      GROUP_STUDY_LOCATION_MAX_LENGTH,
      `위치는 ${GROUP_STUDY_LOCATION_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  // 정기 모임(1)
  regularMeeting: z.enum(REGULAR_MEETINGS),
  // 진행 기간 (시작일) (1)
  startDate: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, 'YYYY-MM-DD 형식의 시작일을 입력해 주세요.'),
  // 진행 시간 (종료일) (1)
  endDate: z
    .string()
    .trim()
    .regex(ISO_DATE_REGEX, 'YYYY-MM-DD 형식의 종료일을 입력해 주세요.'),
  price: z.string().trim().optional(),
  // 스터디 제목(2)
  title: z
    .string()
    .trim()
    .min(1, '스터디 제목을 입력해주세요.')
    .max(
      GROUP_STUDY_TITLE_MAX_LENGTH,
      `제목은 ${GROUP_STUDY_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  // 스터디 한 줄 소개(2)
  summary: z
    .string()
    .trim()
    .min(1, '한 줄 소개를 입력해주세요.')
    .max(
      GROUP_STUDY_SUMMARY_MAX_LENGTH,
      `한 줄 소개는 ${GROUP_STUDY_SUMMARY_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  // 스터디 소개(2)
  description: z.string().trim().min(1, '스터디 소개를 입력해주세요.'),
  descriptionPendingImages: z
    .array(GroupStudyPendingDescriptionImageSchema)
    .optional()
    .default([]),
  // 썸네일 START(2)
  thumbnailExtension: z
    .enum(THUMBNAIL_EXTENSION)
    .refine((val) => val !== 'DEFAULT', '썸네일 이미지를 선택해주세요.'),
  thumbnailFile: z.instanceof(File).nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  // 썸네일 END(2)
  // 스터디원에게 보여줄 질문을 입력하세요(3)
  interviewPost: z
    .array(
      z
        .string()
        .trim()
        .max(
          GROUP_STUDY_INTERVIEW_Q_MAX_LENGTH,
          `질문은 ${GROUP_STUDY_INTERVIEW_Q_MAX_LENGTH}자 이하로 입력해주세요.`,
        ),
    )
    .min(1, '질문을 최소 1개 이상 입력해주세요.')
    .superRefine((arr, ctx) => {
      if (arr.length > 10) {
        ctx.addIssue({
          code: 'custom',
          message: '질문은 최대 10개까지만 입력할 수 있습니다.',
        });
      }
      arr.forEach((item, idx) => {
        if (!item || item.trim() === '') {
          ctx.addIssue({
            code: 'custom',
            message: '질문을 입력해주세요.',
            path: [idx],
          });
        }
      });
    }),
});

type GroupStudyBaseData = z.infer<typeof GroupStudyBaseObjectSchema>;

const toYmd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);

  return new Date(y, m - 1, d);
};

function buildGroupStudyRefine(
  startDateMode: 'create' | 'edit',
  originalStartDate?: string,
) {
  return (data: GroupStudyBaseData, ctx: z.RefinementCtx) => {
    const priceNum = Number(data.price);
    // 프리미엄 스터디: 10,000원 이상 필수
    if (data.classification === 'PREMIUM_STUDY') {
      if (!data.price || priceNum < 10000) {
        ctx.addIssue({
          code: 'custom',
          message: '참가비는 10,000원 이상이어야 합니다.',
          path: ['price'],
        });
      }
    }
    // 그룹 스터디: 0원만 허용
    else if (data.price && priceNum !== 0) {
      ctx.addIssue({
        code: 'custom',
        message: '그룹 스터디는 무료만 가능합니다.',
        path: ['price'],
      });
    }

    if (ISO_DATE_REGEX.test(data.startDate)) {
      // edit 모드에서 기존 날짜 그대로 유지하는 경우 → 검증 skip
      if (!(startDateMode === 'edit' && data.startDate === originalStartDate)) {
        const todayKst = getKoreaDate();
        const minDate = new Date(todayKst);
        if (startDateMode === 'create') minDate.setDate(todayKst.getDate() + 1);
        const minYmd = toYmd(minDate);

        if (data.startDate < minYmd) {
          ctx.addIssue({
            code: 'custom',
            message:
              startDateMode === 'create'
                ? '스터디 시작일은 내일부터 설정할 수 있습니다.'
                : '스터디 시작일은 오늘 이후부터 설정할 수 있습니다.',
            path: ['startDate'],
          });
        }
      }
    }

    // 종료일은 시작일과 같거나 이후여야 함
    if (
      ISO_DATE_REGEX.test(data.startDate) &&
      ISO_DATE_REGEX.test(data.endDate)
    ) {
      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);
      if (end < start) {
        ctx.addIssue({
          code: 'custom',
          message: '종료일은 시작일과 같거나 이후여야 합니다.',
          path: ['endDate'],
        });
      }
    }
  };
}

// 스터디 개설용 스키마 (시작일 최소: 내일)
export const GroupStudyFormSchema = GroupStudyBaseObjectSchema.superRefine(
  buildGroupStudyRefine('create'),
);

// 스터디 수정용 스키마 팩토리 (시작일 최소: 오늘 — 기존 스터디의 시작일 유지 허용)
export function buildGroupStudyEditFormSchema(originalStartDate?: string) {
  return GroupStudyBaseObjectSchema.superRefine(
    buildGroupStudyRefine('edit', originalStartDate),
  );
}

// 사진 상태 저장을 위한 로컬용 state
export type GroupStudyFormValues = z.input<typeof GroupStudyFormSchema> & {
  thumbnailFile?: File | undefined;
  thumbnailUrl?: string | undefined;
  descriptionPendingImages?: GroupStudyPendingDescriptionImage[] | undefined;
};
export type OpenGroupParsedValues = z.output<typeof GroupStudyFormSchema>;

export function buildOpenGroupDefaultValues(
  classification: StudyClassification = 'GROUP_STUDY',
): GroupStudyFormValues {
  return {
    classification,
    studyLeaderParticipation: false,
    type: 'PROJECT',
    targetRoles: [],
    maxMembersCount: '',
    experienceLevels: [],
    method: 'ONLINE',
    location: '',
    regularMeeting: 'NONE',
    startDate: '',
    endDate: '',
    price: '',
    title: '',
    description: '',
    summary: '',
    interviewPost: [''],
    thumbnailExtension: 'DEFAULT',
    descriptionPendingImages: [],
  };
}

// ============================================================
// 변환 함수 (내부 헬퍼)
// ============================================================

/** 공통 BasicInfo 필드 변환 */
function buildBasicInfoCommon(v: GroupStudyFormValues): BasicInfoCommon {
  const isPremiumStudy = v.classification === 'PREMIUM_STUDY';

  return {
    studyLeaderParticipation: v.studyLeaderParticipation,
    type: v.type,
    targetRoles: v.targetRoles,
    maxMembersCount: Number(v.maxMembersCount),
    experienceLevels: v.experienceLevels ?? [],
    method: v.method,
    regularMeeting: v.regularMeeting,
    location: v.location.trim(),
    startDate: v.startDate.trim(),
    endDate: v.endDate.trim(),
    price: isPremiumStudy ? Number(v.price) || 0 : 0,
  };
}

/** 공통 Request 구조 변환 */
function buildCommonRequest(v: GroupStudyFormValues): GroupStudyRequestCommon {
  const thumbnailExt =
    v.thumbnailExtension === 'DEFAULT' ? 'JPG' : v.thumbnailExtension;

  return {
    detailInfo: {
      thumbnailExtension: thumbnailExt,
      title: v.title,
      description: v.description,
      summary: v.summary,
    },
    interviewPost: {
      interviewPost: v.interviewPost ?? [],
    },
    thumbnailExtension: thumbnailExt,
  };
}

// ============================================================
// Create/Update 전용 변환 함수
// ============================================================

/** Create API용 Request 변환 */
export function toCreateRequest(
  v: GroupStudyFormValues,
): GroupStudyCreateRequest {
  return {
    ...buildCommonRequest(v),
    basicInfo: {
      ...buildBasicInfoCommon(v),
      classification: v.classification,
    },
  };
}

/** Update API용 Request 변환 */
export function toUpdateRequest(
  v: GroupStudyFormValues,
): GroupStudyUpdateRequest {
  return {
    ...buildCommonRequest(v),
    basicInfo: buildBasicInfoCommon(v),
  };
}
