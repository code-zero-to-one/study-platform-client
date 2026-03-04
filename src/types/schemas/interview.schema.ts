import { z } from 'zod';
import { STUDY_PROGRESS_OPTIONS } from '@/config/interview-const';
import type {
  DailyStudyDetail,
  StudyProgressStatus,
} from '@/types/api/interview.types';
import { UrlSchema } from '@/types/schemas/zod-schema';

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
    // "완료하기" 모달이므로 기본값을 "완료"로 설정
    // 사용자가 의도적으로 다른 상태(불참, 시작 전)를 선택해야만 변경됨
    progressStatus: 'COMPLETE' as StudyProgressStatus,
    feedback: d.feedback ?? '',
  };
}
