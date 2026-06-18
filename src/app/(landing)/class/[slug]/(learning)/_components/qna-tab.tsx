'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useReducer, useRef } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { QnaAnsweredIcon } from '@/components/common/ui/icons/course-icons';
import {
  useGetCourseDetail,
  useGetCourseQnas,
} from '@/hooks/queries/course/course-queries';
import { QnaFilterPopover, SortLinesIcon } from './qna-filter-popover';

const SORT_OPTIONS = [
  { label: '최신순', value: 'LATEST' },
  { label: '조회순', value: 'VIEW_COUNT' },
  { label: '유용한 순', value: 'USEFUL' },
  { label: '궁금한 순', value: 'CURIOUS' },
  { label: '오래된 순', value: 'OLDEST' },
];

// TODO: backend param 미확인 — swagger(530 down) 복구 후 filter='ANSWER_WAITING' 허용 여부 검증
const FILTER_TABS = [
  { label: '전체', value: '' },
  { label: '답변 대기', value: 'ANSWER_WAITING' },
  { label: '답변 완료', value: 'ANSWERED' },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getEmptyMessage(filter: string) {
  if (filter === 'ANSWER_WAITING') return '답변 대기 중인 질문이 없어요.';
  if (filter === 'ANSWERED') return '답변된 질문이 없어요.';
  return '아직 등록된 질문이 없어요.';
}

interface QnaTabState {
  filter: string;
  sort: string;
  search: string;
  debouncedSearch: string;
  sortOpen: boolean;
  appliedChapterId?: number;
  appliedLessonId?: number;
}

type QnaTabAction =
  | { type: 'setFilter'; filter: string }
  | { type: 'setSort'; sort: string }
  | { type: 'setSearch'; search: string }
  | { type: 'setDebouncedSearch'; value: string }
  | { type: 'toggleSort' }
  | { type: 'closeSort' }
  | { type: 'setAppliedFilter'; chapterId?: number; lessonId?: number };

const INITIAL_QNA_TAB: QnaTabState = {
  filter: '',
  sort: 'LATEST',
  search: '',
  debouncedSearch: '',
  sortOpen: false,
  appliedChapterId: undefined,
  appliedLessonId: undefined,
};

function qnaTabReducer(state: QnaTabState, action: QnaTabAction): QnaTabState {
  switch (action.type) {
    case 'setFilter':
      return { ...state, filter: action.filter };
    case 'setSort':
      return { ...state, sort: action.sort, sortOpen: false };
    case 'setSearch':
      return { ...state, search: action.search };
    case 'setDebouncedSearch':
      return { ...state, debouncedSearch: action.value };
    case 'toggleSort':
      return { ...state, sortOpen: !state.sortOpen };
    case 'closeSort':
      return { ...state, sortOpen: false };
    case 'setAppliedFilter':
      return {
        ...state,
        appliedChapterId: action.chapterId,
        appliedLessonId: action.lessonId,
      };
    default:
      return state;
  }
}

export function QnaTab() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [state, dispatch] = useReducer(qnaTabReducer, INITIAL_QNA_TAB);
  const {
    filter,
    sort,
    search,
    debouncedSearch,
    sortOpen,
    appliedChapterId,
    appliedLessonId,
  } = state;
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(
      () => dispatch({ type: 'setDebouncedSearch', value: search }),
      300,
    );
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        dispatch({ type: 'closeSort' });
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data: courseData } = useGetCourseDetail(slug);
  const courseId = courseData?.courseId ?? 0;
  const { data, isLoading } = useGetCourseQnas({
    courseId,
    search: debouncedSearch || undefined,
    filter: filter || undefined,
    sort,
    chapterId: appliedChapterId,
    lessonId: appliedLessonId,
  });

  const qnas = data?.qnas ?? [];
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '최신순';

  return (
    <div className="w-full px-400 py-500 md:px-3000 md:py-750">
      {/* ── Controls row ── */}
      <div className="mb-500 flex flex-col gap-200">
        {/* Row 1: search + 질문하기 (right-aligned) */}
        <div className="flex items-center justify-end gap-200">
          <div className="group flex items-center gap-100 rounded-full border px-300 py-125 border-gray-400">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="size-300 shrink-0 text-gray-400 transition-colors group-focus-within:text-rose-500"
            >
              <path
                d="M15.9772 14.4716H15.1872L14.9072 14.2016C16.1072 12.8016 16.7272 10.8916 16.3872 8.86157C15.9172 6.08157 13.5972 3.86157 10.7972 3.52157C6.56719 3.00157 3.00719 6.56157 3.52719 10.7916C3.86719 13.5916
  6.08719 15.9116 8.86719 16.3816C10.8972 16.7216 12.8072 16.1016 14.2072 14.9016L14.4772 15.1816V15.9716L18.7272 20.2216C19.1372 20.6316 19.8072 20.6316 20.2172 20.2216C20.6272 19.8116 20.6272 19.1416 20.2172
  18.7316L15.9772 14.4716ZM9.97719 14.4716C7.48719 14.4716 5.47719 12.4616 5.47719 9.97157C5.47719 7.48157 7.48719 5.47157 9.97719 5.47157C12.4672 5.47157 14.4772 7.48157 14.4772 9.97157C14.4772 12.4616 12.4672
  14.4716 9.97719 14.4716Z"
                fill="currentColor"
              />
            </svg>

            <input
              type="text"
              aria-label="질문 검색"
              value={search}
              onChange={(e) =>
                dispatch({
                  type: 'setSearch',
                  search: e.target.value,
                })
              }
              placeholder="질문 검색"
              className="min-w-0 flex-1 bg-transparent font-designer-14r text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => router.push(`/class/${slug}/qa/write`)}
            className="shrink-0 rounded-full bg-rose-500 px-325 py-150 font-designer-14m text-white hover:bg-rose-600 active:bg-rose-600"
          >
            질문하기
          </button>
        </div>

        {/* Row 2: filter tabs (top/left) + sort/filter buttons (bottom/right) */}
        <div className="flex flex-col gap-150 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="flex items-center gap-150 overflow-x-auto pb-50 md:min-w-0 md:flex-1 md:gap-225 [&::-webkit-scrollbar]:hidden">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'setFilter',
                    filter: tab.value,
                  })
                }
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full border px-200 py-100 font-designer-14m transition-colors md:px-325 md:py-125 md:font-designer-20b',
                  filter === tab.value
                    ? 'border-border-brand text-text-brand'
                    : 'border-gray-450 text-gray-450 active:bg-gray-100',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end gap-150 md:shrink-0 md:justify-start">
            <div ref={sortRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => dispatch({ type: 'toggleSort' })}
                className="flex items-center gap-75 whitespace-nowrap rounded-full border border-gray-800 px-175 py-100 font-designer-14m text-gray-800 hover:border-gray-400 active:border-gray-400 md:px-250 md:py-125 md:font-designer-16m"
              >
                <SortLinesIcon className="h-150 w-225" />
                {currentSortLabel}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-10 mt-100 min-w-full overflow-hidden rounded-150 border border-border-subtle bg-background-default shadow-md">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: 'setSort',
                          sort: opt.value,
                        })
                      }
                      className={cn(
                        'w-full px-300 py-200 text-left font-designer-14r hover:bg-gray-100 active:bg-gray-100',
                        sort === opt.value
                          ? 'font-designer-14m text-rose-500'
                          : 'text-gray-700',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <QnaFilterPopover
              slug={slug}
              courseTitle={courseData?.title ?? ''}
              appliedChapterId={appliedChapterId}
              appliedLessonId={appliedLessonId}
              onApply={(lessonId, chapterId) =>
                dispatch({ type: 'setAppliedFilter', chapterId, lessonId })
              }
            />
          </div>
        </div>
      </div>

      {/* ── Q&A list ── */}
      {isLoading || !courseId ? (
        <div className="flex size-2500 items-center justify-center">
          <p className="font-designer-16r text-gray-400">불러오는 중...</p>
        </div>
      ) : qnas.length === 0 ? (
        <div className="flex size-2500 items-center justify-center">
          <p className="font-designer-16r text-gray-400">
            {getEmptyMessage(filter)}
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {qnas.map((q) => (
            <button
              key={q.qnaId}
              type="button"
              onClick={() => router.push(`/class/${slug}/qa/${q.qnaId}`)}
              className="w-full border-b border-border-subtle py-300 text-left transition-colors hover:bg-gray-50 active:bg-gray-50"
            >
              {/* Lesson category */}
              <p className="mb-125 font-designer-14r text-gray-500">
                {q.lessonTitle}
              </p>

              {/* Title */}
              <p className="mb-125 font-designer-18b text-gray-800">
                {stripHtml(q.title)}
              </p>

              {/* Preview */}
              <p className="mb-300 line-clamp-2 font-designer-16r text-gray-800">
                {stripHtml(q.previewText)}
              </p>

              {/* Badges row */}
              <div className="mb-200 flex flex-wrap items-center gap-150">
                <span
                  className={cn(
                    'flex items-center gap-50 rounded-full border px-250 py-125 font-designer-14m',
                    q.answerStatus === 'ANSWERED'
                      ? 'border-qna-answered bg-qna-answered-bg text-qna-answered'
                      : 'border-border-subtle text-gray-500',
                  )}
                >
                  {q.answerStatus === 'ANSWERED' && (
                    <QnaAnsweredIcon className="size-250" />
                  )}
                  {q.answerStatus === 'ANSWERED' ? '답변완료' : '답변 대기'}
                </span>
                <span className="flex items-center gap-75 rounded-full border border-border-subtle px-250 py-125 font-designer-14m text-gray-500">
                  나도 궁금해요 {q.curiousCount}
                </span>
                <span className="flex items-center gap-75 rounded-full border border-border-subtle px-250 py-125 font-designer-14m text-gray-500">
                  유용해요 {q.usefulCount}
                </span>
              </div>

              {/* Author + date */}
              <div className="flex items-center gap-100">
                <div className="flex size-350 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <span className="font-designer-12r text-gray-600">
                    {q.author.nickname.charAt(0)}
                  </span>
                </div>
                <p className="font-designer-14m text-gray-800">
                  {q.author.nickname}
                </p>
                <p className="font-designer-14r text-gray-400">
                  {formatDate(q.createdAt)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
