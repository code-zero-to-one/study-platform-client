const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_IMAGE_TAG_PATTERN = /<img\b[^>]*>/gi;
const HTML_IMAGE_SRC_ATTR_PATTERN = /\bsrc\s*=\s*['"]([^'"]+)['"]/i;

const normalizeMarkdownImageUrl = (url: string) => {
  return url.trim().replace(/^<|>$/g, '');
};

export const getFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase().trim() ?? '';
};

export const getUrlPathExtension = (url: string) => {
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

export const stripUrlQueryAndFragment = (value: string) => {
  return value.trim().split('#', 2)[0]?.split('?', 2)[0] ?? '';
};

export const isHtmlContent = (content: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(content);
};

export const extractMarkdownImageUrls = (markdown: string): string[] => {
  if (!markdown.includes('![') || !markdown.includes('](')) {
    return [];
  }

  return Array.from(markdown.matchAll(MARKDOWN_IMAGE_PATTERN))
    .map((match) => normalizeMarkdownImageUrl(match[1] ?? ''))
    .filter((url) => url.length > 0);
};

export const extractHtmlImageUrls = (html: string): string[] => {
  if (!/<img\b/i.test(html)) {
    return [];
  }

  if (typeof DOMParser !== 'undefined') {
    return Array.from(new DOMParser().parseFromString(html, 'text/html').images)
      .map((image) => image.getAttribute('src')?.trim() ?? '')
      .filter((url) => url.length > 0);
  }

  return Array.from(html.matchAll(HTML_IMAGE_TAG_PATTERN))
    .map((match) => match[0] ?? '')
    .map((tag) => HTML_IMAGE_SRC_ATTR_PATTERN.exec(tag)?.[1]?.trim() ?? '')
    .filter((url) => url.length > 0);
};

export const extractImageUrls = (content: string): string[] => {
  if (isHtmlContent(content)) {
    return extractHtmlImageUrls(content);
  }

  return extractMarkdownImageUrls(content);
};

export const isHttpImageUrl = (url: string) => {
  try {
    const protocol = new URL(url).protocol;

    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
};
