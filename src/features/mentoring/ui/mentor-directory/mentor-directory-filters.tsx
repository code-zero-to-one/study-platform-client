'use client';

import { ArrowUpDown } from 'lucide-react';
import SingleDropdown from '@/components/ui/dropdown/single';
import SortDropdown from '@/components/ui/filters/sort-dropdown';
import { MENTORING_LIST_LABELS } from '@/features/mentoring/const/mentoring-list-labels';
import { sortOptions } from '@/features/mentoring/model/mentor-profile-utils';
import type { MentorSortType } from '@/types/mentoring/domain';

interface MentorDirectoryFiltersProps {
  keyword: string;
  keywordOptions: string[];
  sortType: MentorSortType;
  onKeywordChange: (nextKeyword: string) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
}

export default function MentorDirectoryFilters({
  keyword,
  keywordOptions,
  sortType,
  onKeywordChange,
  onSortTypeChange,
}: MentorDirectoryFiltersProps) {
  const options = [
    {
      value: '',
      label: '전체 기술',
    },
    ...keywordOptions.map((option) => ({
      value: option,
      label: `#${option}`,
    })),
  ];

  return (
    <>
      <div className="w-full sm:w-[320px]">
        <SingleDropdown
          options={options}
          value={keyword}
          onChange={(nextKeyword) => onKeywordChange(nextKeyword ?? '')}
          placeholder={MENTORING_LIST_LABELS.searchPlaceholder}
          className="rounded-100 bg-background-default"
          size="m"
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
