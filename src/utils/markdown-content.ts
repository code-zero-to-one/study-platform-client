const HTML_BREAK_TAG_PATTERN = /<br\s*\/?>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const HTML_MEDIA_TAG_PATTERN = /<(img|video|audio|iframe|embed)\b/i;
const HTML_ENTITY_NBSP_PATTERN = /&nbsp;/gi;
const HTML_OPEN_TAG_PATTERN = /<[a-z][a-z0-9-]*(?:\s[^<>]*?)?>/i;
const HTML_CLOSE_TAG_PATTERN = /<\/[a-z][a-z0-9-]*\s*>/i;
const HTML_SELF_CLOSING_TAG_PATTERN = /<[a-z][a-z0-9-]*(?:\s[^<>]*?)?\/>/i;
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

export const isHtmlContent = (content: string): boolean => {
  return (
    HTML_OPEN_TAG_PATTERN.test(content) ||
    HTML_CLOSE_TAG_PATTERN.test(content) ||
    HTML_SELF_CLOSING_TAG_PATTERN.test(content)
  );
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

export const hasOnlyHttpsImageUrls = (content: string) => {
  return extractImageUrls(content).every(isHttpsImageUrl);
};

export const hasOnlyAllowedImageExtensions = (
  content: string,
  allowedExtensions: readonly string[],
) => {
  return extractImageUrls(content).every((url) =>
    hasAllowedImageExtension(url, allowedExtensions),
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
