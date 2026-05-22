'use client';

import { Heart, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useGetMyBuilderFeeds,
  useGetMyBuilderFeedStats,
} from '@/hooks/queries/course/course-api';
import type { MyBuilderFeedItemResponse } from '@/types/api/course.types';

type Tab = 'feed' | 'question';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MyPostsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab');
  const activeTab: Tab = tabParam === 'question' ? 'question' : 'feed';

  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const { data: feedStats } = useGetMyBuilderFeedStats();
  const { data: feedsData, isLoading: feedsLoading } = useGetMyBuilderFeeds();

  const feeds = feedsData?.feeds ?? [];

  const STATS = [
    { label: '작성 수', value: feedStats?.feedCount ?? 0 },
    { label: '좋아요 받은 수', value: feedStats?.totalLikeCount ?? 0 },
    { label: '댓글 받은 수', value: feedStats?.totalCommentCount ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-600">
      <h1 className="font-designer-24b text-text-default">내가 작성한 글</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-200">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="border-border-subtle rounded-200 flex flex-col items-center gap-100 border p-300"
          >
            <span className="font-designer-24b text-primary-500">
              {stat.value.toLocaleString()}
            </span>
            <span className="font-designer-12r text-text-subtle">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="border-border-subtle flex border-b">
        {(
          [
            { id: 'feed', label: '빌더 피드' },
            { id: 'question', label: '질문답변' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'font-designer-14m px-300 pb-200',
              activeTab === id
                ? 'border-b-2 border-text-default text-text-default'
                : 'text-text-subtlest',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 빌더 피드 탭 */}
      {activeTab === 'feed' && (
        <>
          {feedsLoading ? (
            <div className="flex items-center justify-center py-600">
              <p className="font-designer-14r text-text-subtle">
                불러오는 중...
              </p>
            </div>
          ) : feeds.length === 0 ? (
            <div className="flex flex-col items-center gap-200 py-600">
              <p className="font-designer-16b text-text-default">
                작성한 빌더 피드가 없어요
              </p>
              <p className="font-designer-14r text-text-subtle">
                클래스 레슨 학습 후 피드를 작성해 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-400 sm:grid-cols-2 lg:grid-cols-3">
              {feeds.map((feed) => (
                <FeedCard key={feed.feedId} feed={feed} />
              ))}
            </div>
          )}
        </>
      )}

      {/* 질문답변 탭 */}
      {activeTab === 'question' && (
        <div className="flex flex-col items-center gap-200 py-600">
          <p className="font-designer-16b text-text-default">
            작성한 질문이 없어요
          </p>
          <p className="font-designer-14r text-text-subtle">
            {/* TODO: 내 질문 목록 API 연동 예정 */}
            레슨 학습 중 궁금한 점을 질문해 보세요.
          </p>
        </div>
      )}
    </div>
  );
}

function FeedCard({ feed }: { feed: MyBuilderFeedItemResponse }) {
  const [imgError, setImgError] = useState(false);
  const plainText = feed.content.replace(/<[^>]*>/g, '');

  return (
    <Link
      href={`/class/${feed.courseId}/lesson/${feed.lessonId}?feedId=${feed.feedId}`}
      className="border-border-subtle flex flex-col overflow-hidden rounded-200 border"
    >
      <div className="relative aspect-[3/2] w-full bg-gray-100">
        {feed.thumbnailUrl && !imgError ? (
          <Image
            src={feed.thumbnailUrl}
            alt="피드 이미지"
            fill
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="font-designer-12r text-text-subtlest">
              이미지 없음
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-150 p-200">
        <p className="font-designer-14r text-text-default line-clamp-2">
          {plainText}
        </p>
        <div className="flex items-center gap-200">
          <span className="font-designer-12r text-text-subtle flex items-center gap-50">
            <Heart size={12} />
            {feed.likeCount}
          </span>
          <span className="font-designer-12r text-text-subtle flex items-center gap-50">
            <MessageSquare size={12} />
            {feed.commentCount}
          </span>
          <span className="font-designer-12r text-text-subtlest ml-auto">
            {formatDate(feed.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
