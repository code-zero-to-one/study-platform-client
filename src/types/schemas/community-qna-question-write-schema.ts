import { z } from 'zod';
import {
  COMMUNITY_WRITE_CONTENT_MAX_VISIBLE_LENGTH,
  COMMUNITY_WRITE_TITLE_MAX_LENGTH,
  validateCommunityWriteContent,
} from './community-write-schema';

export const communityQnaQuestionWriteSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, '제목은 2자 이상 입력해주세요.')
      .max(
        COMMUNITY_WRITE_TITLE_MAX_LENGTH,
        `제목은 ${COMMUNITY_WRITE_TITLE_MAX_LENGTH}자 이하로 입력해주세요.`,
      ),
    content: z.string(),
  })
  .superRefine((values, ctx) => {
    validateCommunityWriteContent({
      content: values.content,
      ctx,
      maxVisibleTextLength: COMMUNITY_WRITE_CONTENT_MAX_VISIBLE_LENGTH,
      maxVisibleTextMessage: `본문은 보이는 글자수 기준 ${COMMUNITY_WRITE_CONTENT_MAX_VISIBLE_LENGTH.toLocaleString()}자 이하여야 합니다.`,
    });
  });

export type CommunityQnaQuestionWriteFormValues = z.infer<
  typeof communityQnaQuestionWriteSchema
>;
