import {
  MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS,
  MARKDOWN_IMAGE_DEFAULT_MAX_COUNT,
  MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE,
} from '@/components/common/ui/editor/image-utils';
import {
  extractHtmlImageUrls,
  extractImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
  hasAllowedImageExtension,
  isHttpsImageUrl,
} from '@/utils/markdown-content-images';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';

export const MENTOR_MARKDOWN_MAX_IMAGE_COUNT = MARKDOWN_IMAGE_DEFAULT_MAX_COUNT;
export const MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE =
  MARKDOWN_IMAGE_DEFAULT_MAX_FILE_SIZE;
export const MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS =
  MARKDOWN_IMAGE_DEFAULT_ALLOWED_EXTENSIONS;

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

export const normalizeMentorMarkdownContent = normalizeMarkdownContent;

export {
  extractHtmlImageUrls,
  extractImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
};
