'use client';

import dynamic from 'next/dynamic';
import PageContainer from '@/components/common/layout/page-container';
import StudyListToolbar from '@/components/group-study/pages/study-list-toolbar';
import PremiumStudyList from '@/components/group-study/premium/premium-study-list';
import PremiumStudyPagination from '@/components/group-study/premium/premium-study-pagination';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useGroupStudyReviewReminder } from '@/hooks/common/use-group-study-review-reminder';
import { useStudyListFilter } from '@/hooks/common/use-study-list-filter';
import MyParticipatingStudiesSection from '@/components/group-study/section/my-participating-studies-section';

const GroupStudyReviewModal = dynamic(
  () => import('@/components/common/modals/group-study-review-modal'),
  { ssr: false },
);

const StudyCompletionModal = dynamic(
  () => import('@/components/common/modals/study-completion-modal'),
  { ssr: false },
);

// Carousel이 클라이언트 전용이므로 dynamic import로 로드
const Banner = dynamic(() => import('@/components/home/banner'), {
  ssr: false,
});

export default function PremiumStudyListPage() {
  const { isAuthReady } = useAuthReady();

  const {
    showReviewModal,
    setShowReviewModal,
    showCompletionModal,
    setShowCompletionModal,
    reviewStudyId,
    reviewDetailInfo,
    reviewBasicInfo,
  } = useGroupStudyReviewReminder({ studyType: 'MENTOR_STUDY' });

  const {
    searchQuery,
    filterValues,
    currentPage,
    totalPages,
    displayStudies,
    isLoading,
    sort,
    handleFilterChange,
    handlePageChange,
    handleSearch,
    handleSortChange,
  } = useStudyListFilter({
    classification: 'MENTOR_STUDY',
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
    <div className="mx-auto w-full max-w-[1280px] px-400 py-600">
      {/* 미작성 후기 모달 — 완료된 멘토스터디 후기를 아직 작성하지 않은 경우 자동으로 열림 */}
      {reviewStudyId && reviewDetailInfo && reviewBasicInfo && (
        <GroupStudyReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          groupStudyId={reviewStudyId}
          detailInfo={reviewDetailInfo}
          basicInfo={reviewBasicInfo}
          onSubmitSuccess={() =>
            setTimeout(() => setShowCompletionModal(true), 300)
          }
        />
      )}
      <StudyCompletionModal
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
      />

      {/* 배너 */}
      <div className="mb-600">
        <Banner />
      </div>

      {/* 내가 참여중인 스터디 섹션 */}
      <MyParticipatingStudiesSection classification="PREMIUM_STUDY" />

      <StudyListToolbar
        title="멘토스터디 둘러보기"
        classification="PREMIUM_STUDY"
        isAuthReady={isAuthReady}
        controls={{
          searchQuery,
          filterValues,
          sort,
          onSearchChange: handleSearch,
          onFilterChange: handleFilterChange,
          onSortChange: handleSortChange,
        }}
      />

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
