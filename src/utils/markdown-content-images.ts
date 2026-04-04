import { isHtmlContent } from './markdown-content-shared';

const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMAGE_SRC_PATTERN =
  /<img[^>]+src\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;

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

  return pathname.toLowerCase().split('.').pop()?.trim() ?? '';
};

export const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase().trim() ?? '';
};

export const extractMarkdownImageUrls = (markdown: string): string[] => {
  if (!markdown.includes('![') || !markdown.includes('](')) {
    return [];
  }

  return Array.from(markdown.matchAll(MARKDOWN_IMAGE_PATTERN))
    .map((match) => normalizeMarkdownImageUrl(match[1] ?? ''))
    .filter((url) => url.length > 0);
};

export const isHttpsImageUrl = (url: string) => {
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

export const hasAllowedImageExtension = (
  url: string,
  allowedExtensions: readonly string[],
) => {
  return allowedExtensions.includes(getUrlPathExtension(url));
};

export const extractHtmlImageUrls = (html: string): string[] => {
  if (!html.includes('<img')) {
    return [];
  }

  return Array.from(html.matchAll(HTML_IMAGE_SRC_PATTERN))
    .map((match) => (match[1] ?? match[2] ?? match[3] ?? '').trim())
    .filter((url) => url.length > 0);
};

export const extractImageUrls = (content: string): string[] => {
  if (isHtmlContent(content)) {
    return extractHtmlImageUrls(content);
  }

  return extractMarkdownImageUrls(content);
};
