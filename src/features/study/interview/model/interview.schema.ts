import { z } from 'zod';
import type {
  CompleteStudyProgressStatus,
  DailyStudyDetail,
} from '@/features/study/interview/api/interview-types';
import { STUDY_DONE_PROGRESS_OPTIONS } from '@/features/study/interview/const/interview-const';
import { UrlSchema } from '@/types/schemas/zod-schema';

export const StudyReadyFormSchema = z.object({
  subject: z.string().trim().min(1, '면접 주제를 입력해 주세요.'),
  link: UrlSchema,
});

export type StudyReadyFormValues = z.infer<typeof StudyReadyFormSchema>;

export function buildStudyReadyDefaults(
  data: DailyStudyDetail,
): StudyReadyFormValues {
  return {
    subject: data.subject ?? '',
    link: data.link ?? '',
  };
}

const STUDY_DONE_PROGRESS_VALUES = STUDY_DONE_PROGRESS_OPTIONS.map(
  (option) => option.value,
) as [CompleteStudyProgressStatus, ...CompleteStudyProgressStatus[]];

export const STUDY_DONE_FEEDBACK_MAX_LENGTH = 100;

const StudyDoneFeedbackSchema = z
  .string()
  .trim()
  .max(
    STUDY_DONE_FEEDBACK_MAX_LENGTH,
    `최대 ${STUDY_DONE_FEEDBACK_MAX_LENGTH}자까지 입력 가능합니다.`,
  );

export const StudyDoneFormSchema = z
  .object({
    progressStatus: z.enum(STUDY_DONE_PROGRESS_VALUES, {
      message: '진행 현황을 선택해 주세요.',
    }),
    feedback: StudyDoneFeedbackSchema,
  })
  .superRefine(({ progressStatus, feedback }, ctx) => {
    if (progressStatus === 'COMPLETE' && feedback.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['feedback'],
        message: '피드백을 입력해 주세요.',
      });
    }
  });

export type StudyDoneFormValues = z.infer<typeof StudyDoneFormSchema>;

export function buildStudyDoneDefaults(
  data: DailyStudyDetail,
): StudyDoneFormValues {
  return {
    progressStatus: data.progressStatus === 'ABSENT' ? 'ABSENT' : 'COMPLETE',
    feedback: data.feedback ?? '',
  };
}
