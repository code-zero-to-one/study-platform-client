'use client';

import { ArrowUpDown, Search } from 'lucide-react';
import SortDropdown from '@/components/ui/filters/sort-dropdown';
import { BaseInput } from '@/components/ui/input';
import { MENTORING_LIST_LABELS } from '@/features/mentoring/const/mentoring-list-labels';
import { sortOptions } from '@/mocks/mentoring-mock-data';
import type { MentorSortType } from '@/types/mentoring-domain';

interface MentorDirectoryFiltersProps {
  keyword: string;
  sortType: MentorSortType;
  onKeywordChange: (nextKeyword: string) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
}

export default function MentorDirectoryFilters({
  keyword,
  sortType,
  onKeywordChange,
  onSortTypeChange,
}: MentorDirectoryFiltersProps) {
  return (
    <>
      <div className="relative w-full sm:w-[320px]">
        <Search className="text-text-subtlest pointer-events-none absolute top-1/2 left-150 h-16 w-16 -translate-y-1/2" />
        <BaseInput
          value={keyword}
          onValueChange={onKeywordChange}
          placeholder={MENTORING_LIST_LABELS.searchPlaceholder}
          size="m"
          className="bg-background-default pl-[38px]"
        />
      </div>
      <SortDropdown<MentorSortType>
        value={sortType}
        options={sortOptions}
        onChange={onSortTypeChange}
        icon={<ArrowUpDown className="h-14 w-14" />}
      />
    </>
  );
}
