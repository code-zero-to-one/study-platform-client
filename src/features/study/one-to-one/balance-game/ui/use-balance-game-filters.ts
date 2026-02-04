'use client';

import { useState } from 'react';

type StatusFilter = 'active' | 'closed' | 'all';
type SortMode = 'latest' | 'popular';

interface BalanceGameFiltersOptions {
  onChange?: () => void;
}

export const useBalanceGameFilters = (options?: BalanceGameFiltersOptions) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const triggerChange = () => {
    options?.onChange?.();
  };

  const setStatus = (next: StatusFilter) => {
    setStatusFilter((prev) => {
      if (prev === next) return prev;
      triggerChange();

      return next;
    });
  };

  const setSort = (next: SortMode) => {
    setSortMode((prev) => {
      if (prev === next) return prev;
      triggerChange();

      return next;
    });
  };

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSelectedTags((prev) => {
      if (prev.includes(trimmed)) {
        return prev;
      }
      triggerChange();

      return [...prev, trimmed];
    });
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (!prev.includes(tag)) return prev;
      triggerChange();

      return prev.filter((item) => item !== tag);
    });
  };

  return {
    statusFilter,
    sortMode,
    selectedTags,
    setStatus,
    setSort,
    addTag,
    removeTag,
  };
};
