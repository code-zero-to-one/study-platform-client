import z from 'zod';

export const DeleteGroupStudyMemberFormSchema = z.object({
  reason: z.string().nonempty('내보내는 사유를 작성해 주세요.'),
});

export type DeleteGroupStudyMemberFormValues = z.infer<
  typeof DeleteGroupStudyMemberFormSchema
>;
