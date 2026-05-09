'use client';

import { Heart, MessageCircle, Share2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useGetBuilderFeeds,
  useGetCourseCurriculum,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';

type SortOption = '최신순' | '인기순';
type FeedFilter = '전체' | '운영자 PICK' | '내 피드';

const SORT_OPTIONS: SortOption[] = ['최신순', '인기순'];

const SORT_API_MAP: Record<SortOption, 'LATEST' | 'POPULAR'> = {
  최신순: 'LATEST',
  인기순: 'POPULAR',
};

const FILTER_OPTIONS: FeedFilter[] = ['전체', '운영자 PICK', '내 피드'];

const FILTER_API_MAP: Record<FeedFilter, 'ALL' | 'OPERATOR_PICK' | 'MY'> = {
  전체: 'ALL',
  '운영자 PICK': 'OPERATOR_PICK',
  '내 피드': 'MY',
};

interface FeedCardData {
  id: number;
  author: string;
  date: string;
  text: string;
  likes: number;
  comments: number;
}

function FeedCard({ feed }: { feed: FeedCardData }) {
  return (
    <div className="overflow-hidden rounded-200 border border-border-subtle bg-background-default">
      {/* Profile */}
      <div className="flex items-center justify-between px-250 pt-250">
        <div className="flex items-center gap-125">
          <div className="h-400 w-400 rounded-full bg-gray-200" />
          <div>
            <p className="font-designer-14b text-gray-800">{feed.author}</p>
          </div>
        </div>
        <p className="font-designer-16m text-gray-400">{feed.date}</p>
      </div>

      {/* Image placeholder */}
      <div className="mx-250 mt-150 h-[240px] rounded-150 bg-gray-300" />

      {/* Caption */}
      <p className="mt-150 line-clamp-2 px-250 font-designer-14r text-gray-800">
        {feed.text}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-150 px-250 py-200">
        <div className="flex items-center gap-50">
          <Heart className="h-250 w-250 text-gray-1000" />
          <p className="font-designer-16r text-gray-1000">{feed.likes}</p>
        </div>
        <div className="flex items-center gap-50">
          <MessageCircle className="h-250 w-250 text-gray-1000" />
          <p className="font-designer-16r text-gray-1000">{feed.comments}</p>
        </div>
        <Share2 className="h-250 w-250 text-gray-1000" />
      </div>
    </div>
  );
}

export default function BuilderFeedPage() {
  const [filter, setFilter] = useState<FeedFilter>('전체');
  const [sort, setSort] = useState<SortOption>('최신순');
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);

  const { data: course } = useGetCourseDetail('vibe-intro');
  const courseId = course?.courseId ?? 0;
  const { data: curriculum } = useGetCourseCurriculum('vibe-intro');
  const { data: feedData, isLoading } = useGetBuilderFeeds({
    courseId,
    sort: SORT_API_MAP[sort],
    filter: FILTER_API_MAP[filter],
    lessonId: lessonId ?? undefined,
  });

  const lessonOptions = useMemo(
    () =>
      curriculum?.chapters.flatMap((ch) =>
        ch.lessons.map((l) => ({
          lessonId: l.lessonId,
          label: `Lesson ${String(l.order).padStart(2, '0')}`,
        })),
      ) ?? [],
    [curriculum],
  );

  const lessonLabel =
    lessonOptions.find((l) => l.lessonId === lessonId)?.label ?? '전체';

  const totalCountLabel =
    feedData?.totalCountLabel ??
    `지금까지 ${feedData?.totalCount ?? 0}개의 피드가 완성되었어요!`;
  const weeklyTopBuilder = feedData?.weeklyTopBuilder;

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-1496 px-600 pt-500">
        {/* Stats header */}
        <div>
          <p className="font-designer-24b text-gray-1000">{totalCountLabel}</p>
          {weeklyTopBuilder && (
            <p className="mt-125 font-designer-18r text-gray-800">
              이번 주 최다 좋아요 빌더 : {weeklyTopBuilder.nickname} 님 👋
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mt-400 flex items-center justify-between">
          {/* Filter chips → BE filter param (ALL/OPERATOR_PICK/MY) */}
          <div className="flex gap-125">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full px-250 py-125 font-designer-16r transition-colors',
                  filter === f
                    ? 'bg-background-brand-default text-text-inverse'
                    : 'border border-border-default text-gray-800',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-150">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSortOpen((p) => !p);
                  setLessonOpen(false);
                }}
                className="flex items-center gap-75 rounded-100 border border-border-default px-200 py-125 font-designer-16m text-gray-800"
              >
                {sort}
                <ChevronDown className="h-250 w-250" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-10 mt-75 flex flex-col rounded-150 border border-border-default bg-background-default p-125 shadow-1">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => {
                        setSort(o);
                        setSortOpen(false);
                      }}
                      className={cn(
                        'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100',
                        o === sort && 'font-designer-16b',
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Lesson filter dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setLessonOpen((p) => !p);
                  setSortOpen(false);
                }}
                className="flex items-center gap-75 rounded-100 border border-border-default px-200 py-125 font-designer-16m text-gray-800"
              >
                {lessonLabel}
                <ChevronDown className="h-250 w-250" />
              </button>
              {lessonOpen && (
                <div className="absolute right-0 top-full z-10 mt-75 flex max-h-[320px] min-w-[160px] flex-col overflow-y-auto rounded-150 border border-border-default bg-background-default p-125 shadow-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLessonId(null);
                      setLessonOpen(false);
                    }}
                    className={cn(
                      'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100',
                      lessonId === null && 'font-designer-16b',
                    )}
                  >
                    전체
                  </button>
                  {lessonOptions.map((o) => (
                    <button
                      key={o.lessonId}
                      type="button"
                      onClick={() => {
                        setLessonId(o.lessonId);
                        setLessonOpen(false);
                      }}
                      className={cn(
                        'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100',
                        o.lessonId === lessonId && 'font-designer-16b',
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Write CTA */}
            <Link
              href="/class/vibe-intro/feed/write"
              className="rounded-100 bg-background-brand-default px-250 py-125 font-designer-16m text-text-inverse"
            >
              피드 올리기
            </Link>
          </div>
        </div>

        {/* Feed grid */}
        {isLoading ? (
          <div className="mt-400 flex justify-center py-800">
            <p className="font-designer-16r text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <div className="mt-400 grid grid-cols-3 gap-500">
            {(feedData?.feeds ?? []).map((feed) => (
              <Link
                key={feed.feedId}
                href={`/class/vibe-intro/feed/${feed.feedId}`}
              >
                <FeedCard
                  feed={{
                    id: feed.feedId,
                    author: feed.author.nickname,
                    date: new Date(feed.createdAt).toLocaleDateString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                    }),
                    text: feed.content,
                    likes: feed.likeCount,
                    comments: feed.commentCount,
                  }}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Load more */}
        <div className="mt-500 flex justify-center">
          <button
            type="button"
            className="flex h-[60px] w-[570px] items-center justify-center rounded-100 border border-border-default font-designer-16r text-gray-800"
          >
            피드 더보기
          </button>
        </div>
      </div>
    </div>
  );
}
