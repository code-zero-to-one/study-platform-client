'use client';

import 'highlight.js/styles/github.css';
import DOMPurify, { type Config as DOMPurifyConfig } from 'dompurify';
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
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { replaceEmoticonShortcodes } from '@/components/common/ui/editor/emoticon-shortcode';
import {
  applyYouTubeIframeAttributes,
  replaceStandaloneYouTubeLinksWithEmbeds,
} from '@/components/common/ui/editor/youtube-utils';
import { isHtmlContent } from '@/lib/rich-text/markdown-utils';

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

export interface MarkdownContentCoreProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

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
    'iframe',
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
  ALLOWED_ATTR: [
    'allow',
    'allowfullscreen',
    'alt',
    'class',
    'frameborder',
    'height',
    'href',
    'loading',
    'referrerpolicy',
    'src',
    'title',
    'width',
  ],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP:
    /^(?:https?:\/\/|mailto:|tel:|\/images\/|\/emoticon\/|#)/i,
};

const IMAGE_WIDTH_MIN = 80;
const IMAGE_WIDTH_MAX = 400;

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

  const clamped = Math.min(
    IMAGE_WIDTH_MAX,
    Math.max(IMAGE_WIDTH_MIN, Math.round(parsed)),
  );

  return clamped;
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

    imageElement.setAttribute('loading', 'lazy');
    imageElement.setAttribute('decoding', 'async');

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

  applyYouTubeIframeAttributes(document);

  return document.body.innerHTML;
};

export default function MarkdownContentCore({
  content,
  className,
  emptyMessage = '아직 작성된 내용이 없습니다.',
}: MarkdownContentCoreProps) {
  const hasContent = content.trim().length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    if (!hasContent) {
      return '';
    }

    const isOriginalHtml = isHtmlContent(content);
    const contentWithEmbeds = replaceEmoticonShortcodes(
      replaceStandaloneYouTubeLinksWithEmbeds(content),
    );

    let html: string;

    if (isOriginalHtml) {
      html = contentWithEmbeds;
    } else {
      const rendered = marked.parse(contentWithEmbeds, {
        breaks: true,
        gfm: true,
      });
      html = typeof rendered === 'string' ? rendered : '';
    }

    const sanitized = DOMPurify.sanitize(html, SANITIZE_OPTIONS);

    return applyPostSanitizeAttributes({
      originalHtml: html,
      sanitizedHtml: sanitized,
    });
  }, [content, hasContent]);

  useEffect(() => {
    if (!containerRef.current || !sanitizedHtml) {
      return;
    }

    const codeBlocks = containerRef.current.querySelectorAll('pre code');

    codeBlocks.forEach((block) => {
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
        '[&_p]:font-designer-18r [&_p]:text-text-default [&_p]:mb-150 [&_p]:leading-relaxed',
        '[&_h1]:font-designer-24b [&_h1]:text-text-strong [&_h1]:mt-250 [&_h1]:mb-150',
        '[&_h2]:font-designer-20b [&_h2]:text-text-strong [&_h2]:mt-250 [&_h2]:mb-125',
        '[&_h3]:font-designer-18b [&_h3]:text-text-default [&_h3]:mt-200 [&_h3]:mb-100',
        '[&_ul]:mb-150 [&_ul]:list-disc [&_ul]:space-y-50 [&_ul]:pl-250',
        '[&_ol]:mb-150 [&_ol]:list-decimal [&_ol]:space-y-50 [&_ol]:pl-250',
        '[&_li]:font-designer-18r [&_li]:text-text-default [&_li]:leading-relaxed',
        '[&_blockquote]:rounded-100 [&_blockquote]:bg-background-alternative [&_blockquote]:border-border-subtle [&_blockquote]:mb-150 [&_blockquote]:border-l-4 [&_blockquote]:px-150 [&_blockquote]:py-125',
        '[&_blockquote_p]:font-designer-16r [&_blockquote_p]:text-text-subtle [&_blockquote_p]:leading-relaxed',
        '[&_a]:text-text-brand [&_a]:underline',
        '[&_iframe.youtube-embed]:mb-150 [&_iframe.youtube-embed]:block [&_iframe.youtube-embed]:aspect-video [&_iframe.youtube-embed]:w-full [&_iframe.youtube-embed]:max-w-full [&_iframe.youtube-embed]:rounded-100 [&_iframe.youtube-embed]:border [&_iframe.youtube-embed]:border-border-subtle',
        '[&_img]:rounded-100 [&_img]:border-border-subtle [&_img]:mb-150 [&_img]:block [&_img]:h-auto [&_img]:max-h-rich-text-image [&_img]:max-w-rich-text-image [&_img]:border [&_img]:object-contain',
        '[&_img.emoticon-inline]:!inline-block [&_img.emoticon-inline]:!h-[24px] [&_img.emoticon-inline]:!w-auto [&_img.emoticon-inline]:!max-h-[24px] [&_img.emoticon-inline]:!max-w-none [&_img.emoticon-inline]:!border-0 [&_img.emoticon-inline]:!rounded-none [&_img.emoticon-inline]:!my-0 [&_img.emoticon-inline]:!mb-0 [&_img.emoticon-inline]:!align-middle',
        '[&_img.emoticon-lg]:!inline-block [&_img.emoticon-lg]:!h-[48px] [&_img.emoticon-lg]:!w-auto [&_img.emoticon-lg]:!max-h-[48px] [&_img.emoticon-lg]:!max-w-none [&_img.emoticon-lg]:!border-0 [&_img.emoticon-lg]:!rounded-none [&_img.emoticon-lg]:!my-0 [&_img.emoticon-lg]:!mb-0 [&_img.emoticon-lg]:!align-middle',
        '[&_img.emoticon-xl]:!inline-block [&_img.emoticon-xl]:!h-[96px] [&_img.emoticon-xl]:!w-auto [&_img.emoticon-xl]:!max-h-[96px] [&_img.emoticon-xl]:!max-w-none [&_img.emoticon-xl]:!border-0 [&_img.emoticon-xl]:!rounded-none [&_img.emoticon-xl]:!my-0 [&_img.emoticon-xl]:!mb-0 [&_img.emoticon-xl]:!align-middle',
        '[&_img.emoticon-xxl]:!inline-block [&_img.emoticon-xxl]:!h-[150px] [&_img.emoticon-xxl]:!w-auto [&_img.emoticon-xxl]:!max-h-[150px] [&_img.emoticon-xxl]:!max-w-none [&_img.emoticon-xxl]:!border-0 [&_img.emoticon-xxl]:!rounded-none [&_img.emoticon-xxl]:!my-0 [&_img.emoticon-xxl]:!mb-0 [&_img.emoticon-xxl]:!align-middle',
        '[&_code]:rounded-50 [&_code]:bg-background-alternative [&_code]:font-designer-13r [&_code]:px-75 [&_code]:py-25',
        '[&_pre]:rounded-100 [&_pre]:bg-background-alternative [&_pre]:mb-150 [&_pre]:overflow-x-auto [&_pre]:px-125 [&_pre]:py-100',
        '[&_pre_code]:bg-transparent [&_pre_code]:px-0 [&_pre_code]:py-0',
        '[&_hr]:border-border-subtle [&_hr]:my-200',
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify sanitize + post-processing을 거친 HTML만 렌더링한다.
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
