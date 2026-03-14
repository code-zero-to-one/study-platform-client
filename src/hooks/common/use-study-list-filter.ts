'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  GetGroupStudiesTypeEnum,
  GetGroupStudiesTargetRolesEnum,
  GetGroupStudiesMethodEnum,
  GetGroupStudiesClassificationEnum,
} from '@/api/openapi/api/group-study-management-api';
import type { StudyFilterValues } from '@/components/filtering/study-filter';
import { useGetStudies } from '@/hooks/queries/study-query';

const PAGE_SIZE = 15;

interface UseStudyListFilterParams {
  classification: GetGroupStudiesClassificationEnum;
}

export function useStudyListFilter({
  classification,
}: UseStudyListFilterParams) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<StudyFilterValues>({
    type: [],
    targetRoles: [],
    method: [],
    experienceLevels: [],
    recruiting: true,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const isClientFiltered =
    !!searchQuery || filterValues.experienceLevels.length > 0;

  const { data, isLoading } = useGetStudies({
    classification,
    page: isClientFiltered ? 1 : currentPage,
    pageSize: isClientFiltered ? 10000 : PAGE_SIZE,
    type:
      filterValues.type.length > 0
        ? (filterValues.type as GetGroupStudiesTypeEnum[])
        : undefined,
    targetRoles:
      filterValues.targetRoles.length > 0
        ? (filterValues.targetRoles as GetGroupStudiesTargetRolesEnum[])
        : undefined,
    method:
      filterValues.method.length > 0
        ? (filterValues.method as GetGroupStudiesMethodEnum[])
        : undefined,
    recruiting: filterValues.recruiting ? true : undefined,
  });

  const allStudies = useMemo(() => data?.content ?? [], [data?.content]);

  const handleFilterChange = useCallback((values: StudyFilterValues) => {
    setFilterValues(values);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const filteredStudies = useMemo(() => {
    let result = allStudies;

    if (filterValues.experienceLevels.length > 0) {
      result = result.filter((study) =>
        study.basicInfo?.experienceLevels?.some((level) =>
          filterValues.experienceLevels.includes(level),
        ),
      );
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((study) =>
        study.simpleDetailInfo?.title?.toLowerCase().includes(lowerQuery),
      );
    }

    return result;
  }, [allStudies, filterValues.experienceLevels, searchQuery]);

  const totalPages = isClientFiltered
    ? Math.ceil(filteredStudies.length / PAGE_SIZE) || 1
    : (data?.totalPages ?? 1);

  const displayStudies = useMemo(() => {
    if (!isClientFiltered) return filteredStudies;

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredStudies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredStudies, isClientFiltered, currentPage]);

  return {
    searchQuery,
    filterValues,
    currentPage,
    totalPages,
    displayStudies,
    isLoading,
    handleFilterChange,
    handlePageChange,
    handleSearch,
  };
}
