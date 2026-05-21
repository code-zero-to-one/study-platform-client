'use client';

import { ChevronDown, Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { QnaAnsweredIcon } from '@/components/common/ui/icons/course-icons';
import {
  useGetCourseDetail,
  useGetCourseQnas,
} from '@/hooks/queries/course/course-api';

const SORT_OPTIONS = [
  { label: '최신순', value: 'LATEST' },
  { label: '조회순', value: 'VIEW_COUNT' },
  { label: '유용한 순', value: 'USEFUL' },
  { label: '궁금한 순', value: 'CURIOUS' },
  { label: '오래된 순', value: 'OLDEST' },
];

const FILTER_TABS = [
  { label: '전체', value: '' },
  { label: '내 질문', value: 'MY' },
  { label: '답변완료', value: 'ANSWERED' },
];

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getEmptyMessage(filter: string) {
  if (filter === 'MY') return '아직 작성한 질문이 없어요.';
  if (filter === 'ANSWERED') return '답변된 질문이 없어요.';
  return '아직 등록된 질문이 없어요.';
}

export function QnaTab() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('LATEST');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
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
  });

  const qnas = data?.qnas ?? [];
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? '최신순';

  return (
    <div className="mx-auto w-full max-w-page px-600 py-750">
      {/* ── Controls row ── */}
      <div className="mb-500 flex flex-wrap items-center gap-200">
        {/* Filter tabs */}
        <div className="flex items-center gap-225">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={cn(
                'rounded-full border px-325 py-125 font-designer-20b transition-colors',
                filter === tab.value
                  ? 'border-background-brand-default text-background-brand-default'
                  : 'border-gray-450 text-gray-450',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-200">
          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-75 rounded-full border border-border-subtle px-300 py-125 font-designer-14m text-gray-600 hover:border-gray-400"
            >
              {currentSortLabel}
              <ChevronDown className="h-200 w-200" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-10 mt-100 min-w-full overflow-hidden rounded-150 border border-border-subtle bg-background-default shadow-md">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSort(opt.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      'w-full px-300 py-200 text-left font-designer-14r hover:bg-gray-100',
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

          {/* Search bar */}
          <div className="flex items-center gap-100 rounded-full border border-border-subtle px-300 py-125 focus-within:border-gray-400">
            <Search className="h-200 w-200 shrink-0 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="질문 검색"
              className="w-1750 bg-transparent font-designer-14r text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          {/* 질문하기 button */}
          <button
            type="button"
            onClick={() => router.push(`/class/${slug}/qa/write`)}
            className="rounded-full bg-rose-500 px-325 py-150 font-designer-14m text-white hover:bg-rose-600"
          >
            질문하기
          </button>
        </div>
      </div>

      {/* ── Q&A list ── */}
      {isLoading || !courseId ? (
        <div className="flex h-2500 items-center justify-center">
          <p className="font-designer-16r text-gray-400">불러오는 중...</p>
        </div>
      ) : qnas.length === 0 ? (
        <div className="flex h-2500 items-center justify-center">
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
              className="w-full border-b border-border-subtle py-300 text-left"
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
              <div className="mb-200 flex items-center gap-150">
                <span
                  className={cn(
                    'flex items-center gap-50 rounded-full border px-250 py-125 font-designer-14m',
                    q.answerStatus === 'ANSWERED'
                      ? 'border-[#02c76e] bg-[#dafbe7] text-[#02c76e]'
                      : 'border-border-subtle text-gray-500',
                  )}
                >
                  {q.answerStatus === 'ANSWERED' && (
                    <QnaAnsweredIcon className="h-250 w-250" />
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
                <div className="flex h-350 w-350 shrink-0 items-center justify-center rounded-full bg-gray-200">
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
