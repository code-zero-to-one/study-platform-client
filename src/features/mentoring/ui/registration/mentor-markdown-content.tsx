'use client';

/* eslint-disable @next/next/no-img-element */

import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';

interface MentorMarkdownContentProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

const MARKDOWN_SANITIZE_OPTIONS: DOMPurify.Config = {
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
    'strong',
    'ul',
  ],
  ALLOWED_ATTR: ['alt', 'href', 'src', 'title'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^(?:https:\/\/|mailto:|tel:|\/images\/|#)/i,
};

const applyExternalLinkAttributes = (html: string) => {
  if (typeof window === 'undefined') {
    return html;
  }

  const document = new window.DOMParser().parseFromString(html, 'text/html');
  const anchors = document.querySelectorAll('a[href]');

  anchors.forEach((anchor) => {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noreferrer');
  });

  return document.body.innerHTML;
};

export default function MentorMarkdownContent({
  content,
  className,
  emptyMessage = '아직 작성된 소개가 없습니다.',
}: MentorMarkdownContentProps) {
  if (content.trim().length === 0) {
    return (
      <p className="font-designer-14r text-text-subtle leading-relaxed">
        {emptyMessage}
      </p>
    );
  }

  const sanitizedHtml = useMemo(() => {
    const rendered = marked.parse(content, {
      breaks: true,
      gfm: true,
    });
    const renderedHtml = typeof rendered === 'string' ? rendered : '';

    const sanitizedHtml = DOMPurify.sanitize(
      renderedHtml,
      MARKDOWN_SANITIZE_OPTIONS,
    );

    return applyExternalLinkAttributes(sanitizedHtml);
  }, [content]);

  return (
    <div
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
        '[&_img]:rounded-100 [&_img]:border-border-subtle [&_img]:mb-150 [&_img]:h-auto [&_img]:w-full [&_img]:border',
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
