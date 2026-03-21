'use client';

import { ArrowUpDown, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  GetGroupStudiesSortEnum,
  type GetGroupStudiesClassificationEnum,
} from '@/api/openapi/api/group-study-management-api';
import Button from '@/components/common/ui/button';
import SortDropdown from '@/components/common/ui/filters/sort-dropdown';
import StudyFilter, {
  type StudyFilterValues,
} from '@/components/filtering/study-filter';
import StudySearch from '@/components/filtering/study-search';

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

const SORT_OPTIONS = [
  { value: GetGroupStudiesSortEnum.Latest, label: '최신순' },
  { value: GetGroupStudiesSortEnum.Deadline, label: '마감임박순' },
  { value: GetGroupStudiesSortEnum.ViewCount, label: '조회수순' },
] as const;

interface StudyListToolbarProps {
  title: string;
  classification: GetGroupStudiesClassificationEnum;
  isAuthReady: boolean;
  controls: {
    searchQuery: string;
    filterValues: StudyFilterValues;
    sort: GetGroupStudiesSortEnum;
    onSearchChange: (query: string) => void;
    onFilterChange: (values: StudyFilterValues) => void;
    onSortChange: (value: GetGroupStudiesSortEnum) => void;
  };
}

export default function StudyListToolbar({
  title,
  classification,
  isAuthReady,
  controls,
}: StudyListToolbarProps) {
  return (
    <>
      <div className="mb-400 flex flex-col items-start gap-200 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-designer-24b text-text-default">{title}</h1>
        <GroupStudyFormModal
          mode="create"
          classification={classification}
          trigger={
            <Button
              color="primary"
              size="small"
              icon={<Plus className="h-200 w-200" />}
              iconPosition="left"
              disabled={!isAuthReady}
            >
              스터디 개설하기
            </Button>
          }
        />
      </div>

      <div className="mb-400 flex flex-col gap-200 sm:flex-row sm:items-center sm:justify-between">
        <StudyFilter
          values={controls.filterValues}
          onChange={controls.onFilterChange}
        />
        <div className="flex items-center gap-200">
          <StudySearch
            value={controls.searchQuery}
            onChange={controls.onSearchChange}
          />
          <SortDropdown
            value={controls.sort}
            options={SORT_OPTIONS}
            onChange={controls.onSortChange}
            icon={<ArrowUpDown className="h-3 w-3" />}
          />
        </div>
      </div>
    </>
  );
}
