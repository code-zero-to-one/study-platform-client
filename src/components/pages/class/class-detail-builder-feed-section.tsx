import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  Share2,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import type { BuilderFeedShowcaseResponse } from '@/types/api/course.types';

interface ClassDetailBuilderFeedSectionProps {
  builderFeedShowcase: BuilderFeedShowcaseResponse | undefined;
}

export function ClassDetailBuilderFeedSection({
  builderFeedShowcase,
}: ClassDetailBuilderFeedSectionProps) {
  return (
    <section id="builder-feed">
      <h2 className="font-designer-24b text-gray-800">
        ZERO-ONE 빌더들이 만든 결과물이에요
      </h2>
      <div className="relative mt-400">
        {builderFeedShowcase?.items.length ? (
          <>
            <div className="grid grid-cols-2 gap-300">
              {builderFeedShowcase.items.slice(0, 2).map((feed) => (
                <div
                  key={feed.feedId}
                  className="overflow-hidden rounded-100 border border-border-subtle"
                >
                  <div className="flex items-center gap-125 p-250">
                    <div className="flex h-300 w-300 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <Users className="h-200 w-200 text-gray-500" />
                    </div>
                    <p className="font-designer-14m text-gray-800">
                      {feed.author.nickname}
                    </p>
                  </div>
                  <p className="line-clamp-3 px-250 font-designer-13r text-gray-800">
                    {feed.content}
                  </p>
                  {feed.thumbnailUrl ? (
                    <div className="relative mt-150 h-3400 bg-gray-600">
                      <Image
                        src={feed.thumbnailUrl}
                        alt="빌더 피드 이미지"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-150 h-3400 bg-gray-600" />
                  )}
                  <div className="flex items-center gap-125 p-250">
                    <div className="flex items-center gap-50">
                      <Heart className="h-250 w-250 text-gray-1000" />
                      <p className="font-designer-16r text-gray-1000">
                        {feed.likeCount}
                      </p>
                    </div>
                    <div className="flex items-center gap-50">
                      <MessageSquare className="h-250 w-250 text-gray-1000" />
                      <p className="font-designer-16r text-gray-1000">
                        {feed.commentCount}
                      </p>
                    </div>
                    <Share2 className="h-250 w-250 text-gray-1000" />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label="이전"
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
            >
              <ChevronLeft className="h-250 w-250" />
            </button>
            <button
              type="button"
              aria-label="다음"
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
            >
              <ChevronRight className="h-250 w-250" />
            </button>
          </>
        ) : (
          <div className="rounded-100 border border-border-subtle bg-gray-100 p-500 text-center">
            <p className="font-designer-16r text-gray-500">
              아직 공개된 빌더 피드가 없어요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
