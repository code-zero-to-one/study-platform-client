'use client';

import { ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useGetBuilderFeeds,
  useGetCourseCurriculum,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';
import { FeedListCard } from './_components/feed-list-card';
import { PaginationBar } from './_components/pagination-bar';
import { PaywallSection } from './_components/paywall-section';
import { PlanSelectionModal } from './_components/plan-selection-modal';

const LoginModal = dynamic(
  () => import('@/components/auth/modals/login-modal'),
);

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

const PAGE_SIZE = 10;

export default function BuilderFeedPage() {
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<FeedFilter>('전체');
  const [sort, setSort] = useState<SortOption>('최신순');
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const { data: course } = useGetCourseDetail('vibe-intro');
  const courseId = course?.courseId ?? 0;
  const { data: curriculum } = useGetCourseCurriculum('vibe-intro');
  const { data: feedData, isLoading } = useGetBuilderFeeds({
    courseId,
    sort: SORT_API_MAP[sort],
    filter: FILTER_API_MAP[filter],
    lessonId: lessonId ?? undefined,
    page: currentPage,
    size: PAGE_SIZE,
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

  const getLessonLabel = (id: number) =>
    lessonOptions.find((l) => l.lessonId === id)?.label ?? '레슨';

  const lessonLabel =
    lessonOptions.find((l) => l.lessonId === lessonId)?.label ?? '전체';

  const feeds = feedData?.feeds ?? [];
  const totalCount = feedData?.totalCount ?? 0;
  const totalCountLabel =
    feedData?.feedCountLabel ??
    `지금까지 ${totalCount}개의 피드가 완성되었어요!`;
  const weeklyTopBuilder = feedData?.weeklyTopBuilder;
  const paywall = feedData?.paywall ?? null;

  const emptyMessage =
    filter === '내 피드'
      ? '아직 작성한 피드가 없어요. 첫 피드를 올려보세요!'
      : filter === '운영자 PICK'
        ? '운영자가 선택한 피드가 아직 없어요.'
        : lessonId !== null
          ? '해당 레슨의 피드가 아직 없어요.'
          : '아직 등록된 피드가 없어요.';

  const handleFilterChange = (f: FeedFilter) => {
    setFilter(f);
    setCurrentPage(0);
  };

  const handleLessonChange = (id: number | null) => {
    setLessonId(id);
    setCurrentPage(0);
    setFilterOpen(false);
  };

  const handleSortChange = (s: SortOption) => {
    setSort(s);
    setCurrentPage(0);
    setSortOpen(false);
  };

  return (
    <div className="w-full pb-800">
      <div className="mx-auto w-full max-w-1496 px-600 pt-500">
        <div className="flex gap-500">
          {/* Sidebar */}
          <aside className="w-4275 shrink-0 pt-500">
            <p className="font-designer-24b text-gray-1000">
              {totalCountLabel}
            </p>
            {weeklyTopBuilder && (
              <p className="mt-125 font-designer-16r text-gray-800">
                이번 주 최다 좋아요 빌더 : {weeklyTopBuilder.nickname} 님 👋
              </p>
            )}
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">
            {/* Controls */}
            <div className="mb-400 flex items-center justify-between">
              {/* Filter chips */}
              <div className="flex gap-125">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => handleFilterChange(f)}
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
                      setFilterOpen(false);
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
                          onClick={() => handleSortChange(o)}
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
                      setFilterOpen((p) => !p);
                      setSortOpen(false);
                    }}
                    className="flex items-center gap-75 rounded-100 border border-border-default px-200 py-125 font-designer-16m text-gray-800"
                  >
                    {lessonLabel}
                    <ChevronDown className="h-250 w-250" />
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full z-10 mt-75 flex max-h-4000 min-w-2000 flex-col overflow-y-auto rounded-150 border border-border-default bg-background-default p-125 shadow-1">
                      <button
                        type="button"
                        onClick={() => handleLessonChange(null)}
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
                          onClick={() => handleLessonChange(o.lessonId)}
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

            {/* Feed list */}
            {isLoading ? (
              <div className="flex justify-center py-800">
                <p className="font-designer-16r text-gray-500">로딩 중...</p>
              </div>
            ) : feeds.length === 0 ? (
              <div className="flex justify-center py-800">
                <p className="font-designer-16r text-gray-500">
                  {emptyMessage}
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {feeds.map((feed) => (
                  <FeedListCard
                    key={feed.feedId}
                    feed={feed}
                    lessonLabel={getLessonLabel(feed.lessonId)}
                  />
                ))}
              </div>
            )}

            {paywall ? (
              <PaywallSection
                paywall={paywall}
                onCtaClick={() => setShowPlanModal(true)}
              />
            ) : (
              <PaginationBar
                currentPage={currentPage}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            )}
          </main>
        </div>
      </div>
      {showPlanModal && course?.plans?.[0] && (
        <PlanSelectionModal
          plan={course.plans[0]}
          courseId={courseId}
          earlyBirdEndsAt={course?.earlyBirdEndsAt ?? null}
          onClose={() => setShowPlanModal(false)}
        />
      )}
    </div>
  );
}
