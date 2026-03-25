'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  MENTOR_MARKDOWN_CONTENT_CLASS,
  highlightMentorMarkdownCodeBlocks,
  normalizeMentorMarkdownToSanitizedHtml,
} from '@/features/mentoring/ui/registration/markdown/mentor-markdown-rendering';

interface MentorMarkdownContentProps {
  content: unknown;
  className?: string;
  emptyMessage?: string;
}

function MentorMarkdownContent({
  content,
  className,
  emptyMessage = '아직 작성된 소개가 없습니다.',
}: MentorMarkdownContentProps) {
  const normalizedContent = typeof content === 'string' ? content : '';
  const hasContent = normalizedContent.trim().length > 0;
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedHtml = useMemo(() => {
    return normalizeMentorMarkdownToSanitizedHtml(normalizedContent);
  }, [normalizedContent]);

  useEffect(() => {
    highlightMentorMarkdownCodeBlocks(containerRef.current ?? undefined);
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
      className={cn(MENTOR_MARKDOWN_CONTENT_CLASS, className)}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}

export default memo(MentorMarkdownContent);
