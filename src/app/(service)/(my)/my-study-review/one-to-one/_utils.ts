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
    keywords
      .filter((keyword) => keyword.count > 0)
      .map((keyword) => ({
        id: keyword.id,
        label: keyword.content,
        count: keyword.count,
      }));

  return {
    goodItems: filterAndMap(positiveKeywords),
    disappointedItems: filterAndMap(negativeKeywords),
  };
}
