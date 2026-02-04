'use client';

import {
  ArrowUpDown,
  Bookmark,
  LayoutGrid,
  List,
  Search,
  User,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import FilterPillButton from '@/components/ui/filters/filter-pill-button';
import SortDropdown from '@/components/ui/filters/sort-dropdown';
import ViewModeToggle from '@/components/ui/filters/view-mode-toggle';
import {
  ARCHIVE_SORT_OPTIONS,
  ARCHIVE_VIEW_MODES,
} from '@/features/study/one-to-one/archive/const/archive';
import { useArchiveSearchSuggestionsQuery } from '@/features/study/one-to-one/archive/model/use-archive-search-suggestions-query';
import { useDebounce } from '@/hooks/use-debounce';

interface ArchiveFiltersProps {
  librarySort: 'LATEST' | 'VIEWS' | 'LIKES';
  onSortChange: (sort: 'LATEST' | 'VIEWS' | 'LIKES') => void;
  viewMode: 'GRID' | 'LIST';
  onViewModeChange: (mode: 'GRID' | 'LIST') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showBookmarkedOnly: boolean;
  onToggleBookmarkedOnly: () => void;
  showMyOnly: boolean;
  onToggleMyOnly: () => void;
  isAuthenticated: boolean;
}

export default function ArchiveFilters({
  librarySort,
  onSortChange,
  viewMode,
  onViewModeChange,
  searchTerm,
  onSearchChange,
  showBookmarkedOnly,
  onToggleBookmarkedOnly,
  showMyOnly,
  onToggleMyOnly,
  isAuthenticated,
}: ArchiveFiltersProps) {
  const minQueryLength = 1;
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const { data: suggestionData, isFetching } = useArchiveSearchSuggestionsQuery(
    debouncedSearchTerm,
    {
      minLength: minQueryLength,
      size: 10,
      enabled: isOpen && debouncedSearchTerm.trim().length >= minQueryLength,
    },
  );

  const titleSuggestions = suggestionData?.titles ?? [];
  const authorSuggestions = suggestionData?.authors ?? [];

  const flatSuggestions = useMemo(
    () => [
      ...titleSuggestions.map((value) => ({
        value,
        group: 'title' as const,
      })),
      ...authorSuggestions.map((value) => ({
        value,
        group: 'author' as const,
      })),
    ],
    [titleSuggestions, authorSuggestions],
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [searchTerm, flatSuggestions.length]);

  const openIfEligible = (nextValue: string) => {
    const eligible = nextValue.trim().length >= minQueryLength;
    setIsOpen(eligible);
    if (!eligible) {
      setActiveIndex(-1);
    }
  };

  const handleSelectSuggestion = (value: string) => {
    onSearchChange(value);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-col gap-300 md:flex-row md:items-center md:justify-between">
        <div className="hide-scrollbar flex items-center gap-200 overflow-x-auto pb-100 md:pb-0">
          <FilterPillButton
            isActive={showBookmarkedOnly}
            onClick={onToggleBookmarkedOnly}
            disabled={!isAuthenticated}
            className="flex items-center gap-50 whitespace-nowrap"
          >
            <Bookmark
              className={cn('h-4 w-4', showBookmarkedOnly && 'fill-current')}
            />
            북마크
          </FilterPillButton>
          <FilterPillButton
            isActive={showMyOnly}
            onClick={onToggleMyOnly}
            disabled={!isAuthenticated}
            className="flex items-center gap-50 whitespace-nowrap"
          >
            <User className="h-4 w-4" />내 아카이브
          </FilterPillButton>
        </div>

        <div className="ml-auto flex w-full flex-col items-start gap-200 md:w-auto md:flex-row md:items-center">
          <div ref={containerRef} className="relative w-full md:w-[280px]">
            <input
              type="text"
              placeholder="제목이나 작성자로 검색하세요"
              value={searchTerm}
              onFocus={() => openIfEligible(searchTerm)}
              onChange={(e) => {
                const nextValue = e.target.value;
                onSearchChange(nextValue);
                openIfEligible(nextValue);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && flatSuggestions.length) {
                  e.preventDefault();
                  setIsOpen(true);
                  setActiveIndex((prev) =>
                    prev + 1 >= flatSuggestions.length ? 0 : prev + 1,
                  );

                  return;
                }
                if (e.key === 'ArrowUp' && flatSuggestions.length) {
                  e.preventDefault();
                  setIsOpen(true);
                  setActiveIndex((prev) =>
                    prev <= 0 ? flatSuggestions.length - 1 : prev - 1,
                  );

                  return;
                }
                if (e.key === 'Enter') {
                  if (activeIndex >= 0 && flatSuggestions[activeIndex]) {
                    e.preventDefault();
                    handleSelectSuggestion(flatSuggestions[activeIndex].value);
                  }

                  return;
                }
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setActiveIndex(-1);
                }
              }}
              className="rounded-100 border-border-subtle bg-background-default font-designer-14m focus:border-border-default focus:ring-fill-neutral-default-default h-600 w-full border pr-500 pl-200 transition-all outline-none focus:ring-2"
            />
            <span className="text-text-subtlest absolute top-1/2 right-200 -translate-y-1/2">
              <Search className="h-4 w-4" />
            </span>
            {isOpen &&
              (flatSuggestions.length > 0 || isFetching) &&
              searchTerm.trim().length >= minQueryLength && (
                <div className="absolute top-full left-0 z-30 mt-100 w-full">
                  <div className="bg-background-default border-border-subtle rounded-150 shadow-2 overflow-hidden border py-100">
                    {isFetching ? (
                      <div className="font-designer-13r text-text-subtlest px-200 py-150">
                        검색 중...
                      </div>
                    ) : (
                      <>
                        {titleSuggestions.length > 0 && (
                          <div className="px-200 pb-100">
                            <div className="font-designer-12b text-text-subtlest pb-50">
                              제목
                            </div>
                            {titleSuggestions.map((title, index) => (
                              <button
                                key={`title-${title}`}
                                type="button"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  handleSelectSuggestion(title);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                  'font-designer-13r w-full px-200 py-150 text-left transition-colors',
                                  activeIndex === index
                                    ? 'bg-fill-neutral-subtle-default text-text-strong'
                                    : 'text-text-subtle hover:bg-fill-neutral-subtle-hover',
                                )}
                              >
                                {title}
                              </button>
                            ))}
                          </div>
                        )}
                        {authorSuggestions.length > 0 && (
                          <div
                            className={cn(
                              'px-200',
                              titleSuggestions.length > 0 &&
                                'border-border-subtle border-t pt-100',
                            )}
                          >
                            <div className="font-designer-12b text-text-subtlest pb-50">
                              작성자
                            </div>
                            {authorSuggestions.map((author, index) => {
                              const authorIndex =
                                titleSuggestions.length + index;

                              return (
                                <button
                                  key={`author-${author}`}
                                  type="button"
                                  onMouseDown={(event) => {
                                    event.preventDefault();
                                    handleSelectSuggestion(author);
                                  }}
                                  onMouseEnter={() =>
                                    setActiveIndex(authorIndex)
                                  }
                                  className={cn(
                                    'font-designer-13r w-full px-200 py-150 text-left transition-colors',
                                    activeIndex === authorIndex
                                      ? 'bg-fill-neutral-subtle-default text-text-strong'
                                      : 'text-text-subtle hover:bg-fill-neutral-subtle-hover',
                                  )}
                                >
                                  {author}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            {isOpen &&
              !isFetching &&
              flatSuggestions.length === 0 &&
              searchTerm.trim().length >= minQueryLength && (
                <div className="absolute top-full left-0 z-30 mt-100 w-full">
                  <div className="bg-background-default border-border-subtle rounded-150 shadow-2 overflow-hidden border py-100">
                    <div className="font-designer-13r text-text-subtlest px-200 py-150">
                      검색 결과가 없습니다
                    </div>
                  </div>
                </div>
              )}
          </div>

          <div className="flex w-full items-center justify-end gap-200 md:w-auto">
            <SortDropdown
              value={librarySort}
              options={ARCHIVE_SORT_OPTIONS}
              onChange={onSortChange}
              icon={<ArrowUpDown className="h-4 w-4" />}
            />

            <div className="bg-border-subtle h-[24px] w-[1px]" />

            <ViewModeToggle
              value={viewMode}
              onChange={onViewModeChange}
              options={[
                {
                  value: ARCHIVE_VIEW_MODES.GRID,
                  icon: <LayoutGrid className="h-4 w-4" />,
                  title: '2열 보기',
                },
                {
                  value: ARCHIVE_VIEW_MODES.LIST,
                  icon: <List className="h-4 w-4" />,
                  title: '1열 보기 (촘촘하게)',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
