'use client';

import MyMentoringReviewPanel from '@/features/mentoring/ui/review/my-mentoring-review-panel';
import MyStudyReviewKeywordPanels from '@/features/my-page/ui/my-study-review/my-study-review-keyword-panels';
import MyStudyReviewListSection from '@/features/my-page/ui/my-study-review/my-study-review-list-section';
import type { ReviewKeywordStat } from '@/types/review/domain';
import type { MyReviewItem } from '@/types/review/domain';

interface MyStudyReviewCompositeProps {
  positiveKeywords: ReviewKeywordStat[];
  negativeKeywords: ReviewKeywordStat[];
  allPositiveKeywords: ReviewKeywordStat[];
  allNegativeKeywords: ReviewKeywordStat[];
  positiveKeywordsCount: number;
  negativeKeywordsCount: number;
  reviews: MyReviewItem[];
  reviewTotalCount: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export default function MyStudyReviewComposite({
  positiveKeywords,
  negativeKeywords,
  allPositiveKeywords,
  allNegativeKeywords,
  positiveKeywordsCount,
  negativeKeywordsCount,
  reviews,
  reviewTotalCount,
  hasNextPage,
  onLoadMore,
}: MyStudyReviewCompositeProps) {
  return (
    <>
      <MyMentoringReviewPanel />

      <MyStudyReviewKeywordPanels
        positiveKeywords={positiveKeywords}
        negativeKeywords={negativeKeywords}
        allPositiveKeywords={allPositiveKeywords}
        allNegativeKeywords={allNegativeKeywords}
        positiveKeywordsCount={positiveKeywordsCount}
        negativeKeywordsCount={negativeKeywordsCount}
      />

      <MyStudyReviewListSection
        reviews={reviews}
        reviewTotalCount={reviewTotalCount}
        hasNextPage={hasNextPage}
        onLoadMore={onLoadMore}
      />
    </>
  );
}
