import { marked } from 'marked';
import {
  decodeHtmlEntities,
  isHtmlContent,
  toNonEmptyTrimmedString,
} from '@/utils/markdown-content-shared';

const MARKDOWN_IMAGE_PATTERN = /!\[[^\]]*]\([^)]+\)/;
const MARKDOWN_HEADING_PATTERN = /^#{1,6}\s+\S/m;
const MARKDOWN_BLOCKQUOTE_PATTERN = /^>\s?\S/m;
const MARKDOWN_LIST_PATTERN = /^\s*(?:[-*+]\s+\S|\d+\.\s+\S)/m;
const MARKDOWN_FENCE_PATTERN = /^```/m;
const MARKDOWN_TABLE_PATTERN = /^\s*\|?.+\|.+\r?\n\s*\|?\s*:?-{3,}:?\s*\|/m;

const TEXT_ONLY_HTML_TAGS = new Set(['p', 'br']);
const HTML_TAG_PATTERN = /<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi;
const HTML_LEADING_TAG_PATTERN = /^<[a-z][a-z0-9-]*(?:\s[^<>]*?)?>/i;
const MARKDOWN_CODE_FENCE_BLOCK_PATTERN = /```[\s\S]*?```/g;

export const hasRenderableMarkdownSyntax = (content: unknown) => {
  const value = toNonEmptyTrimmedString(content);
  if (!value) {
    return false;
  }

  return (
    MARKDOWN_IMAGE_PATTERN.test(value) ||
    MARKDOWN_HEADING_PATTERN.test(value) ||
    MARKDOWN_BLOCKQUOTE_PATTERN.test(value) ||
    MARKDOWN_LIST_PATTERN.test(value) ||
    MARKDOWN_FENCE_PATTERN.test(value) ||
    MARKDOWN_TABLE_PATTERN.test(value)
  );
};

export const renderMarkdownToHtml = (content: string) => {
  const rendered = marked.parse(content, {
    breaks: true,
    gfm: true,
  });

  return typeof rendered === 'string' ? rendered.trim() : '';
};

export const shouldRenderMarkdownAsMarkdown = (content: unknown) => {
  const value = toNonEmptyTrimmedString(content);
  if (!value || !hasRenderableMarkdownSyntax(value)) {
    return false;
  }

  if (!isHtmlContent(value)) {
    return true;
  }

  const contentWithoutFencedCode = value.replace(
    MARKDOWN_CODE_FENCE_BLOCK_PATTERN,
    '',
  );
  if (!isHtmlContent(contentWithoutFencedCode)) {
    return true;
  }

  return !HTML_LEADING_TAG_PATTERN.test(value);
};

export const recoverMarkdownTextFromTextOnlyHtml = (
  content: unknown,
): string | undefined => {
  const value = toNonEmptyTrimmedString(content);
  if (!value || !isHtmlContent(value)) {
    return undefined;
  }

  const tagNames = Array.from(value.matchAll(HTML_TAG_PATTERN)).map((match) =>
    (match[1] ?? '').toLowerCase(),
  );
  if (
    tagNames.length === 0 ||
    tagNames.some((tagName) => !TEXT_ONLY_HTML_TAGS.has(tagName))
  ) {
    return undefined;
  }

  const recoveredText = decodeHtmlEntities(
    value
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\s*\/p\s*>\s*<\s*p\b[^>]*>/gi, '\n\n')
      .replace(/<\s*\/?p\b[^>]*>/gi, '')
      .replace(/<[^>]+>/g, ''),
  ).trim();

  return hasRenderableMarkdownSyntax(recoveredText) ? recoveredText : undefined;
};

export const normalizeMarkdownForRichRendering = (content: unknown) => {
  const value = toNonEmptyTrimmedString(content);
  if (!value) {
    return '';
  }

  return recoverMarkdownTextFromTextOnlyHtml(value) ?? value;
};
