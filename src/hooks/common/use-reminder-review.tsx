import { useEffect, useState } from 'react';

import { useShouldReviewPartnerQuery } from '@/hooks/queries/use-review-query';

const LAST_REVIEW_MODAL_SHOWN_KEY = 'lastReviewModalShown';

export const useReviewReminder = (memberId?: number) => {
  const { data: shouldReview, isFetching } = useShouldReviewPartnerQuery();
  const [showReviewReminder, setShowReviewReminder] = useState(false);
  const storageKey = memberId
    ? `${LAST_REVIEW_MODAL_SHOWN_KEY}:${memberId}`
    : LAST_REVIEW_MODAL_SHOWN_KEY;

  useEffect(() => {
    // 리뷰 작성 대상이 아닌 경우
    if (!shouldReview || isFetching) return;

    const now = Date.now();
    const lastShown = localStorage.getItem(storageKey);

    const diff = now - Number(lastShown);
    const THIRTY_MIN = 1000 * 60 * 30; // 30분

    if (!lastShown || diff >= THIRTY_MIN) {
      setShowReviewReminder(true);

      localStorage.setItem(storageKey, String(now));
    }
  }, [shouldReview, isFetching, storageKey]);

  return {
    showReviewReminder,
    setShowReviewReminder,
  };
};
