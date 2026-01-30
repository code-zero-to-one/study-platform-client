import { ArrowUpDown, Bookmark, LayoutGrid, List, Search } from 'lucide-react';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import {
  ARCHIVE_SORT_OPTIONS,
  ARCHIVE_VIEW_MODES,
} from '@/features/archive/const/archive';

interface ArchiveFiltersProps {
  librarySort: 'LATEST' | 'VIEWS' | 'LIKES';
  onSortChange: (sort: 'LATEST' | 'VIEWS' | 'LIKES') => void;
  viewMode: 'GRID' | 'LIST';
  onViewModeChange: (mode: 'GRID' | 'LIST') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showBookmarkedOnly: boolean;
  onToggleBookmarkedOnly: () => void;
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
}: ArchiveFiltersProps) {
  const sortLabel =
    ARCHIVE_SORT_OPTIONS.find((option) => option.value === librarySort)
      ?.label ?? '최신순';

  return (
    <div className="flex flex-col gap-300">
      <div className="flex flex-col gap-300 md:flex-row md:items-center md:justify-between">
        <div className="hide-scrollbar flex items-center gap-200 overflow-x-auto pb-100 md:pb-0">
          <button
            onClick={onToggleBookmarkedOnly}
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

        <div className="ml-auto flex w-full flex-col items-start gap-200 md:w-auto md:flex-row md:items-center">
          <div className="relative w-full md:w-[240px]">
            <input
              type="text"
              placeholder="제목으로 검색"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="rounded-100 border-border-subtle bg-background-default font-designer-14m focus:border-border-default focus:ring-fill-neutral-default-default h-600 w-full border pr-500 pl-200 transition-all outline-none focus:ring-2"
            />
            <span className="text-text-subtlest absolute top-1/2 right-200 -translate-y-1/2">
              <Search className="h-4 w-4" />
            </span>
          </div>

          <div className="flex w-full items-center justify-end gap-200 md:w-auto">
            <div className="group relative">
              <button className="rounded-100 bg-background-default border-border-subtle font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors">
                <ArrowUpDown className="h-4 w-4" />
                {sortLabel}
              </button>

              <div className="absolute top-full right-0 z-20 hidden w-[120px] pt-50 group-hover:block">
                <div className="bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border">
                  {ARCHIVE_SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange(option.value)}
                      className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-border-subtle h-[24px] w-[1px]" />

            <div className="bg-background-default rounded-100 border-border-subtle flex shrink-0 border p-50">
              <button
                onClick={() => onViewModeChange(ARCHIVE_VIEW_MODES.GRID)}
                className={cn(
                  'rounded-75 p-100 transition-colors',
                  viewMode === ARCHIVE_VIEW_MODES.GRID
                    ? 'bg-fill-neutral-default-default text-text-strong shadow-sm'
                    : 'text-text-subtlest hover:text-text-subtle',
                )}
                title="2열 보기"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange(ARCHIVE_VIEW_MODES.LIST)}
                className={cn(
                  'rounded-75 p-100 transition-colors',
                  viewMode === ARCHIVE_VIEW_MODES.LIST
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
  );
}
