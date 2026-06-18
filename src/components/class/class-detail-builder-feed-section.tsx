import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import Image from 'next/image';
import {
  FeedCommentIcon,
  FeedHeartIcon,
  FeedShareIcon,
} from '@/components/common/ui/icons/course-icons';
import type { BuilderFeedShowcaseResponse } from '@/types/api/course.types';

interface ClassDetailBuilderFeedSectionProps {
  builderFeedShowcase: BuilderFeedShowcaseResponse | undefined;
}

export function ClassDetailBuilderFeedSection({
  builderFeedShowcase,
}: ClassDetailBuilderFeedSectionProps) {
  return (
    <section id="builder-feed">
      <h2 className="font-designer-28b text-gray-800">ZERO-ONE 빌더 피드란?</h2>

      <div className="mt-150 flex flex-col font-designer-20r text-gray-800">
        <p>
          나의 레슨마다의 결과물을 공유합니다! 공유한 결과물을 모아놓은 곳이
          빌더 피드입니다.
        </p>
        <p>
          레슨만 듣는것이 아니라 의견을 댓글로 달아서 피드백을 서로 나누며
          팔로우도 할 수 있는 공간이에요!
        </p>
      </div>

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
                    <div className="flex size-300 shrink-0 items-center justify-center rounded-full bg-gray-200">
                      <Users className="size-200 text-gray-500" />
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
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-150 h-3400 bg-gray-600" />
                  )}
                  <div className="flex items-center gap-125 p-250">
                    <div className="flex items-center gap-50">
                      <FeedHeartIcon className="size-250 text-gray-1000" />
                      <p className="font-designer-16r text-gray-1000">
                        {feed.likeCount}
                      </p>
                    </div>
                    <div className="flex items-center gap-50">
                      <FeedCommentIcon className="size-250 text-gray-1000" />
                      <p className="font-designer-16r text-gray-1000">
                        {feed.commentCount}
                      </p>
                    </div>
                    <FeedShareIcon className="size-250 text-gray-1000" />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              aria-label="이전"
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
            >
              <ChevronLeft className="size-250" />
            </button>
            <button
              type="button"
              aria-label="다음"
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border border-border-default bg-background-default p-150"
            >
              <ChevronRight className="size-250" />
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

      <p className="mt-300 font-designer-16r text-gray-800">
        나와 학습을 같이 한 빌더들을 찾아보고 커뮤니티를 만들어가보세요!
      </p>
    </section>
  );
}
