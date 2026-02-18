import { z } from 'zod';

export enum QuestionCategory {
  PAYMENT = 'PAYMENT',
  STUDY_COMMON = 'STUDY_COMMON',
  LEADER = 'LEADER',
  BUG = 'BUG',
  CONCERN = 'CONCERN',
}

export const QUESTION_TITLE_MAX_LENGTH = 255;
export const QUESTION_CONTENT_MAX_LENGTH = 3000;

export const questionSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(
      QUESTION_TITLE_MAX_LENGTH,
      `제목은 ${QUESTION_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  content: z
    .string()
    .min(1, '내용을 입력해주세요.')
    .max(
      QUESTION_CONTENT_MAX_LENGTH,
      `내용은 ${QUESTION_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  category: z.nativeEnum(QuestionCategory, {
    message: '카테고리를 선택해주세요.',
  }),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
