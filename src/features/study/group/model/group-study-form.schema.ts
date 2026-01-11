import { z } from 'zod';
import {
  GroupStudyCreationRequestDto,
  GroupStudyFormRequest,
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

export const GroupStudyFormSchema = z.object({
  classification: z.enum(STUDY_CLASSIFICATION),
  // 스터디 리더 참여 여부(1)
  studyLeaderParticipation: z.boolean(),
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
  price: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || Number(val) >= 10000,
      '참가비는 10,000원 이상이어야 합니다.',
    ),
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

export function toOpenGroupRequest(
  v: GroupStudyFormValues,
): GroupStudyCreationRequestDto {
  const isPremiumStudy = v.classification === 'PREMIUM_STUDY';
  const thumbnailExt =
    v.thumbnailExtension === 'DEFAULT' ? 'JPG' : v.thumbnailExtension;

  return {
    studyLeaderParticipation: v.studyLeaderParticipation,
    basicInfo: {
      classification: v.classification,
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
    },
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
