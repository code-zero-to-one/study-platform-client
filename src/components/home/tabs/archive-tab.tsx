'use client';

import {
  LibraryBig,
  LayoutGrid,
  List,
  ArrowUpDown,
  Bookmark,
  Search,
  Eye,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import { useArchive } from '@/features/archive/model/use-archive-query';
import { useToggleArchiveBookmark } from '@/features/archive/model/use-bookmark-mutation';
import { useToggleArchiveLike } from '@/features/archive/model/use-like-mutation';
import { useRecordArchiveView } from '@/features/archive/model/use-view-mutation';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists, or I will create it/use raw
import { ArchiveItem } from '@/types/archive';

// ----------------------------------------------------------------------
// Components
// ----------------------------------------------------------------------

const LibraryCard = ({
  item,
  onLike,
  onView,
  onBookmark,
  onHide,
  isAdmin,
}: {
  item: ArchiveItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (id: number, link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
  isAdmin?: boolean;
}) => {
  // 임시: isHidden은 API 응답에 없으므로 optional 처리
  const isHidden = (item as any).isHidden;

  return (
    <div
      onClick={() => onView(item.id, item.link)}
      className={cn(
        'rounded-200 border-border-subtle bg-background-default shadow-1 hover:shadow-2 flex h-full cursor-pointer flex-col gap-250 border p-400 transition-all hover:-translate-y-50',
        isHidden && 'opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-200">
        <div className="flex flex-wrap items-center gap-100">
          {isHidden && (
            <span className="rounded-100 bg-fill-neutral-subtle-default font-designer-12m text-text-subtle px-200 py-50">
              숨김됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-100">
          {isAdmin && onHide && (
            <button
              onClick={(e) => onHide(e, item.id)}
              className="rounded-100 font-designer-12m bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover flex items-center gap-50 px-150 py-50 transition-colors"
            >
              {isHidden ? '보이기' : '숨기기'}
            </button>
          )}
          <button
            onClick={(e) => onBookmark(e, item.id)}
            className="font-designer-12r hover:bg-fill-neutral-subtle-hover flex items-center gap-50 rounded-full p-1 transition-transform hover:scale-110"
          >
            <Bookmark
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                item.isBookmarked
                  ? 'fill-text-strong text-text-strong'
                  : 'text-text-subtle',
              )}
            />
          </button>
        </div>
      </div>

      <div className="mb-auto flex flex-col gap-150">
        <h3 className="font-bold-h4 text-text-strong line-clamp-2">
          {item.title}
        </h3>
      </div>

      <div className="border-border-subtle mt-auto flex items-center justify-between border-t pt-300">
        <span className="font-designer-13m text-text-subtle">
          by{' '}
          <span className="text-text-default font-medium">{item.author}</span>
        </span>
        <div className="text-text-subtle flex items-center gap-200">
          <div className="font-designer-12r flex items-center gap-50">
            <Eye className="h-3.5 w-3.5" />
            {item.views.toLocaleString()}
          </div>
          <button
            onClick={(e) => onLike(e, item.id)}
            className="font-designer-12r flex items-center gap-50 rounded-full p-1 transition-transform hover:scale-110 hover:bg-red-50"
          >
            <Heart
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                item.isLiked ? 'fill-red-500 text-red-500' : 'text-text-subtle',
              )}
            />
            <span className={cn(item.isLiked && 'font-bold text-red-500')}>
              {item.likes.toLocaleString()}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const LibraryRow = ({
  item,
  onLike,
  onView,
  onBookmark,
  onHide,
  isAdmin,
}: {
  item: ArchiveItem;
  onLike: (e: React.MouseEvent, id: number) => void;
  onView: (link: string) => void;
  onBookmark: (e: React.MouseEvent, id: number) => void;
  onHide?: (e: React.MouseEvent, id: number) => void;
  isAdmin?: boolean;
}) => {
  // 임시: isHidden은 API 응답에 없으므로 optional 처리
  const isHidden = (item as any).isHidden;

  return (
    <div
      onClick={() => onView(item.link)}
      className={cn(
        'group border-border-subtlest hover:bg-fill-neutral-subtle-hover flex cursor-pointer items-center gap-300 border-b px-300 py-200 transition-colors last:border-0',
        isHidden && 'opacity-50',
      )}
    >
      {/* Title Area */}
      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <div className="flex items-center gap-100">
          <h3 className="font-designer-15b text-text-strong group-hover:text-text-information truncate transition-colors">
            {item.title}
          </h3>
          {isHidden && (
            <span className="rounded-100 bg-fill-neutral-subtle-default font-designer-11m text-text-subtle shrink-0 px-150 py-25">
              숨김됨
            </span>
          )}
        </div>
        <div className="font-designer-12r text-text-subtle flex items-center gap-100">
          <span>{item.author}</span>
          <span className="bg-border-subtle h-[10px] w-[1px]" />
          <span>{item.date}</span>
        </div>
      </div>

      {/* Stats Area */}
      <div className="flex shrink-0 items-center gap-200">
        {isAdmin && onHide && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onHide(e, item.id);
            }}
            className="rounded-100 font-designer-11m bg-background-alternative text-text-subtle hover:bg-fill-neutral-subtle-hover flex items-center gap-25 px-100 py-50 transition-colors"
          >
            {isHidden ? '보이기' : '숨기기'}
          </button>
        )}
        <button
          onClick={(e) => onBookmark(e, item.id)}
          className="font-designer-12r hover:bg-fill-neutral-subtle-hover flex items-center gap-50 rounded-full p-1 transition-transform hover:scale-110"
        >
          <Bookmark
            className={cn(
              'h-3.5 w-3.5 transition-colors',
              item.isBookmarked
                ? 'fill-text-strong text-text-strong'
                : 'text-text-subtle',
            )}
          />
        </button>

        <div className="font-designer-13m text-text-subtle flex min-w-[60px] items-center justify-end gap-50">
          <Eye className="h-3.5 w-3.5" />
          {item.views.toLocaleString()}
        </div>

        <button
          onClick={(e) => onLike(e, item.id)}
          className="font-designer-13m flex min-w-[50px] items-center justify-end gap-50 rounded-full p-1 transition-transform hover:scale-110 hover:bg-red-50"
        >
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-colors',
              item.isLiked ? 'fill-red-500 text-red-500' : 'text-text-subtle',
            )}
          />
          <span
            className={cn(
              item.isLiked ? 'font-bold text-red-500' : 'text-text-subtle',
            )}
          >
            {item.likes.toLocaleString()}
          </span>
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function ArchiveTab() {
  const [librarySort, setLibrarySort] = useState<'LATEST' | 'VIEWS' | 'LIKES'>(
    'LATEST',
  );
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // New States
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Mock Admin Mode

  const ITEMS_PER_PAGE = viewMode === 'LIST' ? 15 : 10;

  // React Query Hook
  const { data: archiveData, isLoading } = useArchive({
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
    sort: librarySort,
    search: debouncedSearchTerm || undefined,
    bookmarkedOnly: showBookmarkedOnly || undefined,
  });

  const { mutate: toggleBookmark } = useToggleArchiveBookmark();
  const { mutate: toggleLike } = useToggleArchiveLike();
  const { mutate: recordView } = useRecordArchiveView();

  const libraryItems = archiveData?.content || [];
  const totalPages = archiveData?.totalPages || 1;

  // Handler for Likes
  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleLike(id);
  };

  const handleView = (id: number, link: string) => {
    // 1. 링크 바로 열기 (사용자 대기 시간 없음)
    window.open(link, '_blank');

    // 2. 백그라운드에서 조회수 기록 (Fire-and-forget)
    recordView(id);
  };

  const handleLibraryBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleBookmark(id);
  };

  const handleHide = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    // TODO: Implement Hide Mutation (Admin Only)
    console.log('Hide', id);
  };

  return (
    <div className="flex flex-col gap-400">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h2 className="font-display-headings6 text-text-strong flex items-center gap-150">
          제로원 아카이브
          <LibraryBig className="text-text-brand h-8 w-8" />
        </h2>

        {/* Admin Toggle (Hidden/Dev feature) */}
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          className={cn(
            'rounded-100 px-200 py-100 font-mono text-xs transition-colors',
            isAdmin
              ? 'bg-red-100 text-red-600'
              : 'bg-transparent text-transparent hover:text-gray-300',
          )}
        >
          {isAdmin ? 'Admin Mode ON' : 'Admin'}
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-300">
        <div className="flex flex-col gap-300 md:flex-row md:items-center md:justify-between">
          {/* Left Side Filters */}
          <div className="hide-scrollbar flex items-center gap-200 overflow-x-auto pb-100 md:pb-0">
            {/* Bookmark Filter */}
            <button
              onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              className={cn(
                'rounded-100 font-designer-14b flex items-center gap-50 border px-300 py-150 whitespace-nowrap transition-all',
                showBookmarkedOnly
                  ? 'bg-fill-brand-default-default text-text-inverse shadow-1 border-transparent'
                  : 'bg-background-default border-border-subtle text-text-subtle hover:border-border-brand hover:text-text-brand',
              )}
            >
              <Bookmark
                className={cn('h-4 w-4', showBookmarkedOnly && 'fill-current')}
              />
              북마크
            </button>
          </div>

          {/* Right Side Controls */}
          <div className="ml-auto flex w-full flex-col items-start gap-200 md:w-auto md:flex-row md:items-center">
            {/* Search Bar */}
            <div className="relative w-full md:w-[240px]">
              <input
                type="text"
                placeholder="제목으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-100 border-border-subtle bg-background-default font-designer-14m focus:border-border-default focus:ring-fill-neutral-default-default h-600 w-full border pr-500 pl-200 transition-all outline-none focus:ring-2"
              />
              <span className="text-text-subtlest absolute top-1/2 right-200 -translate-y-1/2">
                <Search className="h-4 w-4" />
              </span>
            </div>

            {/* Sort & View Toggle */}
            <div className="flex w-full items-center justify-end gap-200 md:w-auto">
              {/* Sort Dropdown */}
              <div className="group relative">
                <button className="rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors">
                  <ArrowUpDown className="h-4 w-4" />
                  {librarySort === 'LATEST'
                    ? '최신순'
                    : librarySort === 'VIEWS'
                      ? '조회순'
                      : '좋아요순'}
                </button>

                {/* Dropdown */}
                <div className="absolute top-full right-0 z-20 hidden w-[120px] pt-50 group-hover:block">
                  <div className="bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border">
                    <button
                      onClick={() => setLibrarySort('LATEST')}
                      className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                    >
                      최신순
                    </button>
                    <button
                      onClick={() => setLibrarySort('VIEWS')}
                      className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                    >
                      조회순
                    </button>
                    <button
                      onClick={() => setLibrarySort('LIKES')}
                      className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                    >
                      좋아요순
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-border-subtle h-[24px] w-[1px]" />

              {/* View Mode Toggle */}
              <div className="bg-background-default rounded-100 border-border-subtle flex shrink-0 border p-50">
                <button
                  onClick={() => setViewMode('GRID')}
                  className={cn(
                    'rounded-75 p-100 transition-colors',
                    viewMode === 'GRID'
                      ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                      : 'text-text-subtlest hover:text-text-subtle',
                  )}
                  title="2열 보기"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('LIST')}
                  className={cn(
                    'rounded-75 p-100 transition-colors',
                    viewMode === 'LIST'
                      ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                      : 'text-text-subtlest hover:text-text-subtle',
                  )}
                  title="1열 보기 (촘촘하게)"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="font-designer-16m">데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
        <>
          {/* Library Content */}
          {viewMode === 'GRID' ? (
            /* Grid View */
            <div className="grid grid-cols-1 gap-300 md:grid-cols-2">
              {libraryItems.length > 0 ? (
                libraryItems.map((item) => (
                  <LibraryCard
                    key={item.id}
                    item={item}
                    onLike={handleLike}
                    onView={handleView}
                    onBookmark={handleLibraryBookmark}
                    onHide={handleHide}
                    isAdmin={isAdmin}
                  />
                ))
              ) : (
                <div className="text-text-subtlest col-span-full flex flex-col items-center gap-200 py-800 text-center">
                  <Search className="h-10 w-10 opacity-20" />
                  <p className="font-designer-16m">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="bg-background-default rounded-200 border-border-subtle overflow-hidden border">
              {libraryItems.length > 0 ? (
                <div className="divide-border-subtlest divide-y">
                  {libraryItems.map((item) => (
                    <LibraryRow
                      key={item.id}
                      item={item}
                      onLike={handleLike}
                      onView={(link) => handleView(item.id, link)}
                      onBookmark={handleLibraryBookmark}
                      onHide={handleHide}
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
                  <Search className="h-10 w-10 opacity-20" />
                  <p className="font-designer-16m">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-100 py-600">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="font-designer-15m text-text-subtle bg-background-default border-border-subtle flex h-[40px] items-center justify-center rounded-[9999px] border px-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="border-border-subtle hover:bg-fill-neutral-subtle-hover text-text-subtle flex h-[40px] w-[40px] items-center justify-center rounded-[9999px] border transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
