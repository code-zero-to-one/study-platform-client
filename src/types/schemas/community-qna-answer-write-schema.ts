import { z } from 'zod';
import { validateCommunityWriteContent } from './community-write-schema';

export const COMMUNITY_QNA_ANSWER_CONTENT_MAX_VISIBLE_LENGTH = 3_000;

export const communityQnaAnswerWriteSchema = z
  .object({
    content: z.string(),
  })
  .superRefine((values, ctx) => {
    validateCommunityWriteContent({
      content: values.content,
      ctx,
      maxVisibleTextLength: COMMUNITY_QNA_ANSWER_CONTENT_MAX_VISIBLE_LENGTH,
      maxVisibleTextMessage: `답변 본문은 보이는 글자수 기준 ${COMMUNITY_QNA_ANSWER_CONTENT_MAX_VISIBLE_LENGTH.toLocaleString()}자 이하여야 합니다.`,
    });
  });

export type CommunityQnaAnswerWriteFormValues = z.infer<
  typeof communityQnaAnswerWriteSchema
>;
