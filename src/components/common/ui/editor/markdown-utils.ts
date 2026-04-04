'use client';

import {
  extractHtmlImageUrls,
  extractImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
  hasAllowedImageExtension,
  hasOnlyAllowedImageExtensions as hasOnlyAllowedImageExtensionsBase,
  hasOnlyHttpsImageUrls as hasOnlyHttpsImageUrlsBase,
  isHttpsImageUrl,
} from '@/utils/markdown-content-images';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
import { isHtmlContent } from '@/utils/markdown-content-shared';

export const MARKDOWN_MAX_IMAGE_COUNT = 3;
export const MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

export {
  extractHtmlImageUrls,
  extractImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
  normalizeMarkdownContent,
};

export const isAllowedMarkdownImageExtension = (extension: string) => {
  return MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension as (typeof MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
  );
};

export const isHttpsMarkdownImageUrl = isHttpsImageUrl;

export const hasAllowedMarkdownImageExtension = (url: string) => {
  return hasAllowedImageExtension(url, MARKDOWN_ALLOWED_IMAGE_EXTENSIONS);
};

export const hasOnlyHttpsImageUrls = hasOnlyHttpsImageUrlsBase;

export const hasOnlyAllowedImageExtensions = (markdown: string) => {
  return hasOnlyAllowedImageExtensionsBase(
    markdown,
    MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  );
};

export const isHtmlMarkdownContent = isHtmlContent;

export const MARKDOWN_DESCRIPTION_CLASS =
  '[&_p]:font-designer-16r [&_p]:text-text-subtle [&_li]:font-designer-16r [&_li]:text-text-subtle [&_blockquote_p]:font-designer-16r [&_blockquote_p]:text-text-subtle';
