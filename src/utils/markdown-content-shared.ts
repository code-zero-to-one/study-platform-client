const HTML_OPEN_TAG_PATTERN = /<[a-z][a-z0-9-]*(?:\s[^<>]*?)?>/i;
const HTML_CLOSE_TAG_PATTERN = /<\/[a-z][a-z0-9-]*\s*>/i;
const HTML_SELF_CLOSING_TAG_PATTERN = /<[a-z][a-z0-9-]*(?:\s[^<>]*?)?\/>/i;
const HTML_MEDIA_TAG_PATTERN = /<(img|video|audio|iframe|embed)\b/i;

export const decodeHtmlEntities = (value: string) => {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/gi, (_, decimal: string) =>
      String.fromCodePoint(Number.parseInt(decimal, 10)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    );
};

export const isHtmlContent = (content: string): boolean => {
  return (
    HTML_OPEN_TAG_PATTERN.test(content) ||
    HTML_CLOSE_TAG_PATTERN.test(content) ||
    HTML_SELF_CLOSING_TAG_PATTERN.test(content)
  );
};

export const hasHtmlMediaTag = (content: string) => {
  return HTML_MEDIA_TAG_PATTERN.test(content);
};

export const toNonEmptyTrimmedString = (content: unknown): string => {
  if (typeof content !== 'string') {
    return '';
  }

  const trimmed = content.trim();

  return trimmed || '';
};
