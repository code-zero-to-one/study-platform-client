export const MENTOR_MARKDOWN_MAX_IMAGE_COUNT = 3;
export const MENTOR_MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
] as const;

const markdownImagePattern = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

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
  return MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension as (typeof MENTOR_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
  );
};

export const extractMarkdownImageUrls = (markdown: string): string[] => {
  if (!markdown.includes('![') || !markdown.includes('](')) {
    return [];
  }

  return Array.from(markdown.matchAll(markdownImagePattern))
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

const htmlImgSrcPattern = /<img[^>]+src="([^"]+)"/g;

export const extractHtmlImageUrls = (html: string): string[] => {
  if (!html.includes('<img')) {
    return [];
  }

  return Array.from(html.matchAll(htmlImgSrcPattern))
    .map((match) => (match[1] ?? '').trim())
    .filter((url) => url.length > 0);
};

const isHtmlContent = (content: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(content);
};

export const extractImageUrls = (content: string): string[] => {
  if (isHtmlContent(content)) {
    return extractHtmlImageUrls(content);
  }

  return extractMarkdownImageUrls(content);
};
