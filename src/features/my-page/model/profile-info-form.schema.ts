import { z } from 'zod';
import type { MemberInfo } from '@/entities/user/api/types';
import type { UpdateUserProfileInfoRequest } from '../api/types';

export const ProfileInfoFormSchema = z.object({
  selfIntroduction: z
    .string()
    .trim()
    .max(500, '최대 500자까지 입력 가능합니다.'),

  studyPlan: z
    .string()
    .trim()
    .min(1, '공부 계획을 입력해 주세요.')
    .max(500, '최대 500자까지 입력 가능합니다.'),

  preferredStudySubjectId: z
    .string()
    .min(1, '선호하는 스터디 주제를 선택해 주세요.')
    .optional(),

  availableStudyTimeIds: z
    .array(z.string())
    .min(1, '가능 시간대를 1개 이상 선택해 주세요.'),

  // 기본정보로 이동 (SPRINT2 프로필개선) => ProfileInfo에서 삭제
  // techStackIds: z
  //   .array(z.string())
  //   .min(1, '기술 스택을 1개 이상 선택해 주세요.'),

  // 기본정보에 추가되는 정보들 (SPRINT2 프로필개선)
  jobs: z.array(z.string()),

  career: z.string(),

  studyFormatTypes: z.array(z.string()),

  goal: z.string(),
});

export type ProfileInfoFormValues = z.infer<typeof ProfileInfoFormSchema>;

export function buildProfileInfoDefaultValues(
  member: MemberInfo,
): ProfileInfoFormValues {
  return {
    selfIntroduction: member.selfIntroduction ?? '',
    studyPlan: member.studyPlan ?? '',
    preferredStudySubjectId: member.preferredStudySubject
      ? String(member.preferredStudySubject.studySubjectId)
      : undefined,
    availableStudyTimeIds: (member.availableStudyTimes ?? [])
      .map((t) => t?.id)
      .filter((x): x is number => typeof x === 'number')
      .map(String),
    // techStackIds: (member.techStacks ?? [])
    //   .map((t) => t?.techStackId)
    //   .filter((x): x is number => typeof x === 'number')
    //   .map(String),

    jobs:
      member.jobs
        ?.map((j) => (j.job ? String(j.job) : undefined))
        .filter(
          (x): x is string => x !== undefined && x !== null && x !== '',
        ) ?? [],
    career: member.career?.career || undefined,
    studyFormatTypes:
      member.studyFormatTypes &&
      Array.isArray(member.studyFormatTypes) &&
      member.studyFormatTypes.length > 0
        ? member.studyFormatTypes
            .map((item) => item.studyFormatType)
            .filter(
              (v): v is string =>
                v !== undefined && v !== null && v.trim() !== '',
            )
        : [],
    goal: member.goal ?? '',
  };
}

export function toUpdateUserProfileInfoRequest(
  v: ProfileInfoFormValues,
): UpdateUserProfileInfoRequest {
  return {
    selfIntroduction: v.selfIntroduction,
    studyPlan: v.studyPlan,
    preferredStudySubjectId: v.preferredStudySubjectId!,
    availableStudyTimeIds: v.availableStudyTimeIds.map(Number),
    // techStackIds: v.techStackIds.map(Number),

    jobs: v.jobs ?? [],
    career: v.career ?? '',
    studyFormatTypes: v.studyFormatTypes ?? [],
    goal: v.goal,
  };
}
