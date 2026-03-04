import * as React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface MentoringListTemplateProps {
  toolbar?: React.ReactNode;
  summary?: React.ReactNode;
  content: React.ReactNode;
  secondaryContent?: React.ReactNode;
  className?: string;
}

export default function MentoringListTemplate({
  toolbar,
  summary,
  content,
  secondaryContent,
  className,
}: MentoringListTemplateProps) {
  return (
    <div className={cn('flex flex-col gap-200', className)}>
      {toolbar}
      {summary}
      {content}
      {secondaryContent}
    </div>
  );
}
