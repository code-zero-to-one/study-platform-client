'use client';

import { ArrowUpDown, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { GroupStudyListItemDto } from '@/api/openapi';
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
import PremiumStudyList from '@/components/premium/premium-study-list';
import PremiumStudyPagination from '@/components/premium/premium-study-pagination';
import Button from '@/components/ui/button';
import GroupStudyFormModal from '@/features/study/group/ui/group-study-form-modal';
import { useAuth } from '@/hooks/common/use-auth';
import { useGetStudies } from '@/hooks/queries/study-query';
import { MOCK_PREMIUM_STUDIES } from '@/mocks/premium-study-mock-data';
import MyParticipatingStudiesSection from '../section/my-participating-studies-section';

// Carousel이 클라이언트 전용이므로 dynamic import로 로드
const Banner = dynamic(() => import('@/widgets/home/banner'), {
  ssr: false,
});

/** 목 데이터용 확장 타입 (_prototype 필드 포함) */
type GroupStudyWithPrototype = GroupStudyListItemDto & {
  _prototype?: {
    status: string;
    endDate?: string;
    viewCount?: number;
  };
};

const PAGE_SIZE = 15;

export default function PremiumStudyListPage() {
  const { isAuthenticated } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  // 로컬 검색 상태
  const [searchQuery, setSearchQuery] = useState('');

  // 프로토타입 모드 (목 데이터 사용)
  const [usePrototype] = useState(true);

  // URL에서 필터 값 읽기
  const filterValues = useMemo<StudyFilterValues>(() => {
    const type = searchParams.get('type')?.split(',').filter(Boolean) ?? [];
    const targetRoles =
      searchParams.get('targetRoles')?.split(',').filter(Boolean) ?? [];
    const method = searchParams.get('method')?.split(',').filter(Boolean) ?? [];
    const experienceLevels =
      searchParams.get('experienceLevels')?.split(',').filter(Boolean) ?? [];
    const statusParam = searchParams.get('status');
    const status = statusParam?.split(',').filter(Boolean) ?? ['RECRUITING'];

    return { type, targetRoles, method, experienceLevels, status };
  }, [searchParams]);

  const currentPage = Number(searchParams.get('page')) || 1;

  // 검색어가 있으면 전체 데이터를 가져오고, 없으면 페이지네이션된 데이터를 가져옴
  const { data, isLoading } = useGetStudies({
    classification: 'PREMIUM_STUDY',
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
    // status로 필터링
    recruiting: filterValues.status.includes('RECRUITING') ? true : undefined,
  });

  // 프로토타입 모드에서는 목 데이터 사용
  const allStudies = useMemo(
    () => (usePrototype ? MOCK_PREMIUM_STUDIES : (data?.content ?? [])),
    [usePrototype, data?.content],
  );

  // 프로토타입 모드에서 진행 상태 필터링
  const statusFilteredStudies = useMemo(() => {
    if (!usePrototype) return allStudies;

    // status 필터가 없거나 RECRUITING만 있으면 모집 중 + 마감 임박만 표시
    if (
      filterValues.status.length === 0 ||
      (filterValues.status.length === 1 &&
        filterValues.status[0] === 'RECRUITING')
    ) {
      return allStudies.filter(
        (study) =>
          (study as GroupStudyWithPrototype)._prototype?.status ===
            'RECRUITING' ||
          (study as GroupStudyWithPrototype)._prototype?.status ===
            'DEADLINE_IMMINENT',
      );
    }

    // 선택된 status에 맞는 스터디만 필터링
    return allStudies.filter((study) => {
      const studyProto = (study as GroupStudyWithPrototype)._prototype;
      if (!studyProto?.status) return false;

      // RECRUITING 선택 시 마감 임박도 포함
      if (filterValues.status.includes('RECRUITING')) {
        if (
          studyProto.status === 'RECRUITING' ||
          studyProto.status === 'DEADLINE_IMMINENT'
        ) {
          return true;
        }
      }

      // 다른 상태들 체크
      return filterValues.status.includes(studyProto.status);
    });
  }, [usePrototype, allStudies, filterValues.status]);

  // URL 파라미터 업데이트 함수
  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
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
        experienceLevels:
          values.experienceLevels.length > 0
            ? values.experienceLevels.join(',')
            : undefined,
        status:
          values.status.length === 1 && values.status[0] === 'RECRUITING'
            ? undefined
            : values.status.length > 0
              ? values.status.join(',')
              : undefined,
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
    const baseStudies = usePrototype ? statusFilteredStudies : allStudies;
    if (!searchQuery) return baseStudies;

    const lowerQuery = searchQuery.toLowerCase();

    return baseStudies.filter((study) =>
      study.simpleDetailInfo?.title?.toLowerCase().includes(lowerQuery),
    );
  }, [usePrototype, statusFilteredStudies, allStudies, searchQuery]);

  // 정렬 적용
  const sortedStudies = useMemo(() => {
    const sortType = searchParams.get('sort') || 'latest';
    const studies = [...filteredStudies];

    switch (sortType) {
      case 'deadline':
        // 마감임박순: endDate가 가까운 순 (모집 중인 것만)
        return studies.sort((a, b) => {
          const aP = (a as GroupStudyWithPrototype)._prototype;
          const bP = (b as GroupStudyWithPrototype)._prototype;
          const aStatus = aP?.status;
          const bStatus = bP?.status;
          // 모집 중이 아니면 뒤로
          if (aStatus !== 'RECRUITING' && aStatus !== 'DEADLINE_IMMINENT')
            return 1;
          if (bStatus !== 'RECRUITING' && bStatus !== 'DEADLINE_IMMINENT')
            return -1;
          const aEnd = aP?.endDate ? new Date(aP.endDate).getTime() : Infinity;
          const bEnd = bP?.endDate ? new Date(bP.endDate).getTime() : Infinity;

          return aEnd - bEnd;
        });
      case 'views':
        // 조회수순: viewCount 높은 순
        return studies.sort((a, b) => {
          const aViews =
            (a as GroupStudyWithPrototype)._prototype?.viewCount || 0;
          const bViews =
            (b as GroupStudyWithPrototype)._prototype?.viewCount || 0;

          return bViews - aViews;
        });

      case 'latest':
      default:
        // 최신순: createdAt 최신 순
        return studies.sort((a, b) => {
          const aCreated = a.basicInfo?.createdAt
            ? new Date(a.basicInfo.createdAt).getTime()
            : 0;
          const bCreated = b.basicInfo?.createdAt
            ? new Date(b.basicInfo.createdAt).getTime()
            : 0;

          return bCreated - aCreated;
        });
    }
  }, [filteredStudies, searchParams]);

  // 검색어가 있을 때는 클라이언트에서 페이지네이션, 없으면 서버 페이지네이션 사용
  const totalPages =
    searchQuery || usePrototype
      ? Math.ceil(sortedStudies.length / PAGE_SIZE) || 1
      : (data?.totalPages ?? 1);

  const displayStudies = useMemo(() => {
    if (!searchQuery && !usePrototype) return sortedStudies;

    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return sortedStudies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [sortedStudies, searchQuery, usePrototype, currentPage]);

  if (isLoading && !usePrototype) {
    return (
      <PageContainer className="py-600">
        <div className="flex h-[400px] items-center justify-center">
          <span className="text-text-subtle">로딩 중...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <div className="mx-auto w-[1280px] px-400 py-600">
      {/* 배너 */}
      <div className="mb-600">
        <Banner />
      </div>

      {/* 내가 참여중인 스터디 섹션 */}
      <MyParticipatingStudiesSection classification="PREMIUM_STUDY" />

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
        <StudyFilter
          values={filterValues}
          onChange={handleFilterChange}
          studyCategory="PREMIUM"
        />
        <div className="flex items-center gap-200">
          <StudySearch value={searchQuery} onChange={handleSearch} />
          {/* 정렬 드롭다운 */}
          <div className="group relative">
            <button
              type="button"
              className="rounded-100 bg-background-default border-border-default font-designer-14m text-text-default hover:bg-fill-neutral-subtle-hover flex h-500 items-center gap-50 border px-200 py-150 whitespace-nowrap transition-colors"
            >
              <ArrowUpDown className="h-4 w-4" />
              {searchParams.get('sort') === 'deadline'
                ? '마감임박순'
                : searchParams.get('sort') === 'views'
                  ? '조회수순'
                  : '최신순'}
            </button>
            <div className="absolute top-full right-0 z-20 hidden w-[120px] pt-50 group-hover:block">
              <div className="bg-background-default border-border-subtle rounded-100 shadow-2 overflow-hidden border">
                <button
                  type="button"
                  onClick={() =>
                    updateSearchParams({ sort: 'latest', page: '1' })
                  }
                  className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                >
                  최신순
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSearchParams({ sort: 'deadline', page: '1' })
                  }
                  className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                >
                  마감임박순
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSearchParams({ sort: 'views', page: '1' })
                  }
                  className="hover:bg-fill-neutral-subtle-hover font-designer-14r w-full px-200 py-150 text-left transition-colors"
                >
                  조회수순
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 스터디 카드 그리드 */}
      <PremiumStudyList studies={displayStudies} />

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
