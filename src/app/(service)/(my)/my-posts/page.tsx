'use client';

import {
  ChevronDown,
  Heart,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  useDeleteBuilderFeed,
  useGetMyBuilderFeedManagement,
  useGetMyBuilderFeedStats,
  useGetMyDraftBuilderFeeds,
} from '@/hooks/queries/course/course-api';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  MyBuilderFeedManagementItemResponse,
  MyDraftBuilderFeedItemResponse,
} from '@/types/api/course.types';

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

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  const setTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const { data: feedStats } = useGetMyBuilderFeedStats();
  const { data: draftData, isLoading: draftLoading } =
    useGetMyDraftBuilderFeeds();

  // Base query: provides course dropdown options (always no filter)
  const { data: baseData, isLoading: baseLoading } =
    useGetMyBuilderFeedManagement({ status: 'PUBLISHED' });

  // Filtered query: same key as base when no filter selected → deduped by TanStack Query
  const { data: filteredData, isLoading: filteredLoading } =
    useGetMyBuilderFeedManagement({
      courseId: selectedCourseId,
      lessonId: selectedLessonId,
      status: 'PUBLISHED',
    });

  const isFiltering = selectedCourseId !== null || selectedLessonId !== null;
  const displayData = isFiltering ? filteredData : baseData;
  const feedsLoading = isFiltering ? filteredLoading : baseLoading;

  const feeds = displayData?.myBuilderFeeds ?? [];
  const draftFeeds = draftData?.feeds ?? [];

  const availableCourses = baseData?.filterOptions.availableCourses ?? [];
  const availableLessons =
    selectedCourseId !== null
      ? (filteredData?.filterOptions.availableLessons ?? [])
      : [];

  const handleCourseSelect = (courseId: number | null) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(null);
  };

  const STATS = [
    { label: '올린 피드 수', value: feedStats?.feedCount ?? 0 },
    { label: '받은 좋아요 수', value: feedStats?.totalLikeCount ?? 0 },
    { label: '받은 댓글 수', value: feedStats?.totalCommentCount ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-500">
      <h1 className="font-designer-24b text-text-default">내가 작성한 글</h1>

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
              'font-designer-20b px-200 pb-200',
              activeTab === id
                ? 'border-b-2 border-rose-500 text-rose-500'
                : 'font-designer-20r text-gray-800',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 빌더 피드 탭 */}
      {activeTab === 'feed' && (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-200">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-200 flex flex-col gap-150 border border-rose-300 bg-white p-300"
              >
                <p className="font-designer-18b text-text-default">
                  {stat.value.toLocaleString()}
                </p>
                <p className="font-designer-14m text-text-default">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* 필터 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-150">
              <FilterDropdown
                label={
                  selectedCourseId !== null
                    ? (availableCourses.find(
                        (c) => c.courseId === selectedCourseId,
                      )?.courseTitle ?? '코스')
                    : '코스'
                }
                active={selectedCourseId !== null}
                options={availableCourses.map((c) => ({
                  value: c.courseId,
                  label: c.courseTitle,
                }))}
                selected={selectedCourseId}
                onSelect={handleCourseSelect}
                allLabel="전체 코스"
              />
              <FilterDropdown
                label={
                  selectedLessonId !== null
                    ? (availableLessons.find(
                        (l) => l.lessonId === selectedLessonId,
                      )?.lessonTitle ?? '레슨')
                    : '레슨'
                }
                active={selectedLessonId !== null}
                options={availableLessons.map((l) => ({
                  value: l.lessonId,
                  label: l.lessonTitle,
                }))}
                selected={selectedLessonId}
                onSelect={(v) => setSelectedLessonId(v)}
                allLabel="전체 레슨"
                disabled={selectedCourseId === null}
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-100 rounded-full border border-text-default px-300 py-150 font-designer-14m text-text-default"
            >
              최신순
              <ChevronDown size={16} />
            </button>
          </div>

          {/* 총 N건 */}
          {!feedsLoading && (
            <p className="font-designer-18b text-text-default">
              총 {feeds.length}건
            </p>
          )}

          {/* 피드 목록 */}
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

          {/* 임시 저장 */}
          <p className="font-designer-18b text-text-default">임시 저장</p>
          {draftLoading ? (
            <div className="flex items-center justify-center py-600">
              <p className="font-designer-14r text-text-subtle">
                불러오는 중...
              </p>
            </div>
          ) : draftFeeds.length === 0 ? (
            <div className="flex flex-col items-center gap-200 py-600">
              <p className="font-designer-16b text-text-default">
                임시저장된 피드가 없어요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-400 sm:grid-cols-2 lg:grid-cols-3">
              {draftFeeds.map((feed) => (
                <DraftFeedCard key={feed.feedId} feed={feed} />
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

function FilterDropdown({
  label,
  active,
  options,
  selected,
  onSelect,
  allLabel,
  disabled = false,
}: {
  label: string;
  active: boolean;
  options: { value: number; label: string }[];
  selected: number | null;
  onSelect: (value: number | null) => void;
  allLabel: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-100 rounded-full border px-300 py-150 font-designer-14m',
          active
            ? 'border-rose-500 bg-rose-50 text-rose-500'
            : 'border-text-default text-text-default',
          disabled && 'cursor-not-allowed opacity-40',
        )}
      >
        {label}
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="border-border-subtle absolute left-0 top-full z-20 mt-50 min-w-max rounded-150 border bg-white py-100 shadow-md">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setOpen(false);
            }}
            className={cn(
              'w-full px-200 py-100 text-left font-designer-14r hover:bg-gray-50',
              selected === null ? 'text-rose-500' : 'text-text-default',
            )}
          >
            {allLabel}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
              className={cn(
                'w-full px-200 py-100 text-left font-designer-14r hover:bg-gray-50',
                selected === opt.value ? 'text-rose-500' : 'text-text-default',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedCard({ feed }: { feed: MyBuilderFeedManagementItemResponse }) {
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showToast = useToastStore((state) => state.showToast);
  const { mutate: deleteFeed, isPending: isDeleting } = useDeleteBuilderFeed();
  const feedHref =
    feed.lessonId !== null
      ? `/class/${feed.courseId}/lesson/${feed.lessonId}?feedId=${feed.feedId}`
      : `/class/${feed.courseId}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = () => {
    setMenuOpen(false);
    deleteFeed(feed.feedId, {
      onSuccess: () => showToast('피드가 삭제되었습니다.', 'success'),
      onError: () => showToast('피드 삭제에 실패했습니다.', 'error'),
    });
  };

  return (
    <div className="border-border-subtle relative flex flex-col overflow-hidden rounded-200 border">
      {/* 수정/삭제 메뉴 */}
      <div ref={menuRef} className="absolute right-150 top-150 z-10">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full p-50 text-text-subtle hover:bg-gray-100"
          aria-label="더보기"
        >
          <MoreVertical size={20} />
        </button>
        {menuOpen && (
          <div className="border-border-subtle absolute right-0 top-full mt-50 flex flex-col rounded-100 border bg-white py-100 shadow-sm">
            <Link
              href={feedHref}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-150 px-200 py-100 font-designer-14r text-text-subtle hover:text-text-default"
            >
              <Pencil size={16} />
              수정
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-150 px-200 py-100 font-designer-14r text-text-subtle hover:text-red-500 disabled:opacity-50"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        )}
      </div>

      <Link href={feedHref} className="flex flex-col">
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
            {feed.feedContent}
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
    </div>
  );
}

function DraftFeedCard({ feed }: { feed: MyDraftBuilderFeedItemResponse }) {
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const showToast = useToastStore((state) => state.showToast);
  const plainText = feed.content.replace(/<[^>]*>/g, '');

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="border-border-subtle relative flex flex-col overflow-hidden rounded-200 border">
      <div ref={menuRef} className="absolute right-150 top-150 z-10">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full p-50 text-text-subtle hover:bg-gray-100"
          aria-label="더보기"
        >
          <MoreVertical size={20} />
        </button>
        {menuOpen && (
          <div className="border-border-subtle absolute right-0 top-full mt-50 flex flex-col rounded-100 border bg-white py-100 shadow-sm">
            <Link
              href={`/class/${feed.courseId}/lesson/${feed.lessonId}?feedId=${feed.feedId}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-150 px-200 py-100 font-designer-14r text-text-subtle hover:text-text-default"
            >
              <Pencil size={16} />
              수정
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                // TODO: connect to draft delete API when backend is ready
                showToast('준비 중입니다.', 'error');
              }}
              className="flex items-center gap-150 px-200 py-100 font-designer-14r text-text-subtle hover:text-red-500"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        )}
      </div>

      <Link
        href={`/class/${feed.courseId}/lesson/${feed.lessonId}?feedId=${feed.feedId}`}
        className="flex flex-col"
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
          <span className="font-designer-12r text-text-subtlest ml-auto">
            {formatDate(feed.createdAt)}
          </span>
        </div>
      </Link>
    </div>
  );
}
