import { z } from 'zod';

export enum QuestionCategory {
  PAYMENT = 'PAYMENT',
  STUDY_COMMON = 'STUDY_COMMON',
  LEADER = 'LEADER',
  BUG = 'BUG',
  CONCERN = 'CONCERN',
}

export const QUESTION_TITLE_MIN_LENGTH = 2;
export const QUESTION_CONTENT_MIN_LENGTH = 20;
export const QUESTION_TITLE_MAX_LENGTH = 255;
export const QUESTION_CONTENT_MAX_LENGTH = 3000;

export const questionSchema = z.object({
  title: z
    .string()
    .min(
      QUESTION_TITLE_MIN_LENGTH,
      `제목은 ${QUESTION_TITLE_MIN_LENGTH}자 이상 입력해주세요.`,
    )
    .max(
      QUESTION_TITLE_MAX_LENGTH,
      `제목은 ${QUESTION_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  content: z
    .string()
    .min(
      QUESTION_CONTENT_MIN_LENGTH,
      `내용은 ${QUESTION_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`,
    )
    .max(
      QUESTION_CONTENT_MAX_LENGTH,
      `내용은 ${QUESTION_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
  category: z.nativeEnum(QuestionCategory, {
    message: '카테고리를 선택해주세요.',
  }),
  imageExtension: z.string().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
