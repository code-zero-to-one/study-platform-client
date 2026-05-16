'use client';

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquareMore,
  Forward,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import {
  AuthorAvatar,
  ROLE_LABELS,
  RoleBadge,
} from '@/app/(landing)/class/vibe-intro/_components/builder-feed-utils';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { BuilderFeedPreviewItemResponse } from '@/types/api/course.types';

interface Props {
  feeds: BuilderFeedPreviewItemResponse[];
  onSelectFeed?: (feedId: number) => void;
}

export function LessonBuilderFeedCard({ feeds, onSelectFeed }: Props) {
  const [page, setPage] = useState(0);
  const total = feeds.length;
  const hasFeed = total > 0;
  const current = hasFeed ? feeds[Math.min(page, total - 1)] : null;

  return (
    <div className="flex flex-col gap-200 rounded-150 border border-gray-300 bg-background-default p-300">
      <p className="font-designer-16b text-gray-1000">지금 HOT한 빌더 피드</p>

      <div className="relative">
        <button
          type="button"
          onClick={() => current && onSelectFeed?.(current.feedId)}
          className="relative h-2325 w-full overflow-hidden rounded-150 bg-gray-600"
          disabled={!onSelectFeed}
        >
          {current?.thumbnailUrl && (
            <Image
              src={current.thumbnailUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          )}
        </button>

        {hasFeed && total > 1 && (
          <>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="이전 피드"
              className="absolute left-0 top-1/2 flex h-450 w-450 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-default bg-background-default disabled:opacity-50"
            >
              <ChevronLeft className="h-250 w-250 text-gray-800" />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
              disabled={page >= total - 1}
              aria-label="다음 피드"
              className="absolute right-0 top-1/2 flex h-450 w-450 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border-default bg-background-default disabled:opacity-50"
            >
              <ChevronRight className="h-250 w-250 text-gray-800" />
            </button>
          </>
        )}
      </div>

      {current && (
        <button
          type="button"
          onClick={() => onSelectFeed?.(current.feedId)}
          disabled={!onSelectFeed}
          className="flex flex-col gap-150 text-left disabled:cursor-default"
        >
          <div className="flex items-center gap-125">
            <AuthorAvatar nickname={current.author.nickname} />
            <div className="flex flex-col">
              <div className="flex items-center gap-50">
                <p className="font-designer-14b text-gray-800">
                  {current.author.nickname}
                </p>
                <RoleBadge role={current.author.role} />
              </div>
              {ROLE_LABELS[current.author.role] && (
                <p className="font-designer-12m text-gray-400">
                  {ROLE_LABELS[current.author.role]}
                </p>
              )}
            </div>
          </div>
          <p className="line-clamp-2 font-designer-14r text-gray-1000">
            {current.content}
          </p>
          <div className="flex items-center gap-200">
            <div className="flex items-center gap-50">
              <Heart className="h-250 w-250 text-icon-brand" />
              <p className="font-designer-14r text-gray-1000">
                {current.likeCount}
              </p>
            </div>
            <div className="flex items-center gap-50">
              <MessageSquareMore className="h-250 w-250 text-gray-1000" />
              <p className="font-designer-14r text-gray-1000">
                {current.commentCount}
              </p>
            </div>
            <Forward className="h-250 w-250 text-gray-1000" />
          </div>
        </button>
      )}

      {hasFeed && total > 1 && (
        <div className="flex items-center justify-center gap-50">
          {feeds.map((f, i) => (
            <span
              key={f.feedId}
              className={cn(
                'h-75 w-75 rounded-full',
                i === page ? 'bg-background-brand-default' : 'bg-gray-300',
              )}
            />
          ))}
        </div>
      )}

      {!hasFeed && (
        <p className="text-center font-designer-13m text-gray-400">
          아직 등록된 피드가 없어요.
        </p>
      )}
    </div>
  );
}
