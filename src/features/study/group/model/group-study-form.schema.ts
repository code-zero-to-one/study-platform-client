import { z } from 'zod';
import { getKoreaDate } from '@/utils/time';
import {
  BasicInfoCommon,
  GroupStudyCreateRequest,
  GroupStudyFormRequest,
  GroupStudyRequestCommon,
  GroupStudyUpdateRequest,
} from '../api/group-study-types';
import {
  STUDY_TYPES,
  TARGET_ROLE_OPTIONS,
  EXPERIENCE_LEVEL_OPTIONS,
  REGULAR_MEETINGS,
  THUMBNAIL_EXTENSION,
  STUDY_METHODS,
} from '../const/group-study-const';

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const STUDY_CLASSIFICATION = ['GROUP_STUDY', 'PREMIUM_STUDY'] as const;
export type StudyClassification = (typeof STUDY_CLASSIFICATION)[number];

export const GroupStudyFormSchema = z
  .object({
    classification: z.enum(STUDY_CLASSIFICATION),
    // 스터디 리더 참여 여부(1)
    studyLeaderParticipation: z.boolean('참여 여부를 체크해주세요'),
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
    location: z.string().trim(),
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
    title: z.string().trim().min(1, '스터디 제목을 입력해주세요.'),
    // 스터디 한 줄 소개(2)
    summary: z.string().trim().min(1, '한 줄 소개를 입력해주세요.'),
    // 스터디 소개(2)
    description: z.string().trim().min(1, '스터디 소개를 입력해주세요.'),
    // 썸네일 START(2)
    thumbnailExtension: z
      .enum(THUMBNAIL_EXTENSION)
      .refine((val) => val !== 'DEFAULT', '썸네일 이미지를 선택해주세요.'),
    thumbnailFile: z.instanceof(File).nullable().optional(),
    thumbnailUrl: z.string().nullable().optional(),
    // 썸네일 END(2)
    // 스터디원에게 보여줄 질문을 입력하세요(3)
    interviewPost: z
      .array(z.string())
      .refine((arr) => arr.length > 0 && arr.every((v) => v.trim() !== ''), {
        message: '모든 질문을 입력해야 합니다.',
      })
      .refine((arr) => arr.length <= 10, {
        message: '질문은 최대 10개까지만 입력할 수 있습니다.',
      }),
  })
  .superRefine((data, ctx) => {
    const priceNum = Number(data.price);
    // 프리미엄 스터디: 10,000원 이상 필수
    if (data.classification === 'PREMIUM_STUDY') {
      if (!data.price || priceNum < 10000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '참가비는 10,000원 이상이어야 합니다.',
          path: ['price'],
        });
      }
    }
    // 그룹 스터디: 0원만 허용
    else if (data.price && priceNum !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '그룹 스터디는 무료만 가능합니다.',
        path: ['price'],
      });
    }

    const parseDate = (s: string) => {
      const [y, m, d] = s.split('-').map(Number);

      return new Date(y, m - 1, d);
    };

    if (ISO_DATE_REGEX.test(data.startDate)) {
      const todayKst = getKoreaDate();
      const tomorrow = new Date(todayKst);
      tomorrow.setDate(todayKst.getDate() + 1);
      const toYmd = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
          d.getDate(),
        ).padStart(2, '0')}`;
      const tomorrowYmd = toYmd(tomorrow);

      if (data.startDate < tomorrowYmd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '스터디 시작일은 내일부터 설정할 수 있습니다.',
          path: ['startDate'],
        });
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
          code: z.ZodIssueCode.custom,
          message: '종료일은 시작일과 같거나 이후여야 합니다.',
          path: ['endDate'],
        });
      }
    }
  });

// 사진 상태 저장을 위한 로컬용 state
export type GroupStudyFormValues = z.input<typeof GroupStudyFormSchema> & {
  thumbnailFile?: File | undefined;
  thumbnailUrl?: string | undefined;
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

// ============================================================
// 기존 함수 (하위 호환성 유지)
// ============================================================

/** @deprecated toCreateRequest 또는 toUpdateRequest 사용 권장 */
export function toOpenGroupRequest(
  v: GroupStudyFormValues,
): GroupStudyFormRequest {
  return toCreateRequest(v);
}
