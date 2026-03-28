'use client';

import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import plaintext from 'highlight.js/lib/languages/plaintext';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { marked } from 'marked';
import { memo, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  isHtmlMarkdownContent,
  normalizeMarkdownContent,
} from './markdown-utils';

hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('python', python);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', c);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('dart', dart);

interface MarkdownContentProps {
  content: unknown;
  className?: string;
  emptyMessage?: string;
}

const SANITIZE_OPTIONS: DOMPurify.Config = {
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
    's',
    'span',
    'strong',
    'u',
    'ul',
  ],
  ALLOWED_ATTR: ['alt', 'class', 'href', 'src', 'title', 'width'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:https?:\/\/|mailto:|tel:|\/images\/|#)/i,
};

const MARKDOWN_IMAGE_MIN_WIDTH = 80;
const MARKDOWN_IMAGE_MAX_WIDTH = 400;

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
    MARKDOWN_IMAGE_MAX_WIDTH,
    Math.max(MARKDOWN_IMAGE_MIN_WIDTH, Math.round(parsed)),
  );
};

const applyPostSanitizeAttributes = ({
  originalHtml,
  sanitizedHtml,
}: {
  originalHtml: string;
  sanitizedHtml: string;
}) => {
  if (typeof window === 'undefined') {
    return sanitizedHtml;
  }

  const originalDocument = new window.DOMParser().parseFromString(
    originalHtml,
    'text/html',
  );
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

  const document = new window.DOMParser().parseFromString(
    sanitizedHtml,
    'text/html',
  );

  document.querySelectorAll('a[href]').forEach((anchor) => {
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

function MarkdownContent({
  content,
  className,
  emptyMessage = '아직 작성된 소개가 없습니다.',
}: MarkdownContentProps) {
  const normalizedContent = normalizeMarkdownContent(content);
  const hasContent = normalizedContent.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    if (!hasContent) {
      return '';
    }

    const html = isHtmlMarkdownContent(normalizedContent)
      ? normalizedContent
      : (() => {
          const rendered = marked.parse(normalizedContent, {
            breaks: true,
            gfm: true,
          });

          return typeof rendered === 'string' ? rendered : '';
        })();

    const sanitized = DOMPurify.sanitize(html, SANITIZE_OPTIONS);

    return applyPostSanitizeAttributes({
      originalHtml: html,
      sanitizedHtml: sanitized,
    });
  }, [hasContent, normalizedContent]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [sanitizedHtml]);

  if (!hasContent) {
    return (
      <p className="font-designer-14r text-text-subtle leading-relaxed">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'break-words',
        '[&_p]:font-designer-14r [&_p]:text-text-default [&_p]:mb-150 [&_p]:leading-relaxed',
        '[&_h1]:font-designer-24b [&_h1]:text-text-strong [&_h1]:mt-250 [&_h1]:mb-150',
        '[&_h2]:font-designer-20b [&_h2]:text-text-strong [&_h2]:mt-250 [&_h2]:mb-125',
        '[&_h3]:font-designer-18b [&_h3]:text-text-default [&_h3]:mt-200 [&_h3]:mb-100',
        '[&_ul]:mb-150 [&_ul]:list-disc [&_ul]:space-y-50 [&_ul]:pl-250',
        '[&_ol]:mb-150 [&_ol]:list-decimal [&_ol]:space-y-50 [&_ol]:pl-250',
        '[&_li]:font-designer-14r [&_li]:text-text-default [&_li]:leading-relaxed',
        '[&_blockquote]:rounded-100 [&_blockquote]:bg-background-alternative [&_blockquote]:border-border-subtle [&_blockquote]:mb-150 [&_blockquote]:border-l-4 [&_blockquote]:px-150 [&_blockquote]:py-125',
        '[&_blockquote_p]:font-designer-14r [&_blockquote_p]:text-text-subtle [&_blockquote_p]:leading-relaxed',
        '[&_a]:text-text-brand [&_a]:underline',
        '[&_s]:line-through [&_del]:line-through',
        '[&_img]:rounded-100 [&_img]:border-border-subtle [&_img]:mb-150 [&_img]:block [&_img]:h-auto [&_img]:max-h-[400px] [&_img]:max-w-[min(100%,400px)] [&_img]:border [&_img]:object-contain',
        '[&_code]:rounded-50 [&_code]:bg-background-alternative [&_code]:font-designer-13r [&_code]:px-75 [&_code]:py-[2px]',
        '[&_pre]:rounded-100 [&_pre]:bg-background-alternative [&_pre]:mb-150 [&_pre]:overflow-x-auto [&_pre]:px-125 [&_pre]:py-100',
        '[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0',
        '[&_hr]:border-border-subtle [&_hr]:my-200',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default memo(MarkdownContent);
