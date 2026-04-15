'use client';

import 'highlight.js/styles/github.css';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { memo, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { normalizeMarkdownContent } from '@/utils/markdown-content-normalize';
import { isHtmlContent } from '@/utils/markdown-content-shared';
import hljs from './hljs-setup';
import {
  applyPostSanitizeAttributes,
  SANITIZE_OPTIONS,
} from './markdown-sanitizer';
import { replaceStandaloneYouTubeLinksWithEmbeds } from './youtube-utils';

const MARKDOWN_CONTENT_BASE_STYLES = [
  'wrap-break-word',
  '[&_p]:font-designer-14r [&_p]:text-text-default [&_p]:mb-100',
  '[&_h1]:font-designer-24b [&_h1]:text-text-strong [&_h1]:mt-250 [&_h1]:mb-100',
  '[&_h2]:font-designer-20b [&_h2]:text-text-strong [&_h2]:mt-250 [&_h2]:mb-125',
  '[&_h3]:font-designer-18b [&_h3]:text-text-default [&_h3]:mt-200 [&_h3]:mb-100',
  '[&_ul]:mb-100 [&_ul]:list-disc [&_ul]:space-y-50 [&_ul]:pl-250',
  '[&_ol]:mb-100 [&_ol]:list-decimal [&_ol]:space-y-50 [&_ol]:pl-250',
  '[&_li]:font-designer-14r [&_li]:text-text-default',
  '[&_blockquote]:rounded-100 [&_blockquote]:bg-background-alternative [&_blockquote]:border-border-subtle [&_blockquote]:mb-100 [&_blockquote]:border-l-4 [&_blockquote]:px-150 [&_blockquote]:py-125',
  '[&_blockquote_p]:font-designer-14r [&_blockquote_p]:text-text-subtle',
  '[&_a]:text-text-brand [&_a]:underline',
  '[&_s]:line-through [&_del]:line-through',
  '[&_iframe.youtube-embed]:mb-100 [&_iframe.youtube-embed]:flex [&_iframe.youtube-embed]:justify-center [&_iframe.youtube-embed]:aspect-video [&_iframe.youtube-embed]:w-full [&_iframe.youtube-embed]:max-w-youtube-embed [&_iframe.youtube-embed]:rounded-100 [&_iframe.youtube-embed]:border [&_iframe.youtube-embed]:border-border-subtle',
  '[&_img]:rounded-100 [&_img]:border-border-subtle [&_img]:mb-100 [&_img]:block [&_img]:h-auto [&_img]:max-h-markdown-img [&_img]:max-w-markdown-img [&_img]:border [&_img]:object-contain',
  '[&_code]:rounded-50 [&_code]:bg-background-alternative [&_code]:font-designer-13r [&_code]:px-75 [&_code]:py-25',
  '[&_pre]:rounded-100 [&_pre]:bg-background-alternative [&_pre]:mb-100 [&_pre]:overflow-x-auto [&_pre]:px-125 [&_pre]:py-100',
  '[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0',
  '[&_hr]:border-border-subtle [&_hr]:my-200',
] as const;

interface MarkdownContentProps {
  content: unknown;
  className?: string;
  emptyMessage?: string;
}

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

    const isOriginalHtml = isHtmlContent(normalizedContent);
    const normalizedContentWithEmbeds =
      replaceStandaloneYouTubeLinksWithEmbeds(normalizedContent);

    let html: string;

    if (isOriginalHtml) {
      html = normalizedContentWithEmbeds;
    } else {
      const rendered = marked.parse(normalizedContentWithEmbeds, {
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
  }, [hasContent, normalizedContent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = sanitizedHtml;
    container.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [sanitizedHtml]);

  if (!hasContent) {
    return <p className="font-designer-14r text-text-subtle">{emptyMessage}</p>;
  }

  return (
    <div
      ref={containerRef}
      className={cn(...MARKDOWN_CONTENT_BASE_STYLES, className)}
    />
  );
}

export default memo(MarkdownContent);
