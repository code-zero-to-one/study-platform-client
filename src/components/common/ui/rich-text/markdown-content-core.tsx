'use client';

import 'highlight.js/styles/github.css';
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
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  isMermaidCodeBlock,
  renderMermaidBlocks,
} from '@/components/common/ui/editor/mermaid-renderer';
import { renderLessonContentToSafeHtml } from '@/lib/rich-text/render-lesson-content';

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
  /**
   * mermaid 코드펜스를 다이어그램으로 렌더할지 여부.
   * 레슨 본문은 켜고(미리보기=학생 보장), 커뮤니티/피드 등은 기존 코드블록
   * 동작을 유지하기 위해 기본 비활성화한다.
   */
  enableMermaid?: boolean;
}

export default function MarkdownContentCore({
  content,
  className,
  emptyMessage = '아직 작성된 내용이 없습니다.',
  enableMermaid = false,
}: MarkdownContentCoreProps) {
  const hasContent = content.trim().length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    if (!hasContent) {
      return '';
    }

    return renderLessonContentToSafeHtml(content);
  }, [content, hasContent]);

  useEffect(() => {
    if (!containerRef.current || !sanitizedHtml) {
      return;
    }

    const codeBlocks = containerRef.current.querySelectorAll('pre code');

    codeBlocks.forEach((block) => {
      if (enableMermaid && isMermaidCodeBlock(block)) {
        return;
      }

      hljs.highlightElement(block as HTMLElement);
    });

    if (enableMermaid) {
      renderMermaidBlocks(containerRef.current).catch(
        (): undefined => undefined,
      );
    }
  }, [sanitizedHtml, enableMermaid]);

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
        '[&_s]:line-through [&_del]:line-through',
        '[&_table]:border-border-subtle [&_table]:mb-150 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-100 [&_table]:border',
        '[&_th]:bg-background-alternative [&_th]:font-designer-13b [&_th]:text-text-default [&_th]:border-border-subtle [&_th]:border [&_th]:px-100 [&_th]:py-75 [&_th]:text-left',
        '[&_td]:font-designer-13r [&_td]:text-text-default [&_td]:border-border-subtle [&_td]:border [&_td]:px-100 [&_td]:py-75',
        '[&_.mermaid-rendered-diagram]:border-border-subtle [&_.mermaid-rendered-diagram]:bg-background-default [&_.mermaid-rendered-diagram]:mb-150 [&_.mermaid-rendered-diagram]:overflow-auto [&_.mermaid-rendered-diagram]:rounded-100 [&_.mermaid-rendered-diagram]:border [&_.mermaid-rendered-diagram]:p-125',
        '[&_.mermaid-render-error]:border-border-error [&_.mermaid-render-error]:bg-background-error-subtle [&_.mermaid-render-error]:text-text-error [&_.mermaid-render-error]:font-designer-13r [&_.mermaid-render-error]:mb-150 [&_.mermaid-render-error]:rounded-100 [&_.mermaid-render-error]:border [&_.mermaid-render-error]:p-125',
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
