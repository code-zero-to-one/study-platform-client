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
    recruiting: true,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useGetStudies({
    classification,
    page: searchQuery ? 1 : currentPage,
    pageSize: searchQuery ? 10000 : PAGE_SIZE,
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
  }, []);

  // 클라이언트 사이드 검색 필터링 (스터디명만 검색)
  const filteredStudies = useMemo(() => {
    if (!searchQuery) return allStudies;

    const lowerQuery = searchQuery.toLowerCase();

    return allStudies.filter((study) =>
      study.simpleDetailInfo?.title?.toLowerCase().includes(lowerQuery),
    );
  }, [allStudies, searchQuery]);

  const totalPages = searchQuery
    ? Math.ceil(filteredStudies.length / PAGE_SIZE) || 1
    : (data?.totalPages ?? 1);

  const displayStudies = useMemo(() => {
    if (!searchQuery) return filteredStudies;

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredStudies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredStudies, searchQuery, currentPage]);

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
