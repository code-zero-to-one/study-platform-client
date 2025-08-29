import { useEffect, useState } from 'react';

import { getKoreaDate } from '@/shared/lib/time';
import { useShouldReviewPartnerQuery } from '../model/use-review-query';

export const useReviewReminder = () => {
  const { data: shouldReview, isFetching } = useShouldReviewPartnerQuery();
  const [showReviewReminder, setShowReviewReminder] = useState(false);

  useEffect(() => {
    // 이미 리뷰를 달았을 경우
    if (!shouldReview || isFetching) return;

    const now = getKoreaDate();
    const dayOfWeek = now.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 일요일(0), 토요일(6)

    // 평일인 경우
    if (!isWeekend) return;

    const lastShown = localStorage.getItem('lastReviewModalShown');

    const diff = now.getTime() - Number(lastShown);
    const THIRTY_MIN = 1000 * 60 * 30; // 30분

    if (!lastShown || diff >= THIRTY_MIN) {
      setShowReviewReminder(true);

      localStorage.setItem('lastReviewModalShown', String(now.getTime()));
    }
  }, [shouldReview, isFetching]);

  return {
    showReviewReminder,
    setShowReviewReminder,
  };
};
