'use client';

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
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
          className="h-2325 w-full overflow-hidden rounded-150 bg-gray-600"
          disabled={!onSelectFeed}
        >
          {current?.thumbnailUrl && (
            <Image
              src={current.thumbnailUrl}
              alt=""
              width={314}
              height={186}
              unoptimized
              className="h-full w-full object-cover"
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
        <div className="flex flex-col gap-150">
          <div className="flex items-center gap-125">
            <div className="flex h-300 w-300 shrink-0 items-center justify-center rounded-full bg-gray-200">
              <span className="font-designer-12b text-gray-600">
                {current.author.nickname.charAt(0)}
              </span>
            </div>
            <p className="font-designer-14b text-gray-800">
              {current.author.nickname}
            </p>
          </div>
          <p className="line-clamp-2 font-designer-14r text-gray-1000">
            {current.content}
          </p>
          <div className="flex items-center gap-200">
            <div className="flex items-center gap-50">
              <Heart className="h-250 w-250 text-gray-1000" />
              <p className="font-designer-14r text-gray-1000">
                {current.likeCount}
              </p>
            </div>
            <div className="flex items-center gap-50">
              <MessageCircle className="h-250 w-250 text-gray-1000" />
              <p className="font-designer-14r text-gray-1000">
                {current.commentCount}
              </p>
            </div>
            <Share2 className="h-250 w-250 text-gray-1000" />
          </div>
        </div>
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
