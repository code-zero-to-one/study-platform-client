'use client';

import { ArrowUpDown, Search } from 'lucide-react';
import React from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useBalanceGameSearchSuggestionsQuery } from '@/hooks/queries/use-balance-game-search-suggestions-query';
import { useDebounce } from '@/hooks/use-debounce';
import FilterPillButton from './filter-pill-button';
import TagAutocomplete from './tag-autocomplete';

type StatusFilter = 'active' | 'closed' | 'all';
type SortMode = 'latest' | 'popular';

interface BalanceGameFiltersBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (next: StatusFilter) => void;
  sortMode: SortMode;
  onSortChange: (next: SortMode) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  tagValue: string;
  onTagValueChange: (value: string) => void;
  onAddTag: (tag: string) => void;
  selectedTags: string[];
  onRemoveTag: (tag: string) => void;
  tagSuggestions: { name: string; count?: number }[];
  isTagLoading?: boolean;
  sortVariant?: 'pills' | 'dropdown';
  rightSlot?: React.ReactNode;
}

export default function BalanceGameFiltersBar({
  statusFilter,
  onStatusChange,
  sortMode,
  onSortChange,
  searchTerm,
  onSearchChange,
  tagValue,
  onTagValueChange,
  onAddTag,
  selectedTags,
  onRemoveTag,
  tagSuggestions,
  isTagLoading = false,
  sortVariant = 'pills',
  rightSlot,
}: BalanceGameFiltersBarProps) {
  const minQueryLength = 1;
  const debouncedSearchTerm = useDebounce(searchTerm, 200);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { data: suggestionData, isFetching } =
    useBalanceGameSearchSuggestionsQuery(debouncedSearchTerm, {
      minLength: minQueryLength,
      size: 10,
      enabled: isOpen && debouncedSearchTerm.trim().length >= minQueryLength,
      scope: 'all',
    });

  const titleSuggestions = suggestionData?.titles ?? [];
  const authorSuggestions = suggestionData?.authors ?? [];

  const flatSuggestions = React.useMemo(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suggestionData],
  );

  React.useEffect(() => {
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

  React.useEffect(() => {
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
        <div className="scrollbar-hide flex items-center gap-200 overflow-x-auto pb-100 md:pb-0">
          <FilterPillButton
            isActive={statusFilter === 'active'}
            onClick={() => onStatusChange('active')}
          >
            진행 중
          </FilterPillButton>
          <FilterPillButton
            isActive={statusFilter === 'closed'}
            onClick={() => onStatusChange('closed')}
          >
            종료됨
          </FilterPillButton>
          <FilterPillButton
            isActive={statusFilter === 'all'}
            onClick={() => onStatusChange('all')}
          >
            전체
          </FilterPillButton>

          {sortVariant === 'pills' && (
            <>
              <div className="bg-border-subtle mx-100 h-6 w-px" />
              <FilterPillButton
                isActive={sortMode === 'latest'}
                onClick={() => onSortChange('latest')}
              >
                최신순
              </FilterPillButton>
              <FilterPillButton
                isActive={sortMode === 'popular'}
                onClick={() => onSortChange('popular')}
              >
                인기순
              </FilterPillButton>
            </>
          )}
        </div>

        <div className="ml-auto flex w-full flex-col items-start gap-200 md:w-auto md:flex-row md:items-center">
          <TagAutocomplete
            value={tagValue}
            onValueChange={onTagValueChange}
            onAddTag={onAddTag}
            selectedTags={selectedTags}
            onRemoveTag={onRemoveTag}
            suggestions={tagSuggestions}
            isLoading={isTagLoading}
            minQueryLength={1}
            className="w-full md:w-[280px]"
            inputClassName="h-600 w-full"
            showSelectedTags={false}
          />
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
                                    : 'text-text-subtle hover:bg-fill-neutral-subtle-default',
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
                                      : 'text-text-subtle hover:bg-fill-neutral-subtle-default',
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

          {sortVariant === 'dropdown' && (
            <div className="group relative">
              <button className="rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors">
                <ArrowUpDown className="h-4 w-4" />
                {sortMode === 'latest' ? '최신순' : '인기순'}
              </button>
              <div className="absolute top-full right-0 z-20 hidden w-[120px] pt-50 group-hover:block">
                <div className="bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border">
                  <button
                    onClick={() => onSortChange('latest')}
                    className={cn(
                      'hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors',
                      sortMode === 'latest' && 'bg-fill-neutral-subtle-default',
                    )}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => onSortChange('popular')}
                    className={cn(
                      'hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors',
                      sortMode === 'popular' &&
                        'bg-fill-neutral-subtle-default',
                    )}
                  >
                    인기순
                  </button>
                </div>
              </div>
            </div>
          )}

          {rightSlot}
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-150">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="rounded-100 border-border-subtle font-designer-13b text-text-subtle hover:border-border-brand hover:text-text-brand px-200 py-150 transition-colors"
            >
              #{tag} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
