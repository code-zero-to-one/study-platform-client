'use client';

import { Loader2 } from 'lucide-react';
import React from 'react';
import SectionShell from '@/components/ui/section-shell';
import { ARCHIVE_VIEW_MODES } from '@/features/study/one-to-one/archive/const/archive';
import { useArchiveActions } from '@/features/study/one-to-one/archive/model/use-archive-actions';
import { useArchiveQuery } from '@/features/study/one-to-one/archive/model/use-archive-query';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming this hook exists, or I will create it/use raw
import { useScrollToHomeContent } from '@/hooks/use-scroll-to-home-content';
import {
  ArchiveItem,
  ArchiveResponse,
  GetArchiveParams,
} from '@/types/archive';
import ArchiveFilters from './archive-filters';
import ArchiveGrid from './archive-grid';
import ArchiveHeader from './archive-header';
import ArchiveList from './archive-list';
import ArchivePagination from './archive-pagination';
import { useArchiveFilters } from './use-archive-filters';

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
  const [isClientReady, setIsClientReady] = React.useState(false);
  const scrollToHomeContent = useScrollToHomeContent();
  const {
    librarySort,
    viewMode,
    currentPage,
    searchTerm,
    showBookmarkedOnly,
    showMyOnly,
    itemsPerPage,
    setLibrarySort,
    setViewMode,
    setCurrentPage,
    setSearchTerm,
    toggleBookmarkedOnly,
    toggleMyOnly,
  } = useArchiveFilters({
    onToggleScroll: () => requestAnimationFrame(scrollToHomeContent),
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // React Query Hook
  const archiveParams: GetArchiveParams = {
    page: currentPage - 1,
    size: itemsPerPage,
    sort: librarySort,
    search: debouncedSearchTerm || undefined,
    bookmarkedOnly: showBookmarkedOnly || undefined,
    authorOnly: showMyOnly || undefined,
    authorId: undefined,
  };

  const shouldUseInitialData =
    archiveParams.page === initialParams.page &&
    archiveParams.size === initialParams.size &&
    archiveParams.sort === initialParams.sort &&
    archiveParams.search === initialParams.search &&
    archiveParams.bookmarkedOnly === initialParams.bookmarkedOnly &&
    archiveParams.authorOnly === initialParams.authorOnly &&
    archiveParams.authorId === initialParams.authorId;

  const { data: archiveData, isLoading } = useArchiveQuery(archiveParams, {
    initialData: shouldUseInitialData ? initialData : undefined,
  });

  const {
    toggleBookmark,
    toggleLike,
    updateArchive,
    openAndRecordView,
    isAuthenticated,
  } = useArchiveActions();

  React.useEffect(() => {
    setIsClientReady(true);
  }, []);

  const libraryItems = archiveData?.content || [];
  const totalPages = archiveData?.totalPages || 1;

  // Handler for Likes
  const handleLike = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isClientReady || !isAuthenticated) return;
    toggleLike(id);
  };

  const handleView = (item: ArchiveItem) => {
    openAndRecordView(item);
  };

  const handleLibraryBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!isClientReady || !isAuthenticated) return;
    toggleBookmark(id);
  };

  return (
    <SectionShell>
      <ArchiveHeader />

      <ArchiveFilters
        librarySort={librarySort}
        onSortChange={setLibrarySort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showBookmarkedOnly={showBookmarkedOnly}
        onToggleBookmarkedOnly={toggleBookmarkedOnly}
        showMyOnly={showMyOnly}
        onToggleMyOnly={toggleMyOnly}
        isAuthenticated={isClientReady ? isAuthenticated : false}
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
              canEdit={showMyOnly}
              onLike={handleLike}
              onView={handleView}
              onBookmark={handleLibraryBookmark}
              onUpdate={updateArchive}
            />
          ) : (
            <ArchiveList
              items={libraryItems}
              canEdit={showMyOnly}
              onLike={handleLike}
              onView={handleView}
              onBookmark={handleLibraryBookmark}
              onUpdate={updateArchive}
            />
          )}
        </>
      )}

      {/* Pagination */}
      <ArchivePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </SectionShell>
  );
}
