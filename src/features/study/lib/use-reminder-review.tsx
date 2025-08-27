import { useEffect, useState } from 'react';

import { getKoreaDate } from '@/shared/lib/time';
import { useWeeklyStudyReviewStatusQuery } from '../model/use-review-query';

export const useReviewReminder = () => {
  const { data: reviewDone, isFetching } = useWeeklyStudyReviewStatusQuery();
  const [shouldReview, setShouldReview] = useState(false);

  useEffect(() => {
    if (reviewDone || isFetching) return;

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
  }, [reviewDone, isFetching]); // 30분마다 refetch하여 effect 실행하기 위해 isFetching 추가

  return { shouldReview, setShouldReview };
};
