import { z } from 'zod';

export const COMMUNITY_QNA_COMMENT_MAX_LENGTH = 300;

export const communityQnaCommentWriteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, '댓글을 입력해주세요.')
    .max(
      COMMUNITY_QNA_COMMENT_MAX_LENGTH,
      `댓글은 ${COMMUNITY_QNA_COMMENT_MAX_LENGTH}자 이하로 입력해주세요.`,
    ),
});

export type CommunityQnaCommentWriteFormValues = z.infer<
  typeof communityQnaCommentWriteSchema
>;
