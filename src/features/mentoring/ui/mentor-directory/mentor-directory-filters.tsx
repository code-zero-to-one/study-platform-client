'use client';

import { ArrowUpDown } from 'lucide-react';
import MultiDropdown from '@/components/common/ui/dropdown/multi';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import SortDropdown from '@/components/common/ui/filters/sort-dropdown';
import { MENTORING_LIST_LABELS } from '@/features/mentoring/const/mentoring-list-labels';
import { sortOptions } from '@/features/mentoring/model/mentor-profile-utils';
import type { MentorSortType } from '@/types/mentoring/domain';

interface MentorDirectoryFiltersProps {
  keyword: string;
  keywordOptions: string[];
  careerCodes: string[];
  careerOptions: Array<{
    code: string;
    label: string;
  }>;
  sortType: MentorSortType;
  onKeywordChange: (nextKeyword: string) => void;
  onCareerCodesChange: (nextCareerCodes: string[]) => void;
  onSortTypeChange: (nextSortType: MentorSortType) => void;
}

export default function MentorDirectoryFilters({
  keyword,
  keywordOptions,
  careerCodes,
  careerOptions,
  sortType,
  onKeywordChange,
  onCareerCodesChange,
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
      <div className="w-full sm:w-[320px]">
        <MultiDropdown
          options={careerOptions.map((careerOption) => ({
            value: careerOption.code,
            label: careerOption.label,
          }))}
          value={careerCodes}
          onChange={onCareerCodesChange}
          placeholder="경력 선택"
          className="rounded-100 bg-background-default"
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
