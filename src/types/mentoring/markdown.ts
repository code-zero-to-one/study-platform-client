import {
  extractImageUrls,
  extractHtmlImageUrls,
  extractMarkdownImageUrls,
  getFileExtension,
  getUrlPathExtension,
  isHttpImageUrl,
} from '@/lib/rich-text/markdown-utils';

export const MENTOR_MARKDOWN_MAX_IMAGE_COUNT = 3;
export const MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

const isRelativeImagesPath = (url: string) => {
  return url.startsWith('/images/');
};

export { extractHtmlImageUrls, extractImageUrls, extractMarkdownImageUrls };
export { getFileExtension };

export const isAllowedMarkdownImageExtension = (extension: string) => {
  return MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension as (typeof MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
  );
};

export const isHttpsMarkdownImageUrl = (url: string) => {
  if (isRelativeImagesPath(url)) {
    return true;
  }

  return isHttpImageUrl(url);
};

export const hasAllowedMarkdownImageExtension = (url: string) => {
  const extension = getUrlPathExtension(url);

  return isAllowedMarkdownImageExtension(extension);
};

export const hasOnlyHttpsImageUrls = (markdown: string) => {
  return extractMarkdownImageUrls(markdown).every(isHttpsMarkdownImageUrl);
};

export const hasOnlyAllowedImageExtensions = (markdown: string) => {
  return extractMarkdownImageUrls(markdown).every(
    hasAllowedMarkdownImageExtension,
  );
};
