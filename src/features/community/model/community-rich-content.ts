import type { CommunityPost } from '@/types/community/domain';
import {
  extractCommunityMarkdownPlainText,
  extractImageUrls,
  hasMeaningfulCommunityMarkdownContent,
} from '@/types/community/markdown';

const COMMUNITY_SUMMARY_MAX_LENGTH = 140;

export const extractCommunityPlainText = (content: string) => {
  return extractCommunityMarkdownPlainText(content);
};

export const hasMeaningfulCommunityContent = (content: string) => {
  return hasMeaningfulCommunityMarkdownContent(content);
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
