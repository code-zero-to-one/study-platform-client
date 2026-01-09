'use client';

import { Plus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type {
  GetGroupStudiesTypeEnum,
  GetGroupStudiesTargetRolesEnum,
  GetGroupStudiesMethodEnum,
} from '@/api/openapi/api/group-study-management-api';
import StudyFilter, {
  StudyFilterValues,
} from '@/components/filtering/study-filter';
import StudySearch from '@/components/filtering/study-search';
import PageContainer from '@/components/layout/page-container';
import Button from '@/components/ui/button';
import { useAuth } from '@/hooks/common/use-auth';
import { useGetStudies } from '@/hooks/queries/study-query';
import GroupStudyFormModal from '../../features/study/group/ui/group-study-form-modal';
import GroupStudyPagination from '../../features/study/group/ui/group-study-pagination';
import GroupStudyList from '../lists/group-study-list';

const PAGE_SIZE = 15;

export default function GroupStudyListPage() {
  const { isAuthenticated } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  // 로컬 검색 상태
  const [searchQuery, setSearchQuery] = useState('');

  // URL에서 필터 값 읽기
  const filterValues = useMemo<StudyFilterValues>(() => {
    const type = searchParams.get('type')?.split(',').filter(Boolean) ?? [];
    const targetRoles =
      searchParams.get('targetRoles')?.split(',').filter(Boolean) ?? [];
    const method = searchParams.get('method')?.split(',').filter(Boolean) ?? [];
    const inProgress = searchParams.get('inProgress') === 'true';

    return { type, targetRoles, method, inProgress };
  }, [searchParams]);

  const currentPage = Number(searchParams.get('page')) || 1;

  // 검색어가 있으면 전체 데이터를 가져오고, 없으면 페이지네이션된 데이터를 가져옴
  const { data, isLoading } = useGetStudies({
    classification: 'GROUP_STUDY',
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
    inProgress: filterValues.inProgress || undefined,
  });

  const allStudies = useMemo(() => data?.content ?? [], [data?.content]);

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
      router.push(queryString ? `?${queryString}` : '/group-study');
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

  // 검색 핸들러 (로컬 상태만 업데이트)
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

  // 검색어가 있을 때는 클라이언트에서 페이지네이션, 없으면 서버 페이지네이션 사용
  const totalPages = searchQuery
    ? Math.ceil(filteredStudies.length / PAGE_SIZE) || 1
    : (data?.totalPages ?? 1);

  const displayStudies = useMemo(() => {
    if (!searchQuery) return filteredStudies;

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredStudies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredStudies, searchQuery, currentPage]);

  if (isLoading) {
    return (
      <PageContainer className="py-600">
        <div className="flex h-[400px] items-center justify-center">
          <span className="text-text-subtle">로딩 중...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-600">
      {/* 헤더 */}
      <div className="mb-400 flex items-center justify-between">
        <h1 className="font-designer-24b text-text-default">
          그룹스터디 둘러보기
        </h1>
        <GroupStudyFormModal
          mode="create"
          classification="GROUP_STUDY"
          trigger={
            <Button
              color="primary"
              size="small"
              icon={<Plus className="h-200 w-200" />}
              iconPosition="left"
              disabled={!isAuthenticated}
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
      <GroupStudyList studies={displayStudies} />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <GroupStudyPagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </PageContainer>
  );
}
