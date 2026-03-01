'use client';

import { useState } from 'react';
import { ARCHIVE_PAGE_SIZE, ARCHIVE_VIEW_MODES } from '@/config/archive-const';

type LibrarySort = 'LATEST' | 'VIEWS' | 'LIKES';
type ViewMode = 'GRID' | 'LIST';

interface UseArchiveFiltersOptions {
  onToggleScroll?: () => void;
}

export const useArchiveFilters = (options?: UseArchiveFiltersOptions) => {
  const [librarySort, setLibrarySort] = useState<LibrarySort>('LATEST');
  const [viewMode, setViewMode] = useState<ViewMode>(ARCHIVE_VIEW_MODES.LIST);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showMyOnly, setShowMyOnly] = useState(false);

  const triggerScroll = () => {
    options?.onToggleScroll?.();
  };

  const toggleBookmarkedOnly = () => {
    setShowBookmarkedOnly((prev) => {
      if (!prev) {
        setShowMyOnly(false);
      }

      return !prev;
    });
    triggerScroll();
  };

  const toggleMyOnly = () => {
    setShowMyOnly((prev) => {
      if (!prev) {
        setShowBookmarkedOnly(false);
      }

      return !prev;
    });
    triggerScroll();
  };

  const itemsPerPage =
    viewMode === ARCHIVE_VIEW_MODES.LIST
      ? ARCHIVE_PAGE_SIZE.LIST
      : ARCHIVE_PAGE_SIZE.GRID;

  return {
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
  };
};
