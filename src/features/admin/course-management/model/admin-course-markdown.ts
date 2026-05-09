import {
  COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS,
  COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT,
  COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE,
} from '@/types/community/markdown';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
import { isHtmlContent } from '@/utils/markdown-content-shared';

export const ADMIN_COURSE_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS =
  COMMUNITY_MARKDOWN_ALLOWED_IMAGE_EXTENSIONS;
export const ADMIN_COURSE_MARKDOWN_MAX_IMAGE_COUNT =
  COMMUNITY_MARKDOWN_MAX_IMAGE_COUNT;
export const ADMIN_COURSE_MARKDOWN_MAX_IMAGE_FILE_SIZE =
  COMMUNITY_MARKDOWN_MAX_IMAGE_FILE_SIZE;

const GLOBAL_DISALLOWED_ATTRIBUTES = new Set(['class', 'style', 'id']);
const ATTRIBUTE_ALLOWLIST_BY_TAG: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  blockquote: new Set(),
  br: new Set(),
  code: new Set(),
  del: new Set(),
  em: new Set(),
  h1: new Set(),
  h2: new Set(),
  h3: new Set(),
  hr: new Set(),
  iframe: new Set([
    'allow',
    'allowfullscreen',
    'frameborder',
    'height',
    'referrerpolicy',
    'src',
    'title',
    'width',
  ]),
  img: new Set(['alt', 'height', 'loading', 'src', 'title', 'width']),
  li: new Set(),
  ol: new Set(),
  p: new Set(),
  pre: new Set(),
  s: new Set(),
  span: new Set(),
  strong: new Set(),
  table: new Set(),
  tbody: new Set(),
  td: new Set(),
  th: new Set(),
  thead: new Set(),
  tr: new Set(),
  u: new Set(),
  ul: new Set(),
};

const stripEditorBreakingAttributes = (html: string) => {
  if (typeof window === 'undefined') {
    return html;
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');

  document.body.querySelectorAll('*').forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const allowedAttributes = ATTRIBUTE_ALLOWLIST_BY_TAG[tagName] ?? new Set();

    Array.from(element.attributes).forEach((attribute) => {
      const attributeName = attribute.name.toLowerCase();

      if (
        GLOBAL_DISALLOWED_ATTRIBUTES.has(attributeName) ||
        attributeName.startsWith('data-') ||
        attributeName.startsWith('on') ||
        !allowedAttributes.has(attributeName)
      ) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return document.body.innerHTML.trim();
};

export const normalizeAdminCourseMarkdownContent = (content: unknown) => {
  const normalizedContent = normalizeMarkdownContent(content);

  if (!normalizedContent || !isHtmlContent(normalizedContent)) {
    return normalizedContent;
  }

  return stripEditorBreakingAttributes(normalizedContent);
};
