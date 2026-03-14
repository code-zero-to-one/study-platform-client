'use client';

import { Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/common/layout/page-container';
import Button from '@/components/common/ui/button';
import StudyFilter from '@/components/filtering/study-filter';
import StudySearch from '@/components/filtering/study-search';
import PremiumStudyList from '@/components/premium/premium-study-list';
import PremiumStudyPagination from '@/components/premium/premium-study-pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useStudyListFilter } from '@/hooks/common/use-study-list-filter';
import MyParticipatingStudiesSection from '../section/my-participating-studies-section';

const GroupStudyFormModal = dynamic(
  () => import('@/components/common/modals/group-study-form-modal'),
  { ssr: false },
);

// Carousel이 클라이언트 전용이므로 dynamic import로 로드
const Banner = dynamic(() => import('@/components/home/banner'), {
  ssr: false,
});

export default function PremiumStudyListPage() {
  const { isAuthReady } = useAuthReady();

  const {
    searchQuery,
    filterValues,
    currentPage,
    totalPages,
    displayStudies,
    isLoading,
    handleFilterChange,
    handlePageChange,
    handleSearch,
  } = useStudyListFilter({
    classification: 'PREMIUM_STUDY',
  });

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
              disabled={!isAuthReady}
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
      <PremiumStudyList studies={displayStudies} />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <PremiumStudyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
