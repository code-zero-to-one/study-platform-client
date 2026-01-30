'use client';

import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { useArchive } from '@/features/archive/model/use-archive-query';
import { useToggleArchiveBookmark } from '@/features/archive/model/use-bookmark-mutation';
import { useToggleArchiveLike } from '@/features/archive/model/use-like-mutation';
import { useRecordArchiveView } from '@/features/archive/model/use-view-mutation';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists, or I will create it/use raw
import { ArchiveResponse, GetArchiveParams } from '@/types/archive';
import ArchiveHeader from './archive-header';
import ArchiveFilters from './archive-filters';
import ArchiveGrid from './archive-grid';
import ArchiveList from './archive-list';
import {
  ARCHIVE_PAGE_SIZE,
  ARCHIVE_VIEW_MODES,
} from '@/features/archive/const/archive';

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

interface ArchiveTabClientProps {
  initialData?: ArchiveResponse;
  initialParams: GetArchiveParams;
}

export default function ArchiveTabClient({
  initialData,
  initialParams,
}: ArchiveTabClientProps) {
  const [librarySort, setLibrarySort] = useState<'LATEST' | 'VIEWS' | 'LIKES'>(
    'LATEST',
  );
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>(
    ARCHIVE_VIEW_MODES.GRID,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // New States
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Mock Admin Mode

  const ITEMS_PER_PAGE =
    viewMode === ARCHIVE_VIEW_MODES.LIST
      ? ARCHIVE_PAGE_SIZE.LIST
      : ARCHIVE_PAGE_SIZE.GRID;

  // React Query Hook
  const archiveParams = {
    page: currentPage - 1,
    size: ITEMS_PER_PAGE,
    sort: librarySort,
    search: debouncedSearchTerm || undefined,
    bookmarkedOnly: showBookmarkedOnly || undefined,
  };

  const shouldUseInitialData =
    archiveParams.page === initialParams.page &&
    archiveParams.size === initialParams.size &&
    archiveParams.sort === initialParams.sort &&
    archiveParams.search === initialParams.search &&
    archiveParams.bookmarkedOnly === initialParams.bookmarkedOnly;

  const { data: archiveData, isLoading } = useArchive(archiveParams, {
    initialData: shouldUseInitialData ? initialData : undefined,
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
      <ArchiveHeader
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
      />

      <ArchiveFilters
        librarySort={librarySort}
        onSortChange={setLibrarySort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showBookmarkedOnly={showBookmarkedOnly}
        onToggleBookmarkedOnly={() =>
          setShowBookmarkedOnly(!showBookmarkedOnly)
        }
      />

      {isLoading ? (
        <div className="text-text-subtlest flex flex-col items-center gap-200 py-800 text-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="font-designer-16m">데이터를 불러오는 중입니다...</div>
        </div>
      ) : (
        <>
          {/* Library Content */}
          {viewMode === ARCHIVE_VIEW_MODES.GRID ? (
            <ArchiveGrid
              items={libraryItems}
              isAdmin={isAdmin}
              onLike={handleLike}
              onView={handleView}
              onBookmark={handleLibraryBookmark}
              onHide={handleHide}
            />
          ) : (
            <ArchiveList
              items={libraryItems}
              isAdmin={isAdmin}
              onLike={handleLike}
              onView={handleView}
              onBookmark={handleLibraryBookmark}
              onHide={handleHide}
            />
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
