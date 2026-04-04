import { z } from 'zod';
import { COMMUNITY_BOARD } from '@/types/community/domain';
import {
  extractImageUrls,
  hasAllowedMarkdownImageExtension,
  isHttpsMarkdownImageUrl,
  MENTOR_MARKDOWN_MAX_IMAGE_COUNT,
} from '@/types/mentoring/markdown';

export const COMMUNITY_WRITE_TITLE_MAX_LENGTH = 80;

const COMMUNITY_BOARD_VALUES = [
  COMMUNITY_BOARD.QNA,
  COMMUNITY_BOARD.FREE,
  COMMUNITY_BOARD.ACHIEVEMENT,
  COMMUNITY_BOARD.KNOWLEDGE,
] as const;

const COMMUNITY_WRITE_HTML_BREAK_TAGS =
  /<(br|\/p|\/div|\/li|\/blockquote|\/h[1-6])[^>]*>/gi;
const COMMUNITY_WRITE_HTML_TAGS = /<[^>]+>/g;

const extractCommunityWritePlainText = (content: string) => {
  return content
    .replace(/&nbsp;/gi, ' ')
    .replace(COMMUNITY_WRITE_HTML_BREAK_TAGS, '\n')
    .replace(COMMUNITY_WRITE_HTML_TAGS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const hasMeaningfulCommunityWriteContent = (content: string) => {
  return (
    extractCommunityWritePlainText(content).length > 0 ||
    extractImageUrls(content).length > 0
  );
};

export const communityWriteSchema = z
  .object({
    board: z.enum(COMMUNITY_BOARD_VALUES),
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
    if (!hasMeaningfulCommunityWriteContent(values.content)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '본문을 입력해주세요.',
      });
    }

    const imageUrls = extractImageUrls(values.content);

    if (imageUrls.length > MENTOR_MARKDOWN_MAX_IMAGE_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: `이미지는 최대 ${MENTOR_MARKDOWN_MAX_IMAGE_COUNT}개까지 첨부할 수 있습니다.`,
      });
    }

    if (!imageUrls.every(isHttpsMarkdownImageUrl)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '이미지 주소는 업로드된 안전한 URL만 사용할 수 있습니다.',
      });
    }

    if (!imageUrls.every(hasAllowedMarkdownImageExtension)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content'],
        message: '이미지는 jpg, png, webp, gif 형식만 사용할 수 있습니다.',
      });
    }
  });

export type CommunityWriteFormValues = z.infer<typeof communityWriteSchema>;
