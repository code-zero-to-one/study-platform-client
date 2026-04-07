import {
  extractImageUrls,
  getFileExtension,
  getUrlPathExtension,
  stripUrlQueryAndFragment,
} from '@/lib/rich-text/markdown-utils';

export const COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT = 3;
export const COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;
export const COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
] as const;
export const COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS_LABEL =
  COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.join(', ');
export const COMMUNITY_CONTENT_IMAGE_PATH_PREFIX =
  'images/community-post-content/';
const COMMUNITY_CONTENT_IMAGE_PUBLIC_PATH_PREFIX = `/${COMMUNITY_CONTENT_IMAGE_PATH_PREFIX}`;
const COMMUNITY_MARKDOWN_HTML_BREAK_TAGS =
  /<(br|\/p|\/div|\/li|\/blockquote|\/h[1-6])[^>]*>/gi;
const COMMUNITY_MARKDOWN_HTML_TAGS = /<[^>]+>/g;
const COMMUNITY_MARKDOWN_UNSAFE_HTML_PATTERN =
  /<\s*(script|iframe|object|embed|meta|link|style)|on[a-z]+\s*=|javascript:/i;

export { extractImageUrls, getFileExtension };

let communityMarkdownAllowedAbsoluteImageOrigin: string | undefined;

const decodeCommunityMarkdownHtmlEntities = (content: string) => {
  return content
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
};

export const isAllowedCommunityMarkdownImageExtension = (extension: string) => {
  return COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS.includes(
    extension as (typeof COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS)[number],
  );
};

export const extractCommunityMarkdownPlainText = (content: string) => {
  return decodeCommunityMarkdownHtmlEntities(content)
    .replace(COMMUNITY_MARKDOWN_HTML_BREAK_TAGS, '\n')
    .replace(COMMUNITY_MARKDOWN_HTML_TAGS, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const hasMeaningfulCommunityMarkdownContent = (content: string) => {
  return (
    extractCommunityMarkdownPlainText(content).length > 0 ||
    extractImageUrls(content).length > 0
  );
};

export const hasUnsafeCommunityMarkdownHtml = (content: string) => {
  return COMMUNITY_MARKDOWN_UNSAFE_HTML_PATTERN.test(content);
};

const getCommunityMarkdownAbsoluteImageOrigin = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return undefined;
    }

    const normalizedPath = stripUrlQueryAndFragment(parsedUrl.pathname);
    if (
      !normalizedPath.startsWith(COMMUNITY_CONTENT_IMAGE_PUBLIC_PATH_PREFIX)
    ) {
      return undefined;
    }

    return parsedUrl.origin;
  } catch {
    return undefined;
  }
};

export const registerCommunityMarkdownTrustedImageUrl = (url: string) => {
  const nextOrigin = getCommunityMarkdownAbsoluteImageOrigin(url);

  if (!nextOrigin) {
    return;
  }

  communityMarkdownAllowedAbsoluteImageOrigin = nextOrigin;
};

export const registerCommunityMarkdownTrustedImageUrlsFromContent = (
  content: string,
) => {
  for (const imageUrl of extractImageUrls(content)) {
    const nextOrigin = getCommunityMarkdownAbsoluteImageOrigin(imageUrl);

    if (!nextOrigin) {
      continue;
    }

    communityMarkdownAllowedAbsoluteImageOrigin = nextOrigin;

    return;
  }
};

export const isCommunityMarkdownImageUrl = (url: string) => {
  const trimmedUrl = url.trim();
  const normalizedUrl = stripUrlQueryAndFragment(trimmedUrl);

  if (
    normalizedUrl.startsWith(COMMUNITY_CONTENT_IMAGE_PATH_PREFIX) ||
    normalizedUrl.startsWith(COMMUNITY_CONTENT_IMAGE_PUBLIC_PATH_PREFIX)
  ) {
    return true;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return false;
    }

    const normalizedPath = stripUrlQueryAndFragment(parsedUrl.pathname);

    return (
      normalizedPath.startsWith(COMMUNITY_CONTENT_IMAGE_PUBLIC_PATH_PREFIX) &&
      parsedUrl.origin === communityMarkdownAllowedAbsoluteImageOrigin
    );
  } catch {
    return false;
  }
};

export const hasAllowedCommunityMarkdownImageExtension = (url: string) => {
  const extension = getUrlPathExtension(url);

  return isAllowedCommunityMarkdownImageExtension(extension);
};
