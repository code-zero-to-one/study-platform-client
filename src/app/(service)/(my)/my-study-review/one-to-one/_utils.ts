import type {
  GroupStudyReviewStatistics,
  GroupStudyReviewStatisticsItem,
} from '@/types/api/group-study-review.types';

interface ReviewStatisticsProps {
  code: string;
  label: string;
  count: number;
}

export function buildEvaluationStatistics(
  positiveKeywords: ReviewStatisticsProps[],
  negativeKeywords: ReviewStatisticsProps[],
): Omit<GroupStudyReviewStatistics, 'averageRating' | 'totalCount'> {
  const filterAndMap = (keywords: ReviewStatisticsProps[]): GroupStudyReviewStatisticsItem[] =>
    keywords
      .filter((keyword) => keyword.count > 0)
      .map((keyword) => ({
        code: keyword.code,
        label: keyword.label,
        count: keyword.count,
      }));

  return {
    goodItems: filterAndMap(positiveKeywords),
    disappointedItems: filterAndMap(negativeKeywords),
  };
}
