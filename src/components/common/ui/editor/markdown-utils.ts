'use client';

export const MARKDOWN_MAX_IMAGE_COUNT = 3;
export const MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

const HTML_BREAK_TAG_PATTERN = /<br\s*\/?>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const HTML_MEDIA_TAG_PATTERN = /<(img|video|audio|iframe|embed)\b/i;
const HTML_ENTITY_NBSP_PATTERN = /&nbsp;/gi;
const HTML_OPEN_TAG_PATTERN = /<[a-z][a-z0-9-]*(?:\s[^<>]*?)?>/i;
const HTML_CLOSE_TAG_PATTERN = /<\/[a-z][a-z0-9-]*\s*>/i;
const HTML_SELF_CLOSING_TAG_PATTERN = /<[a-z][a-z0-9-]*(?:\s[^<>]*?)?\/>/i;
const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMG_SRC_PATTERN = /<img[^>]+src="([^"]+)"/g;

const normalizeMarkdownImageUrl = (url: string) => {
  return url.trim().replace(/^<|>$/g, '');
};

const isRelativeImagesPath = (url: string) => {
  return url.startsWith('/images/');
};

const getUrlPathExtension = (url: string) => {
  const pathname = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url.split('#')[0]?.split('?')[0] ?? '';
    }
  })();
  const extension = pathname.toLowerCase().split('.').pop();

  return extension?.trim() ?? '';
};

export const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase().trim() ?? '';
};

export const isAllowedMarkdownImageExtension = (extension: string) => {
  return MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension as (typeof MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
  );
};

export const extractMarkdownImageUrls = (markdown: string): string[] => {
  if (!markdown.includes('![') || !markdown.includes('](')) {
    return [];
  }

  return Array.from(markdown.matchAll(MARKDOWN_IMAGE_PATTERN))
    .map((match) => normalizeMarkdownImageUrl(match[1] ?? ''))
    .filter((url) => url.length > 0);
};

export const isHttpsMarkdownImageUrl = (url: string) => {
  if (isRelativeImagesPath(url)) {
    return true;
  }

  try {
    const protocol = new URL(url).protocol;

    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
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

export const extractHtmlImageUrls = (html: string): string[] => {
  if (!html.includes('<img')) {
    return [];
  }

  return Array.from(html.matchAll(HTML_IMG_SRC_PATTERN))
    .map((match) => (match[1] ?? '').trim())
    .filter((url) => url.length > 0);
};

const isHtmlContent = (content: string): boolean => {
  return (
    HTML_OPEN_TAG_PATTERN.test(content) ||
    HTML_CLOSE_TAG_PATTERN.test(content) ||
    HTML_SELF_CLOSING_TAG_PATTERN.test(content)
  );
};

const toHtmlTextContent = (content: string) => {
  return content
    .replace(HTML_BREAK_TAG_PATTERN, ' ')
    .replace(HTML_ENTITY_NBSP_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, ' ')
    .trim();
};

export const normalizeMarkdownContent = (content: unknown): string => {
  if (typeof content !== 'string') {
    return '';
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return '';
  }

  if (!isHtmlContent(trimmed)) {
    return trimmed;
  }

  if (HTML_MEDIA_TAG_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return toHtmlTextContent(trimmed).length > 0 ? trimmed : '';
};

export const extractImageUrls = (content: string): string[] => {
  if (isHtmlContent(content)) {
    return extractHtmlImageUrls(content);
  }

  return extractMarkdownImageUrls(content);
};

export const isHtmlMarkdownContent = (content: string) => {
  return isHtmlContent(content);
};
