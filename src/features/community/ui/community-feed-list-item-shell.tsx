'use client';

import type { MouseEventHandler, ReactNode } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

interface CommunityFeedListItemShellProps {
  content: ReactNode;
  meta: ReactNode;
  media: ReactNode;
  onClick: MouseEventHandler<HTMLElement>;
  stats: ReactNode;
  actions?: ReactNode;
  className?: string;
  mediaBadge?: ReactNode;
  secondaryMeta?: ReactNode;
}

export default function CommunityFeedListItemShell({
  content,
  meta,
  media,
  onClick,
  stats,
  actions,
  className,
  mediaBadge,
  secondaryMeta,
}: CommunityFeedListItemShellProps) {
  return (
    <article
      className={cn(
        'cursor-pointer rounded-250 border border-border-default bg-background-default px-250 py-250',
        className,
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-200">
        <div className="flex w-800 shrink-0 flex-col items-center gap-100">
          {mediaBadge ? (
            <div className="flex flex-wrap items-center justify-center gap-75">
              {mediaBadge}
            </div>
          ) : null}
          {media}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-150 sm:flex-row sm:items-start sm:justify-between sm:gap-250">
            <div className="min-w-0 flex-1">
              {meta}
              {secondaryMeta ? (
                <div className="mt-100 flex flex-wrap items-center gap-100">
                  {secondaryMeta}
                </div>
              ) : null}
              {content}
            </div>

            <div className="flex shrink-0 items-start gap-100">
              {stats}
              {actions}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
