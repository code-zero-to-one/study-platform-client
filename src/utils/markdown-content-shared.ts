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
    .replace(/&#(\d+);/gi, (match, decimal: string) => {
      const cp = Number.parseInt(decimal, 10);
      return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    })
    .replace(/&#x([\da-f]+);/gi, (match, hex: string) => {
      const cp = Number.parseInt(hex, 16);
      return cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : match;
    });
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
