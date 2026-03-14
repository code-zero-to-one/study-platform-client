'use client';

import Link from 'next/link';
import Button from '@/components/common/ui/button';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { MY_MENTORING_METHOD_LABEL_MAP } from '@/features/mentoring/model/my-mentoring-display-meta';
import {
  buildMyMentoringItem,
  createMentorMap,
} from '@/features/mentoring/model/my-mentoring-view';
import { useMyMentoringDetailReviewController } from '@/features/mentoring/model/use-my-mentoring-detail-review-controller';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useMentoringSessionCancelController } from '@/features/mentoring/model/use-mentoring-session-cancel-controller';
import { useMentoringRequestDetailQuery } from '@/features/mentoring/model/use-mentoring-request-detail-query';
import MentoringSessionCancelPanel from '@/features/mentoring/ui/common/mentoring-session-cancel-panel';
import MentoringStateBoundary from '@/features/mentoring/ui/common/mentoring-state-boundary';
import MyMentoringDetailPage from '@/features/mentoring/ui/pages/my-mentoring-detail-page';
import MentoringReviewModal from '@/features/mentoring/ui/review/mentoring-review-modal';
import { useAuthReady } from '@/hooks/common/use-auth';

interface MyMentoringDetailPageClientProps {
  requestId: string;
}

function MyMentoringDetailFallback({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SurfacePanel radius="lg" className="px-300 py-500 text-center">
      <h1 className="font-designer-24b text-text-default mb-100">{title}</h1>
      <p className="font-designer-14r text-text-subtle mb-250">{description}</p>
      <Link href="/my-mentoring">
        <Button color="primary" size="large">
          나의 멘토링으로 이동
        </Button>
      </Link>
    </SurfacePanel>
  );
}

export default function MyMentoringDetailPageClient({
  requestId,
}: MyMentoringDetailPageClientProps) {
  const { isHydrated: isAuthHydrated, memberId } = useAuthReady();
  const mentorDirectoryQuery = useMentorDirectoryListQuery({
    page: 0,
    size: 100,
  });
  const requestDetailQuery = useMentoringRequestDetailQuery(
    requestId,
    isAuthHydrated && Boolean(memberId),
  );

  const mentorMap = createMentorMap(mentorDirectoryQuery.data?.mentors ?? []);
  const detailData = requestDetailQuery.data;
  const mentoring =
    detailData && detailData.request.menteeMemberId === memberId
      ? buildMyMentoringItem({
          request: detailData.request,
          session: detailData.session,
          mentorMap,
        })
      : undefined;
  const canCancelReservation =
    detailData?.request.method !== 'note' &&
    detailData?.session?.status === 'SCHEDULED' &&
    mentoring?.status === 'CONFIRMED';
  const cancelController = useMentoringSessionCancelController({
    actor: 'mentee',
    mentorId: detailData?.request.mentorId,
    requestId,
    sessionId: canCancelReservation ? detailData?.session?.id : undefined,
  });
  const reservationCancelSlot =
    canCancelReservation && cancelController.viewModel.canCancel ? (
      <MentoringSessionCancelPanel
        title={cancelController.viewModel.title}
        description={cancelController.viewModel.description}
        textareaLabel={cancelController.viewModel.textareaLabel}
        textareaPlaceholder={cancelController.viewModel.textareaPlaceholder}
        triggerLabel={cancelController.viewModel.triggerLabel}
        confirmLabel={cancelController.viewModel.confirmLabel}
        isOpen={cancelController.state.isCancelFormOpen}
        isSubmitting={cancelController.viewModel.isSubmitting}
        cancelReason={cancelController.state.cancelReason}
        onOpen={cancelController.actions.openCancelForm}
        onClose={cancelController.actions.closeCancelForm}
        onReasonChange={cancelController.actions.onCancelReasonChange}
        onConfirm={cancelController.actions.onConfirmCancel}
      />
    ) : null;
  const reviewController = useMyMentoringDetailReviewController({
    request: detailData?.request,
    review: detailData?.review,
    reviewEligibility: detailData?.reviewEligibility,
  });

  return (
    <MentoringStateBoundary
      state={
        !isAuthHydrated ||
        mentorDirectoryQuery.isLoading ||
        (memberId ? requestDetailQuery.isLoading : false)
          ? 'loading'
          : memberId
            ? mentorDirectoryQuery.isError || requestDetailQuery.isError
              ? 'error'
              : 'ready'
            : 'forbidden'
      }
      ready={
        mentoring ? (
          <>
            <MyMentoringDetailPage
              mentoring={mentoring}
              reservationCancelSlot={reservationCancelSlot}
              review={detailData?.review}
              reviewEligibility={detailData?.reviewEligibility}
              onWriteReview={reviewController.actions.open}
              onEditReview={reviewController.actions.open}
            />
            <MentoringReviewModal
              open={reviewController.state.isOpen}
              mentorName={mentoring.mentorName}
              methodLabel={MY_MENTORING_METHOD_LABEL_MAP[mentoring.method]}
              hasExistingReview={Boolean(detailData?.review)}
              isSubmitting={reviewController.viewModel.isSubmitting}
              isSubmitDisabled={reviewController.viewModel.isSubmitDisabled}
              minimumLength={reviewController.viewModel.minimumLength}
              rating={reviewController.state.draft.rating}
              recommendation={reviewController.state.draft.recommendation}
              content={reviewController.state.draft.content}
              formError={reviewController.state.formError}
              onOpenChange={reviewController.actions.onOpenChange}
              onRatingChange={reviewController.actions.onRatingChange}
              onRecommendationChange={
                reviewController.actions.onRecommendationChange
              }
              onContentChange={reviewController.actions.onContentChange}
              onSubmit={reviewController.actions.onSubmit}
            />
          </>
        ) : (
          <MyMentoringDetailFallback
            title="멘토링 정보를 찾을 수 없습니다"
            description="선택한 멘토링이 없거나 이미 종료되어 목록에서 내려갔습니다."
          />
        )
      }
      forbidden={
        <MyMentoringDetailFallback
          title="멘토링 정보를 불러올 수 없습니다"
          description="로그인 상태를 확인한 뒤 다시 시도해주세요."
        />
      }
    />
  );
}
