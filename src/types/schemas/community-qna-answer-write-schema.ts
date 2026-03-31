import { z } from 'zod';
import {
  COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS_LABEL,
  COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT,
  extractImageUrls,
  hasAllowedCommunityMarkdownImageExtension,
  hasMeaningfulCommunityMarkdownContent,
  hasUnsafeCommunityMarkdownHtml,
  isCommunityMarkdownImageUrl,
} from '@/types/community/markdown';

export const communityQnaAnswerWriteSchema = z
  .object({
    content: z.string(),
  })
  .superRefine((values, ctx) => {
    if (hasUnsafeCommunityMarkdownHtml(values.content)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '허용되지 않는 HTML 또는 스크립트는 사용할 수 없습니다.',
      });
    }

    if (!hasMeaningfulCommunityMarkdownContent(values.content)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '본문을 입력해주세요.',
      });
    }

    const imageUrls = extractImageUrls(values.content);

    if (imageUrls.length > COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: `이미지는 최대 ${COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT}개까지 첨부할 수 있습니다.`,
      });
    }

    if (!imageUrls.every(isCommunityMarkdownImageUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '이미지 주소는 업로드된 안전한 URL만 사용할 수 있습니다.',
      });
    }

    if (!imageUrls.every(hasAllowedCommunityMarkdownImageExtension)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: `이미지는 ${COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS_LABEL} 형식만 사용할 수 있습니다.`,
      });
    }
  });

export type CommunityQnaAnswerWriteFormValues = z.infer<
  typeof communityQnaAnswerWriteSchema
>;
