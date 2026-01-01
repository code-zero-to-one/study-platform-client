'use client';

import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type {
  GetGroupStudiesTypeEnum,
  GetGroupStudiesTargetRolesEnum,
  GetGroupStudiesMethodEnum,
} from '@/api/openapi/api/group-study-management-api';
import PremiumStudyList from '@/components/premium/premium-study-list';
import PremiumStudyPagination from '@/components/premium/premium-study-pagination';
import StudyFilter, {
  StudyFilterValues,
} from '@/components/study/study-filter';
import StudySearch from '@/components/study/study-search';
import Button from '@/components/ui/button';
import GroupStudyFormModal from '@/features/study/group/ui/group-study-form-modal';
import { useGetStudies } from '@/hooks/queries/study-query';

export default function PremiumStudyListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 필터 값 읽기
  const filterValues = useMemo<StudyFilterValues>(() => {
    const type = searchParams.get('type')?.split(',').filter(Boolean) ?? [];
    const targetRoles =
      searchParams.get('targetRoles')?.split(',').filter(Boolean) ?? [];
    const method = searchParams.get('method')?.split(',').filter(Boolean) ?? [];
    const inProgress = searchParams.get('inProgress') === 'true';

    return { type, targetRoles, method, inProgress };
  }, [searchParams]);

  // URL에서 검색어 읽기
  const searchQuery = searchParams.get('search') ?? '';
  const currentPage = Number(searchParams.get('page')) || 1;

  // API 호출
  const { data, isLoading } = useGetStudies({
    classification: 'PREMIUM_STUDY',
    page: currentPage,
    pageSize: 9,
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
    inProgress: filterValues.inProgress || undefined,
  });

  const studies = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  // URL 파라미터 업데이트 함수
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === 'false') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // 필터나 검색이 변경되면 페이지를 1로 리셋
      if (!updates.page) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.push(queryString ? `?${queryString}` : '/premium-study');
    },
    [router, searchParams],
  );

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (values: StudyFilterValues) => {
      updateSearchParams({
        type: values.type.length > 0 ? values.type.join(',') : undefined,
        targetRoles:
          values.targetRoles.length > 0
            ? values.targetRoles.join(',')
            : undefined,
        method: values.method.length > 0 ? values.method.join(',') : undefined,
        inProgress: values.inProgress ? 'true' : undefined,
      });
    },
    [updateSearchParams],
  );

  // 검색 핸들러
  const handleSearch = useCallback(
    (query: string) => {
      updateSearchParams({ search: query || undefined });
    },
    [updateSearchParams],
  );

  // 클라이언트 사이드 검색 필터링 (API에서 검색을 지원하지 않는 경우)
  const filteredStudies = useMemo(() => {
    if (!searchQuery) return studies;

    const lowerQuery = searchQuery.toLowerCase();

    return studies.filter(
      (study) =>
        study.simpleDetailInfo?.title?.toLowerCase().includes(lowerQuery) ||
        study.simpleDetailInfo?.summary?.toLowerCase().includes(lowerQuery),
    );
  }, [studies, searchQuery]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-400 py-600">
        <div className="flex h-[400px] items-center justify-center">
          <span className="text-text-subtle">로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-400 py-600">
      {/* 헤더 */}
      <div className="mb-400 flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">
          멘토스터디 둘러보기
        </h1>
        <GroupStudyFormModal
          mode="create"
          classification="PREMIUM_STUDY"
          trigger={
            <Button
              color="primary"
              size="small"
              icon={<Plus className="h-[16px] w-[16px]" />}
              iconPosition="left"
            >
              스터디 개설하기
            </Button>
          }
        />
      </div>

      {/* 필터 및 검색 */}
      <div className="mb-400 flex items-center justify-between">
        <StudyFilter values={filterValues} onChange={handleFilterChange} />
        <StudySearch value={searchQuery} onChange={handleSearch} />
      </div>

      {/* 스터디 카드 그리드 */}
      <PremiumStudyList studies={filteredStudies} />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <PremiumStudyPagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
