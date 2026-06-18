'use client';

import { Heart, MessageCircle } from 'lucide-react';
import {
  useGetMyBuilderFeedStats,
  useGetMyBuilderFeeds,
} from '@/hooks/queries/course/course-queries';

function formatDate(dateStr: string) {
  return new Date(dateStr)
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .replace(/\.$/, '');
}

export default function MyBuilderFeedsSection() {
  const { data: stats } = useGetMyBuilderFeedStats();
  const { data: myFeeds } = useGetMyBuilderFeeds();

  const feeds = myFeeds?.feeds ?? [];

  return (
    <section className="flex flex-col gap-300 rounded-150 border border-border-subtle bg-background-default p-300">
      <div className="flex items-center justify-between">
        <h2 className="font-designer-20b text-gray-1000">내 빌더 피드</h2>
        {stats && (
          <div className="flex items-center gap-200">
            <span className="font-designer-14r text-gray-500">
              총 {stats.feedCount}개
            </span>
            <div className="flex items-center gap-75">
              <Heart className="h-225 w-225 text-gray-400" />
              <span className="font-designer-14r text-gray-500">
                {stats.totalLikeCount}
              </span>
            </div>
            <div className="flex items-center gap-75">
              <MessageCircle className="h-225 w-225 text-gray-400" />
              <span className="font-designer-14r text-gray-500">
                {stats.totalCommentCount}
              </span>
            </div>
          </div>
        )}
      </div>

      {feeds.length === 0 ? (
        <p className="py-400 text-center font-designer-14r text-gray-400">
          아직 작성한 빌더 피드가 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-200">
          {feeds.map((feed, index) => (
            <div
              key={feed.feedId ?? index}
              className="flex flex-col gap-100 rounded-100 border border-border-subtle px-250 py-200"
            >
              <p className="line-clamp-2 font-designer-14r text-gray-800">
                {feed.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-150">
                  <div className="flex items-center gap-50">
                    <Heart className="h-200 w-200 text-gray-400" />
                    <span className="font-designer-12r text-gray-400">
                      {feed.likeCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-50">
                    <MessageCircle className="h-200 w-200 text-gray-400" />
                    <span className="font-designer-12r text-gray-400">
                      {feed.commentCount}
                    </span>
                  </div>
                </div>
                <span className="font-designer-12r text-gray-400">
                  {formatDate(feed.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
