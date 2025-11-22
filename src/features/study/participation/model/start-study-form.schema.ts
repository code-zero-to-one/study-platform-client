import { z } from 'zod';
import { JoinStudyRequest } from '@/features/study/participation/api/participation-types';
import { UrlSchema } from '@/types/schemas/zod-schema';

export const StartStudyFormSchema = z.object({
  selfIntroduction: z
    .string()
    .trim()
    .min(1, '자기소개를 입력해 주세요.')
    .max(500, '최대 500자까지 입력 가능합니다.'),
  studyPlan: z
    .string()
    .trim()
    .min(1, '공부 계획을 입력해 주세요.')
    .max(500, '최대 500자까지 입력 가능합니다.'),
  tel: z
    .string()
    .trim()
    .regex(
      /^\d{2,3}-\d{3,4}-\d{4}$/,
      '연락처 형식이 올바르지 않습니다. (예: 010-1234-5678)',
    ),
  githubLink: UrlSchema.optional().transform((v) => (v === '' ? undefined : v)),
  blogOrSnsLink: UrlSchema.optional().transform((v) =>
    v === '' ? undefined : v,
  ),

  preferredStudySubjectId: z
    .string()
    .min(1, '선호하는 스터디 주제를 선택해 주세요.'),

  availableStudyTimeIds: z
    .array(z.string())
    .min(1, '가능 시간대를 1개 이상 선택해 주세요.'),
  techStackIds: z
    .array(z.string())
    .min(1, '기술 스택을 1개 이상 선택해 주세요.'),
});

export type StartStudyFormValues = z.infer<typeof StartStudyFormSchema>;

export function buildStartStudyDefaultValues(): StartStudyFormValues {
  return {
    selfIntroduction: '',
    studyPlan: '',
    tel: '',
    githubLink: '',
    blogOrSnsLink: '',
    preferredStudySubjectId: '',
    availableStudyTimeIds: [],
    techStackIds: [],
  };
}

export function toJoinStudyRequest(
  memberId: number,
  v: StartStudyFormValues,
): JoinStudyRequest {
  const github = v.githubLink?.trim();
  const blog = v.blogOrSnsLink?.trim();

  return {
    memberId,
    selfIntroduction: v.selfIntroduction.trim(),
    studyPlan: v.studyPlan.trim(),
    tel: v.tel.trim(),
    githubLink: github ? github : undefined,
    blogOrSnsLink: blog ? blog : undefined,
    preferredStudySubjectId: v.preferredStudySubjectId,
    availableStudyTimeIds: v.availableStudyTimeIds.map(Number),
    techStackIds: v.techStackIds.map(Number),
  };
}
