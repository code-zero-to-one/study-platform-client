'use client';

import {
  useMyNegativeKeywordsQuery,
  useMyReviewsInfinityQuery,
  useUserPositiveKeywordsQuery,
} from '@/hooks/queries/use-review-query';
import StudyReviewTabNav from '../_components/study-review-tab-nav';

export default function OnetoOneReviewPage() {
  const { data: positiveReview } = useUserPositiveKeywordsQuery({
    pageSize: 5,
  });

  const { data: negativeReview } = useMyNegativeKeywordsQuery({
    pageSize: 5,
  });
  const {
    data: myReviewsData,
    fetchNextPage,
    hasNextPage,
  } = useMyReviewsInfinityQuery();

  const positiveKeywords = positiveReview?.keywords || [];
  const negativeKeywords = negativeReview?.keywords || [];

  const positiveKeywordsCount = positiveReview?.totalCount || 0;
  const negativeKeywordsCount = negativeReview?.totalCount || 0;

  const totalKeywordsCount = positiveKeywordsCount + negativeKeywordsCount || 0;

  const myReviews = myReviewsData?.reviews || [];

  console.log({ positiveReview });

  return (
    <>
      <StudyReviewTabNav />
      <section className="mt-300">
        <div className="mb-200">
          <div className="flex items-center gap-100">
            <div className="font-designer-20b text-text-default">받은 평가</div>
            <div className="font-designer-20b text-text-default">
              {totalKeywordsCount}
            </div>
          </div>

          <span className="font-designer-14r text-text-subtle">
            개선이 필요한 점은 나에게만 보여요
          </span>
        </div>
      </section>
    </>
  );
}
