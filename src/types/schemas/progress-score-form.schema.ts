import { z } from 'zod';

export const ProgressScoreFormSchema = z.object({
  gradeId: z.number().refine((val) => val >= 1 && val <= 7, {
    message: '진행점수를 선택해주세요.',
  }),
  reason: z
    .string()
    .min(1, '사유를 입력해주세요.')
    .max(100, '사유는 100자 이하로 입력해주세요.'),
});

export type ProgressScoreFormValues = z.infer<typeof ProgressScoreFormSchema>;
