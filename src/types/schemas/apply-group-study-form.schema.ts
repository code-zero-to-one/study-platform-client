import z from 'zod';

export const ApplyGroupStudyFormSchema = z.object({
  answer: z.array(
    z.string().min(1, '답변을 작성해주세요.'), // 각 항목에 최소 1글자 이상
  ),
  agree: z
    .boolean()
    .refine((val) => val === true, { message: '참여 규칙에 동의해야 합니다.' }),
});

export type ApplyGroupStudyFormData = z.infer<typeof ApplyGroupStudyFormSchema>;
