import {
  extractHtmlImageUrls,
  extractImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
  hasAllowedImageExtension,
  hasOnlyAllowedImageExtensions as hasOnlyAllowedImageExtensionsBase,
  hasOnlyHttpsImageUrls as hasOnlyHttpsImageUrlsBase,
  isHttpsImageUrl,
  normalizeMarkdownContent,
} from '@/utils/markdown-content';

export const MENTOR_MARKDOWN_MAX_IMAGE_COUNT = 3;
export const MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

export const isAllowedMarkdownImageExtension = (extension: string) => {
  return MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension as (typeof MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
  );
};

export const isHttpsMarkdownImageUrl = isHttpsImageUrl;

export const hasAllowedMarkdownImageExtension = (url: string) => {
  return hasAllowedImageExtension(
    url,
    MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  );
};

export const hasOnlyMentorMarkdownHttpsImageUrls = (markdown: string) => {
  return hasOnlyHttpsImageUrlsBase(markdown);
};

export const hasOnlyMentorAllowedImageExtensions = (markdown: string) => {
  return hasOnlyAllowedImageExtensionsBase(
    markdown,
    MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  );
};

export const normalizeMentorMarkdownContent = normalizeMarkdownContent;

export {
  extractHtmlImageUrls,
  extractImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
};

export const hasOnlyHttpsImageUrls = hasOnlyMentorMarkdownHttpsImageUrls;
export const hasOnlyAllowedImageExtensions =
  hasOnlyMentorAllowedImageExtensions;
