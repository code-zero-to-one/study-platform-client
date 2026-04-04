import {
  decodeHtmlEntities,
  isHtmlContent,
  toNonEmptyTrimmedString,
} from './markdown-content-shared';

const HTML_BREAK_TAG_PATTERN = /<br\s*\/?>/gi;
const HTML_BLOCK_TAG_PATTERN =
  /<\/(?:address|article|aside|blockquote|dd|div|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HTML_ENTITY_NBSP_PATTERN = /&nbsp;/gi;

const toHtmlVisibleText = (content: string) => {
  const normalized = content
    .replace(HTML_COMMENT_PATTERN, '')
    .replace(HTML_BREAK_TAG_PATTERN, ' ')
    .replace(HTML_BLOCK_TAG_PATTERN, ' ')
    .replace(HTML_ENTITY_NBSP_PATTERN, ' ')
    .replace(HTML_TAG_PATTERN, '');

  return decodeHtmlEntities(normalized).replace(/\s+/g, ' ').trim();
};

export const getRichContentVisibleText = (content: unknown): string => {
  const normalized = toNonEmptyTrimmedString(content);
  if (!normalized) {
    return '';
  }

  if (!isHtmlContent(normalized)) {
    return decodeHtmlEntities(normalized).trim();
  }

  return toHtmlVisibleText(normalized);
};

export const getRichContentVisibleTextLength = (content: unknown): number => {
  return getRichContentVisibleText(content).length;
};
