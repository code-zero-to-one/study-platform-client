'use client';

import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';

interface MentorMarkdownContentProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

export default function MentorMarkdownContent({
  content,
  className,
  emptyMessage = '아직 작성된 소개가 없습니다.',
}: MentorMarkdownContentProps) {
  return (
    <MarkdownContentCore
      content={content}
      className={className}
      emptyMessage={emptyMessage}
    />
  );
}
