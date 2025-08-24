import { z } from 'zod';
import { UrlSchema } from '@/shared/util/zod-schema';
import type { DailyStudyDetail, StudyProgressStatus } from '../api/types';
import { STUDY_PROGRESS_OPTIONS } from '../consts/study-const';

// 스터디 준비 스키마
export const StudyReadyFormSchema = z.object({
  subject: z.string().trim().min(1, '면접 주제를 입력해 주세요.'),
  link: UrlSchema,
});

export type StudyReadyFormValues = z.infer<typeof StudyReadyFormSchema>;

export function buildStudyReadyDefaults(
  d: DailyStudyDetail,
): StudyReadyFormValues {
  return {
    subject: d.subject ?? '',
    link: d.link ?? '',
  };
}

// 스터디 완료 스키마
const STUDY_PROGRESS_VALUES = STUDY_PROGRESS_OPTIONS.map((o) => o.value) as [
  string,
  ...string[],
];

export const StudyDoneFormSchema = z.object({
  progressStatus: z.enum(STUDY_PROGRESS_VALUES, {
    message: '진행 현황을 선택해 주세요.',
  }),
  feedback: z
    .string()
    .trim()
    .min(1, '피드백을 입력해 주세요.')
    .max(100, '최대 100자까지 입력 가능합니다.'),
});

export type StudyDoneFormValues = z.infer<typeof StudyDoneFormSchema>;

export function buildStudyDoneDefaults(
  d: DailyStudyDetail,
): StudyDoneFormValues {
  return {
    progressStatus: (d.progressStatus ?? 'PENDING') as StudyProgressStatus,
    feedback: d.feedback ?? '',
  };
}
