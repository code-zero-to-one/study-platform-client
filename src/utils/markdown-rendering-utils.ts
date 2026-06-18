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

// 일부 콘텐츠는 GFM 마크다운 표의 각 행이 <p>...</p>로 감싸여 저장된다
// (예: <p>| 헤더 | ... |</p><p>| --- | --- |</p>...). 이 경우 marked가 표로 인식하지
// 못해 "| ... |" 원문이 그대로 노출된다. 아래 헬퍼는 그 <p> 래퍼를 벗겨 raw 마크다운 표
// 블록으로 되돌려, 이어지는 marked(gfm) 렌더가 정상 <table>을 만들게 한다.
// 구분행(| --- |)이 있는 연속 행 묶음에만 적용하므로, 순수 HTML/일반 본문은 영향받지 않는다.
const P_WRAPPED_TABLE_ROW_RUN_PATTERN =
  /(?:<p>\s*\|[^<\n]*\|\s*<\/p>\s*){2,}/gi;
const P_WRAPPED_TABLE_ROW_CELL_PATTERN = /<p>\s*(\|[^<\n]*\|)\s*<\/p>/gi;
const MARKDOWN_TABLE_SEPARATOR_ROW_PATTERN =
  /\|\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*\|/;

const runContainsTableSeparator = (run: string): boolean =>
  [...run.matchAll(P_WRAPPED_TABLE_ROW_CELL_PATTERN)].some((match) =>
    MARKDOWN_TABLE_SEPARATOR_ROW_PATTERN.test(match[1]),
  );

export const hasPWrappedMarkdownTable = (content: string): boolean => {
  const runs = content.match(P_WRAPPED_TABLE_ROW_RUN_PATTERN);
  return runs ? runs.some(runContainsTableSeparator) : false;
};

export const unwrapPWrappedMarkdownTables = (content: string): string =>
  content.replace(P_WRAPPED_TABLE_ROW_RUN_PATTERN, (run) => {
    if (!runContainsTableSeparator(run)) {
      return run;
    }
    const rows = [...run.matchAll(P_WRAPPED_TABLE_ROW_CELL_PATTERN)].map(
      (match) => match[1].trim(),
    );
    return `\n\n${rows.join('\n')}\n\n`;
  });

// 작성자가 의도한 빈 줄은 빈 문단(<p></p>)으로 저장되는데, 렌더 시 CSS margin collapse로
// 높이 0이 되어 사라진다(에디터에선 빈 줄로 보임). <br>을 넣어 빈 줄이 보이도록 보존한다.
// TipTap/에디터는 빈 문단을 속성(dir/style/class/data-* 등)이나 &nbsp;와 함께 직렬화할 수
// 있으므로, 여는 <p ...> 의 속성과 내부 공백/nbsp를 모두 허용해 매칭한다.
const EMPTY_PARAGRAPH_PATTERN = /<p\b[^>]*>(?:\s|&nbsp;|&#160;|&#xa0;)*<\/p>/gi;
export const restoreEmptyParagraphsAsLineBreaks = (html: string): string =>
  html.replace(EMPTY_PARAGRAPH_PATTERN, '<p><br></p>');
