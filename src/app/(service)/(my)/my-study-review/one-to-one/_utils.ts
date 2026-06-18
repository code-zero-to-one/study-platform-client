import type { GroupStudyReviewStatistics } from '@/types/api/group-study-review.types';

interface ReviewStatisticsProps {
  id: number;
  content: string;
  count: number;
}

export function buildEvaluationStatistics(
  positiveKeywords: ReviewStatisticsProps[],
  negativeKeywords: ReviewStatisticsProps[],
): GroupStudyReviewStatistics {
  const filterAndMap = (keywords: ReviewStatisticsProps[]) =>
    keywords.flatMap((keyword) =>
      keyword.count > 0
        ? [{ id: keyword.id, label: keyword.content, count: keyword.count }]
        : [],
    );

  return {
    goodItems: filterAndMap(positiveKeywords),
    disappointedItems: filterAndMap(negativeKeywords),
  };
}
