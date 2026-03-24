import type { GroupStudyReviewStatistics } from '@/types/api/group-study-review.types';

export function buildEvaluationStatistics(
  positiveKeywords: Array<{ id: number; content: string; count: number }>,
  negativeKeywords: Array<{ id: number; content: string; count: number }>,
): GroupStudyReviewStatistics {
  return {
    goodItems: positiveKeywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.content,
      count: keyword.count,
    })),
    disappointedItems: negativeKeywords.map((keyword) => ({
      id: keyword.id,
      label: keyword.content,
      count: keyword.count,
    })),
  };
}
