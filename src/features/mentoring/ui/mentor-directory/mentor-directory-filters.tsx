'use client';

import { ArrowUpDown } from 'lucide-react';
import MultiDropdown from '@/components/ui/dropdown/multi';
import SortDropdown from '@/components/ui/filters/sort-dropdown';
import { MENTORING_LIST_LABELS } from '@/features/mentoring/const/mentoring-list-labels';
import { sortOptions } from '@/mocks/mentoring-mock-data';
import type { MentorSortType } from '@/types/mentoring/domain';

interface MentorDirectoryFiltersProps {
  keywords: string[];
  keywordOptions: string[];
  sortType: MentorSortType;
  onKeywordChange: (nextKeywords: string[]) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
}

export default function MentorDirectoryFilters({
  keywords,
  keywordOptions,
  sortType,
  onKeywordChange,
  onSortTypeChange,
}: MentorDirectoryFiltersProps) {
  const options = keywordOptions.map((option) => ({
    value: option,
    label: `#${option}`,
  }));

  return (
    <>
      <div className="w-full sm:w-[320px]">
        <MultiDropdown
          options={options}
          value={keywords}
          onChange={onKeywordChange}
          placeholder={MENTORING_LIST_LABELS.searchPlaceholder}
          className="min-h-[40px] rounded-100 bg-background-default"
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
