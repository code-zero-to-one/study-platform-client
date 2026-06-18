'use client';

import { ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useReducer } from 'react';
import { PlanSelectionModal } from '@/components/class/plan-selection-modal';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useAuth } from '@/features/auth/model/use-auth';
import {
  useGetBuilderFeeds,
  useGetCourseCurriculum,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-queries';
import type { BuilderFeedPaywall } from '@/types/api/course.types';
import { FeedListCard } from '../feed/_components/feed-list-card';
import { PaginationBar } from '../feed/_components/pagination-bar';
import { PaywallSection } from '../feed/_components/paywall-section';

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

const FILTER_API_MAP: Record<FeedFilter, 'ALL' | 'OPERATOR_PICK' | 'MY'> = {
  전체: 'ALL',
  '운영자 PICK': 'OPERATOR_PICK',
  '내 피드': 'MY',
};

const PAGE_SIZE = 10;

interface FeedTabState {
  filter: FeedFilter;
  sort: SortOption;
  lessonId: number | null;
  sortOpen: boolean;
  filterOpen: boolean;
  currentPage: number;
  showPlanModal: boolean;
}

type FeedTabAction =
  | { type: 'changeFilter'; filter: FeedFilter }
  | { type: 'changeLesson'; lessonId: number | null }
  | { type: 'changeSort'; sort: SortOption }
  | { type: 'toggleSortOpen' }
  | { type: 'toggleFilterOpen' }
  | { type: 'setPage'; page: number }
  | { type: 'setPlanModal'; open: boolean };

const INITIAL_FEED_TAB: FeedTabState = {
  filter: '전체',
  sort: '최신순',
  lessonId: null,
  sortOpen: false,
  filterOpen: false,
  currentPage: 0,
  showPlanModal: false,
};

function feedTabReducer(
  state: FeedTabState,
  action: FeedTabAction,
): FeedTabState {
  switch (action.type) {
    case 'changeFilter':
      return { ...state, filter: action.filter, currentPage: 0 };
    case 'changeLesson':
      return {
        ...state,
        lessonId: action.lessonId,
        currentPage: 0,
        filterOpen: false,
      };
    case 'changeSort':
      return {
        ...state,
        sort: action.sort,
        currentPage: 0,
        sortOpen: false,
      };
    case 'toggleSortOpen':
      return { ...state, sortOpen: !state.sortOpen, filterOpen: false };
    case 'toggleFilterOpen':
      return { ...state, filterOpen: !state.filterOpen, sortOpen: false };
    case 'setPage':
      return { ...state, currentPage: action.page };
    case 'setPlanModal':
      return { ...state, showPlanModal: action.open };
    default:
      return state;
  }
}

export function FeedTab() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(feedTabReducer, INITIAL_FEED_TAB);
  const { filter, sort, lessonId, sortOpen, filterOpen, currentPage } = state;

  const { data: course } = useGetCourseDetail(slug);
  const courseId = course?.courseId ?? 0;
  const { data: curriculum } = useGetCourseCurriculum(slug);

  const { data: operatorPickProbe } = useGetBuilderFeeds({
    courseId,
    filter: 'OPERATOR_PICK',
    size: 1,
  });
  const hasOperatorPick = (operatorPickProbe?.totalCount ?? 0) > 0;

  // 운영자 PICK 옵션이 사라지면 선택값을 effect로 되돌리지 않고 렌더 시 '전체'로 파생.
  const effectiveFilter: FeedFilter =
    !hasOperatorPick && filter === '운영자 PICK' ? '전체' : filter;

  const { data: feedData, isLoading } = useGetBuilderFeeds({
    courseId,
    sort: SORT_API_MAP[sort],
    filter: FILTER_API_MAP[effectiveFilter],
    lessonId: lessonId ?? undefined,
    page: currentPage,
    size: PAGE_SIZE,
  });

  const filterOptions: FeedFilter[] = [
    '전체',
    ...(hasOperatorPick ? (['운영자 PICK'] as FeedFilter[]) : []),
    '내 피드',
  ];

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

  const feeds = feedData?.feeds ?? [];
  const totalCount = feedData?.totalCount ?? 0;
  const totalCountLabel =
    feedData?.feedCountLabel ??
    `지금까지 ${totalCount}개의 피드가 완성되었어요!`;
  const weeklyTopBuilder = feedData?.weeklyTopBuilder;
  // TODO: restore paywall when access control is re-enabled
  // const paywall = feedData?.paywall ?? null;
  const paywall: BuilderFeedPaywall | null = null;

  const emptyMessage =
    effectiveFilter === '내 피드'
      ? '아직 작성한 피드가 없어요. 첫 피드를 올려보세요!'
      : effectiveFilter === '운영자 PICK'
        ? '운영자가 선택한 피드가 아직 없어요.'
        : lessonId !== null
          ? '해당 레슨의 피드가 아직 없어요.'
          : '아직 등록된 피드가 없어요.';

  const handleFilterChange = (f: FeedFilter) =>
    dispatch({ type: 'changeFilter', filter: f });

  const handleLessonChange = (id: number | null) =>
    dispatch({ type: 'changeLesson', lessonId: id });

  const handleSortChange = (s: SortOption) =>
    dispatch({ type: 'changeSort', sort: s });

  return (
    <div className="w-full pb-800">
      <div className="mx-auto w-full max-w-1496 px-400 pt-500 md:px-3000 md:pt-750">
        {/* Header */}
        <div className="mb-400">
          <p className="font-designer-24b text-gray-1000">{totalCountLabel}</p>
          {weeklyTopBuilder && (
            <p className="mt-125 font-designer-16r text-gray-800">
              이번 주 최다 좋아요 빌더 : {weeklyTopBuilder.nickname} 님 👋
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="mb-400 flex flex-col gap-200 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter chips */}
          <div className="flex gap-225">
            {filterOptions.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => handleFilterChange(f)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-250 py-100 font-designer-14m transition-colors',
                  effectiveFilter === f
                    ? 'border border-background-brand-default text-background-brand-default'
                    : 'border border-gray-450 text-gray-450 active:bg-gray-100',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-225">
            {/* Sort dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => dispatch({ type: 'toggleSortOpen' })}
                className="flex items-center gap-75 whitespace-nowrap rounded-full border border-gray-800 px-250 py-125 font-designer-16m text-gray-800"
              >
                {sort}
                <ChevronDown className="size-250" />
              </button>
              {sortOpen && (
                <div className="absolute left-0 top-full z-10 mt-75 flex flex-col rounded-150 border border-border-default bg-background-default p-125 shadow-1">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => handleSortChange(o)}
                      className={cn(
                        'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100 active:bg-gray-100',
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
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => dispatch({ type: 'toggleFilterOpen' })}
                className="flex items-center gap-75 whitespace-nowrap rounded-full border border-gray-800 px-250 py-125 font-designer-16m text-gray-800"
              >
                {lessonLabel}
                <ChevronDown className="size-250" />
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-full z-10 mt-75 flex max-h-4000 w-max max-w-[90vw] flex-col overflow-y-auto rounded-150 border border-border-default bg-background-default p-125 shadow-1">
                  <button
                    type="button"
                    onClick={() => handleLessonChange(null)}
                    className={cn(
                      'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100 active:bg-gray-100',
                      lessonId === null && 'font-designer-16b',
                    )}
                  >
                    전체
                  </button>
                  {lessonOptions.map((o) => (
                    <button
                      key={o.lessonId ?? o.label}
                      type="button"
                      onClick={() => handleLessonChange(o.lessonId)}
                      className={cn(
                        'rounded-100 px-200 py-100 text-left font-designer-16r text-gray-800 hover:bg-gray-100 active:bg-gray-100',
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
                href={`/class/${slug}/feed/write`}
                className="ml-auto shrink-0 whitespace-nowrap rounded-100 bg-background-brand-default px-250 py-125 font-designer-16m text-text-inverse"
              >
                피드 올리기
              </Link>
            ) : (
              <LoginModal
                openTrigger={
                  <button
                    type="button"
                    className="ml-auto shrink-0 whitespace-nowrap rounded-100 bg-background-brand-default px-250 py-125 font-designer-16m text-text-inverse"
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
            <p className="font-designer-16r text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-300 sm:grid-cols-2 xl:grid-cols-3">
            {feeds.map((feed) => (
              <FeedListCard key={feed.feedId} feed={feed} slug={slug} />
            ))}
          </div>
        )}

        {paywall ? (
          <PaywallSection
            paywall={paywall}
            onCtaClick={() => dispatch({ type: 'setPlanModal', open: true })}
          />
        ) : (
          <PaginationBar
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => dispatch({ type: 'setPage', page })}
          />
        )}
      </div>
      {state.showPlanModal && course?.plans?.[0] && (
        <PlanSelectionModal
          plan={course.plans[0]}
          earlyBirdEndsAt={course?.earlyBirdEndsAt ?? null}
          onClose={() => dispatch({ type: 'setPlanModal', open: false })}
          slug={slug}
        />
      )}
    </div>
  );
}
