'use client';

import MarkdownContentCore from '@/components/common/ui/rich-text/markdown-content-core';

interface CommunityMarkdownContentProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

export default function CommunityMarkdownContent({
  content,
  className,
  emptyMessage = '아직 작성된 본문이 없습니다.',
}: CommunityMarkdownContentProps) {
  return (
    <MarkdownContentCore
      content={content}
      className={className}
      emptyMessage={emptyMessage}
    />
  );
}
