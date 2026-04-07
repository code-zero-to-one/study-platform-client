'use client';

import 'highlight.js/styles/github.css';
import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';
import { marked } from 'marked';
import hljs from '@/components/common/ui/editor/hljs-setup';
import { isHtmlContent } from '@/utils/markdown-content-shared';

const SANITIZE_OPTIONS: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    'a',
    'blockquote',
    'br',
    'code',
    'del',
    'em',
    'h1',
    'h2',
    'h3',
    'hr',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    'span',
    'strong',
    'u',
    'ul',
  ],
  ALLOWED_ATTR: ['alt', 'class', 'href', 'src', 'title', 'width'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:https?:\/\/|mailto:|tel:|\/images\/|#)/i,
};

let _domParser: DOMParser | null = null;
const getDomParser = (): DOMParser | null => {
  if (typeof window === 'undefined') return null;

  _domParser ??= new window.DOMParser();

  return _domParser;
};

const MENTOR_MARKDOWN_IMAGE_MIN_WIDTH = 80;
const MENTOR_MARKDOWN_IMAGE_MAX_WIDTH = 400;

export const MENTOR_MARKDOWN_CONTENT_CLASS =
  'break-words [&_p]:font-designer-14r [&_p]:text-text-default [&_p]:mb-150 [&_p]:leading-relaxed [&_h1]:font-designer-24b [&_h1]:text-text-strong [&_h1]:mt-250 [&_h1]:mb-150 [&_h2]:font-designer-20b [&_h2]:text-text-strong [&_h2]:mt-250 [&_h2]:mb-125 [&_h3]:font-designer-18b [&_h3]:text-text-default [&_h3]:mt-200 [&_h3]:mb-100 [&_ul]:mb-150 [&_ul]:list-disc [&_ul]:space-y-50 [&_ul]:pl-250 [&_ol]:mb-150 [&_ol]:list-decimal [&_ol]:space-y-50 [&_ol]:pl-250 [&_li]:font-designer-14r [&_li]:text-text-default [&_li]:leading-relaxed [&_blockquote]:rounded-100 [&_blockquote]:bg-background-alternative [&_blockquote]:border-border-subtle [&_blockquote]:mb-150 [&_blockquote]:border-l-4 [&_blockquote]:px-150 [&_blockquote]:py-125 [&_blockquote_p]:font-designer-14r [&_blockquote_p]:text-text-subtle [&_blockquote_p]:leading-relaxed [&_a]:text-text-brand [&_a]:underline [&_img]:rounded-100 [&_img]:border-border-subtle [&_img]:mb-150 [&_img]:block [&_img]:h-auto [&_img]:border [&_img]:object-contain [&_code]:rounded-50 [&_code]:bg-background-alternative [&_code]:font-designer-13r [&_pre]:rounded-100 [&_pre]:bg-background-alternative [&_pre]:mb-150 [&_pre]:overflow-x-auto [&_pre]:px-125 [&_pre]:py-100 [&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0 [&_hr]:border-border-subtle [&_hr]:my-200';

const parseSanitizedImageWidth = (
  value: string | undefined,
): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return Math.min(
    MENTOR_MARKDOWN_IMAGE_MAX_WIDTH,
    Math.max(MENTOR_MARKDOWN_IMAGE_MIN_WIDTH, Math.round(parsed)),
  );
};

const applyPostSanitizeAttributes = ({
  originalHtml,
  sanitizedHtml,
}: {
  originalHtml: string;
  sanitizedHtml: string;
}) => {
  const parser = getDomParser();
  if (!parser) {
    return sanitizedHtml;
  }

  const originalDocument = parser.parseFromString(originalHtml, 'text/html');
  const widthBucketsBySrc = new Map<string, number[]>();

  originalDocument.querySelectorAll('img[src]').forEach((imageElement) => {
    const src = imageElement.getAttribute('src')?.trim();
    if (!src) {
      return;
    }

    const width = parseSanitizedImageWidth(
      imageElement.getAttribute('width') ?? undefined,
    );
    if (width === undefined) {
      return;
    }

    const bucket = widthBucketsBySrc.get(src) ?? [];
    bucket.push(width);
    widthBucketsBySrc.set(src, bucket);
  });

  const document = parser.parseFromString(sanitizedHtml, 'text/html');
  const anchors = document.querySelectorAll('a[href]');

  anchors.forEach((anchor) => {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noreferrer');
  });

  document.querySelectorAll('img[src]').forEach((imageElement) => {
    const src = imageElement.getAttribute('src')?.trim();
    if (!src) {
      return;
    }

    const bucket = widthBucketsBySrc.get(src);
    if (!bucket || bucket.length === 0) {
      return;
    }

    const width = bucket.shift();
    if (width === undefined) {
      return;
    }

    imageElement.setAttribute('width', String(width));
  });

  return document.body.innerHTML;
};

export const normalizeMentorMarkdownToSanitizedHtml = (content: unknown) => {
  const normalizedContent = typeof content === 'string' ? content : '';

  if (normalizedContent.trim().length === 0) {
    return '';
  }

  let html: string;

  if (isHtmlContent(normalizedContent)) {
    html = normalizedContent;
  } else {
    const rendered = marked.parse(normalizedContent, {
      breaks: true,
      gfm: true,
    });
    html = typeof rendered === 'string' ? rendered : '';
  }

  const sanitized = String(DOMPurify.sanitize(html, SANITIZE_OPTIONS));

  return applyPostSanitizeAttributes({
    originalHtml: html,
    sanitizedHtml: sanitized,
  });
};

export const highlightMentorMarkdownCodeBlocks = (
  container: HTMLElement | undefined,
) => {
  if (!container) {
    return;
  }

  const codeBlocks = container.querySelectorAll('pre code');

  codeBlocks.forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });
};
