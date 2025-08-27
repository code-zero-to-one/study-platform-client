import { useEffect, useState } from 'react';

import { getKoreaDate } from '@/shared/lib/time';
import { useWeeklyStudyReviewStatusQuery } from '../model/use-review-query';

export const useReviewReminder = () => {
  const { data: reviewDone } = useWeeklyStudyReviewStatusQuery();
  const [shouldReview, setShouldReview] = useState(false);

  useEffect(() => {
    // 이미 리뷰를 달았을 경우
    if (reviewDone) return;

    const now = getKoreaDate();
    const dayOfWeek = now.getDay();

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0: 일요일, 6: 토요일

    // 평일인 경우
    if (!isWeekend) return;

    const lastShown = localStorage.getItem('lastReviewModalShown');

    const diff = now.getTime() - Number(lastShown);
    const THIRTY_MIN = 30 * 60 * 1000;

    if (!lastShown || diff >= THIRTY_MIN) {
      setShouldReview(true);

      localStorage.setItem('lastReviewModalShown', String(now.getTime()));
    }
  }, [reviewDone]);

  return { shouldReview, setShouldReview };
};
