import type { CommunityPost } from '@/types/community/domain';
import { extractImageUrls } from '@/types/mentoring/markdown';

const COMMUNITY_SUMMARY_MAX_LENGTH = 140;

const COMMUNITY_HTML_BREAK_TAGS =
  /<(br|\/p|\/div|\/li|\/blockquote|\/h[1-6])[^>]*>/gi;
const COMMUNITY_HTML_TAGS = /<[^>]+>/g;

const decodeHtmlEntities = (content: string) => {
  return content
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
};

export const extractCommunityPlainText = (content: string) => {
  const normalizedContent = decodeHtmlEntities(content)
    .replace(COMMUNITY_HTML_BREAK_TAGS, '\n')
    .replace(COMMUNITY_HTML_TAGS, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizedContent;
};

export const hasMeaningfulCommunityContent = (content: string) => {
  return (
    extractCommunityPlainText(content).length > 0 ||
    extractImageUrls(content).length > 0
  );
};

export const createCommunityPostSummary = (content: string) => {
  const plainText = extractCommunityPlainText(content);

  if (!plainText) {
    return extractImageUrls(content).length > 0
      ? '이미지가 포함된 글입니다.'
      : '';
  }

  if (plainText.length <= COMMUNITY_SUMMARY_MAX_LENGTH) {
    return plainText;
  }

  return `${plainText.slice(0, COMMUNITY_SUMMARY_MAX_LENGTH).trimEnd()}…`;
};

export const extractCommunityPostPreviewImage = (content: string) => {
  return extractImageUrls(content)[0];
};

const joinCommunityParagraphs = (paragraphs: readonly string[]) =>
  paragraphs.join(' ').replace(/\s+/g, ' ').trim();

export const getCommunityPostPreviewText = (post: CommunityPost) => {
  if (post.contentHtml?.trim()) {
    return createCommunityPostSummary(post.contentHtml);
  }

  const paragraphPreview = joinCommunityParagraphs(post.content);

  if (paragraphPreview) {
    return createCommunityPostSummary(paragraphPreview);
  }

  return post.summary;
};
