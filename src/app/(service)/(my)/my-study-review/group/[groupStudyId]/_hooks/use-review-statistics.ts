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
  return Object.values(
    items
      .filter((item) => item.satisfactionType === type)
      .reduce<Record<number, GroupedItem>>((acc, item) => {
        const id = item.id as number; // !!item.id 필터로 보장됨

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
      (r) => r.satisfaction === 'DISAPPOINTED',
    ).length;
    const validRatings = reviews.flatMap((r) =>
      r.rating !== undefined ? [r.rating] : [],
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
