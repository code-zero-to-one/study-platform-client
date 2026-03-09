import { useEffect, useState } from 'react';
import {
  useDismissStudyReviewModalMutation,
  useStudyReviewModalStateQuery,
} from '@/entities/review/model/use-review-query';

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
  const [showReviewReminder, setShowReviewReminder] = useState(false);
  const hideUntilStorageKey =
    memberId && modalState?.targetStudySpaceId
      ? `${REVIEW_REMINDER_HIDE_UNTIL_KEY}:${memberId}:${modalState.targetStudySpaceId}`
      : memberId
        ? `${REVIEW_REMINDER_HIDE_UNTIL_KEY}:${memberId}`
        : REVIEW_REMINDER_HIDE_UNTIL_KEY;

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
        alert('다시 보지 않기 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  useEffect(() => {
    if (!modalState || isFetching) return;
    if (!modalState.shouldShowModal) return;

    const hideUntil = Number(localStorage.getItem(hideUntilStorageKey));
    if (Number.isFinite(hideUntil) && hideUntil > Date.now()) return;

    if (Number.isFinite(hideUntil) && hideUntil <= Date.now()) {
      localStorage.removeItem(hideUntilStorageKey);
    }

    setShowReviewReminder(true);
  }, [modalState, isFetching, hideUntilStorageKey]);

  return {
    showReviewReminder,
    setShowReviewReminder,
    applyDismissPreference,
    targetStudySpaceId: modalState?.targetStudySpaceId ?? undefined,
  };
};
