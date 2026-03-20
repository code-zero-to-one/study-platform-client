import { useEffect, useState } from 'react';

import {
  useDismissStudyReviewModalMutation,
  usePartnerStudyReviewQuery,
  useStudyReviewModalStateQuery,
} from '@/hooks/queries/use-review-query';
import { useToastStore } from '@/stores/use-toast-store';

const REVIEW_REMINDER_HIDE_UNTIL_KEY = 'reviewReminderHideUntil';
const ONE_HOUR_MS = 1000 * 60 * 60;

interface ReviewReminderDismissOptions {
  hideForOneHour: boolean;
  hideForever: boolean;
}

export const useReviewReminder = (memberId?: number) => {
  const { data: modalState, isFetching } = useStudyReviewModalStateQuery();
  const { mutateAsync: dismissStudyReviewModal } =
    useDismissStudyReviewModalMutation();
  const showToast = useToastStore((state) => state.showToast);
  const [showReviewReminder, setShowReviewReminder] = useState(false);
  const targetStudySpaceId = modalState?.targetStudySpaceId;

  const shouldValidateTargetStudy = Boolean(
    modalState?.shouldShowModal && targetStudySpaceId,
  );
  const { data: targetStudy, isFetching: isTargetStudyFetching } =
    usePartnerStudyReviewQuery({
      enabled: shouldValidateTargetStudy,
      targetStudySpaceId,
    });

  const hideUntilStorageKey =
    memberId && targetStudySpaceId
      ? `${REVIEW_REMINDER_HIDE_UNTIL_KEY}:${memberId}:${targetStudySpaceId}`
      : memberId
        ? `${REVIEW_REMINDER_HIDE_UNTIL_KEY}:${memberId}`
        : REVIEW_REMINDER_HIDE_UNTIL_KEY;
  const hasValidTargetStudy = Boolean(
    targetStudySpaceId &&
      targetStudy?.studySpaceId === targetStudySpaceId &&
      (targetStudy.targetMembers?.some((member) => member.memberId > 0) ??
        false),
  );

  const applyDismissPreference = async ({
    hideForOneHour,
    hideForever,
  }: ReviewReminderDismissOptions) => {
    if (hideForOneHour) {
      localStorage.setItem(
        hideUntilStorageKey,
        String(Date.now() + ONE_HOUR_MS),
      );
    }

    if (hideForever && modalState?.targetStudySpaceId) {
      try {
        await dismissStudyReviewModal({
          targetStudySpaceId: modalState.targetStudySpaceId,
        });
      } catch {
        showToast(
          '다시 보지 않기 저장에 실패했습니다. 다시 시도해주세요.',
          'error',
        );
      }
    }
  };

  useEffect(() => {
    if (!modalState || isFetching) return;

    if (!modalState.shouldShowModal || !targetStudySpaceId) {
      setShowReviewReminder(false);

      return;
    }

    if (isTargetStudyFetching) return;

    if (!hasValidTargetStudy) {
      setShowReviewReminder(false);

      return;
    }

    const hideUntil = Number(localStorage.getItem(hideUntilStorageKey));
    if (Number.isFinite(hideUntil) && hideUntil > Date.now()) return;

    localStorage.removeItem(hideUntilStorageKey);
    setShowReviewReminder(true);
  }, [
    modalState,
    isFetching,
    targetStudySpaceId,
    isTargetStudyFetching,
    hasValidTargetStudy,
    hideUntilStorageKey,
  ]);

  return {
    showReviewReminder,
    setShowReviewReminder,
    applyDismissPreference,
    targetStudySpaceId,
  };
};
