'use client';

import { Heart, MessageCircle, Share2, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useGetBuilderFeeds,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

type SortOption = '최신순' | '좋아요 많은 순' | '댓글 많은 순' | '오래된 순';
type LessonFilter =
  | '전체'
  | 'Lesson 01'
  | 'Lesson 02'
  | 'Lesson 03'
  | 'Lesson 04'
  | 'Lesson 05';
type CourseFilter = '전체' | '입문자 코스';

const SORT_OPTIONS: SortOption[] = [
  '최신순',
  '좋아요 많은 순',
  '댓글 많은 순',
  '오래된 순',
];
const LESSON_OPTIONS: LessonFilter[] = [
  '전체',
  'Lesson 01',
  'Lesson 02',
  'Lesson 03',
  'Lesson 04',
  'Lesson 05',
];

const MOCK_FEEDS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  author: '뭉다',
  date: '1일 전',
  text: '"코딩이 어려기 낙에는 거봐서 터미널 여는 것부터 무서웠는데, 강의 따라 하나하나 10분 만에 성공했어요! 저 진짜 코딩할 수 있을 것 같은 느낌이 들어요...',
  likes: 24,
  comments: 10,
}));

function FeedCard({ feed }: { feed: (typeof MOCK_FEEDS)[0] }) {
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

const SORT_API_MAP: Record<SortOption, string> = {
  최신순: 'LATEST',
  '좋아요 많은 순': 'LIKES',
  '댓글 많은 순': 'COMMENTS',
  '오래된 순': 'OLDEST',
};

export default function BuilderFeedPage() {
  const { isAuthenticated } = useAuth();
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('전체');
  const [sort, setSort] = useState<SortOption>('최신순');
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>('전체');
  const [sortOpen, setSortOpen] = useState(false);
  const [lessonOpen, setLessonOpen] = useState(false);

  const { data: course } = useGetCourseDetail('vibe-intro');
  const courseId = course?.courseId ?? 0;
  const { data: feedData, isLoading } = useGetBuilderFeeds({
    courseId,
    sort: SORT_API_MAP[sort],
  });

  return (
    <div className="w-full pb-800">
      <div className="mx-auto max-w-1496 px-600 pt-500">
        {/* Stats header */}
        <div>
          <p className="font-designer-24b text-gray-1000">
            지금까지 <span className="text-text-brand">1,248</span>
            개의 피드가 완성되었어요!
          </p>
          <p className="mt-125 font-designer-18r text-gray-800">
            이번 주 최다 좋아요 빌더 : 뭉다 님 👋
          </p>
        </div>

        {/* Controls */}
        <div className="mt-400 flex items-center justify-between">
          {/* Course filter chips */}
          <div className="flex gap-125">
            {(['전체', '입문자 코스'] as CourseFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setCourseFilter(f)}
                className={cn(
                  'rounded-full px-250 py-125 font-designer-16r transition-colors',
                  courseFilter === f
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
                {lessonFilter}
                <ChevronDown className="h-250 w-250" />
              </button>
              {lessonOpen && (
                <div className="absolute right-0 top-full z-10 mt-75 flex flex-col rounded-150 border border-border-default bg-background-default p-125 shadow-1">
                  {LESSON_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => {
                        setLessonFilter(o);
                        setLessonOpen(false);
                      }}
                      className={cn(
                        'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100',
                        o === lessonFilter && 'font-designer-16b',
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Write CTA */}
            {isAuthenticated ? (
              <Link
                href="/class/vibe-intro/feed/write"
                className="rounded-100 bg-background-brand-default px-250 py-125 font-designer-16m text-text-inverse"
              >
                피드 올리기
              </Link>
            ) : (
              <LoginModal
                openTrigger={
                  <button
                    type="button"
                    className="rounded-100 bg-background-brand-default px-250 py-125 font-designer-16m text-text-inverse"
                  >
                    피드 올리기
                  </button>
                }
              />
            )}
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
