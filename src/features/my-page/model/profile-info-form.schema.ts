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

  preferredStudySubjectId: z.string().optional(),

  availableStudyTimeIds: z
    .array(z.string())
    .min(1, '가능 시간대를 1개 이상 선택해 주세요.'),

  techStackIds: z
    .array(z.string())
    .min(1, '기술 스택을 1개 이상 선택해 주세요.'),
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
    techStackIds: (member.techStacks ?? [])
      .map((t) => t?.techStackId)
      .filter((x): x is number => typeof x === 'number')
      .map(String),
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
    techStackIds: v.techStackIds.map(Number),
  };
}
