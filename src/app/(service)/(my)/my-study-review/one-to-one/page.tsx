'use client';

import {
  useMyNegativeKeywordsQuery,
  useMyReviewsInfinityQuery,
  useUserPositiveKeywordsQuery,
} from '@/hooks/queries/use-review-query';
import StudyReviewTabNav from '../_components/study-review-tab-nav';
import ReviewPageContent from '../_components/review-page-content';

export default function OnetoOneReviewPage() {
  const { data: positiveKeywordsData } = useUserPositiveKeywordsQuery({
    pageSize: 5,
  });
  const { data: negativeKeywordsData } = useMyNegativeKeywordsQuery({
    pageSize: 5,
  });
  const { data: allPositiveKeywordsData } = useUserPositiveKeywordsQuery({});
  const { data: allNegativeKeywordsData } = useMyNegativeKeywordsQuery({});
  const {
    data: myReviewsData,
    fetchNextPage,
    hasNextPage,
  } = useMyReviewsInfinityQuery();

  return (
    <>
      <StudyReviewTabNav />
      <ReviewPageContent
        positiveKeywords={positiveKeywordsData?.keywords ?? []}
        negativeKeywords={negativeKeywordsData?.keywords ?? []}
        allPositiveKeywords={allPositiveKeywordsData?.keywords ?? []}
        allNegativeKeywords={allNegativeKeywordsData?.keywords ?? []}
        totalKeywordsCount={
          (positiveKeywordsData?.totalCount ?? 0) +
          (negativeKeywordsData?.totalCount ?? 0)
        }
        myReviews={myReviewsData?.reviews ?? []}
        totalReviewsCount={myReviewsData?.totalCount ?? 0}
        hasNextPage={!!hasNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
}
