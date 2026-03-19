'use client';

import { useMemo } from 'react';
import type {
  GroupStudyExperienceReviewDetail,
  GroupStudyExperienceReviewListItem,
  SelectableReviewItem,
} from '@/hooks/queries/group-study-review-api';

interface GroupedItem {
  id: number;
  label: string;
  count: number;
}

export interface ReviewStatistics {
  goodCount: number;
  disappointedCount: number;
  totalCount: number;
  averageRating: number;
  goodItems: GroupedItem[];
  disappointedItems: GroupedItem[];
}

function groupItemsByType(
  items: SelectableReviewItem[],
  type: 'GOOD' | 'DISAPPOINTED',
): GroupedItem[] {
  const satisfactionType = items.filter(
    (item) => item.satisfactionType === type,
  );
  if (satisfactionType.length === 0) {
    return;
  }

  return Object.values(
    satisfactionType.reduce<Record<number, GroupedItem>>((acc, item) => {
      const id = item.id;

      return {
        ...acc,
        [id]: {
          id,
          label: item.label ?? '',
          count: (acc[id]?.count ?? 0) + 1,
        },
      };
    }, {}),
  ).sort((a, b) => b.count - a.count);
}

export function useReviewStatistics(
  reviews: GroupStudyExperienceReviewListItem[],
  reviewDetails: GroupStudyExperienceReviewDetail[],
): ReviewStatistics | null {
  return useMemo(() => {
    if (!reviews.length) return null;

    const goodCount = reviews.filter((r) => r.satisfaction === 'GOOD').length;
    const disappointedCount = reviews.filter(
      (review) => review.satisfaction === 'DISAPPOINTED',
    ).length;

    const validRatings = reviews.flatMap((review) =>
      review.rating !== undefined ? [review.rating] : [],
    );
    const averageRating =
      validRatings.length > 0
        ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length
        : 0;

    const allItems = reviewDetails.flatMap(
      (detail) =>
        detail.selectableReviewItems?.filter((item) => !!item.id) ?? [],
    );

    return {
      goodCount,
      disappointedCount,
      totalCount: reviews.length,
      averageRating,
      goodItems: groupItemsByType(allItems, 'GOOD'),
      disappointedItems: groupItemsByType(allItems, 'DISAPPOINTED'),
    };
  }, [reviews, reviewDetails]);
}
