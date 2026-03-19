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
  const grouped = items
    .filter((item) => item.satisfactionType === type)
    .reduce<Record<number, GroupedItem>>((acc, item) => {
      acc[item.id] = {
        id: item.id,
        label: item.label ?? '',
        count: (acc[item.id]?.count ?? 0) + 1,
      };
      return acc;
    }, {});

  return Object.values(grouped).sort((a, b) => b.count - a.count);
}

export function useReviewStatistics(
  reviews: GroupStudyExperienceReviewListItem[],
  reviewDetails: GroupStudyExperienceReviewDetail[],
): ReviewStatistics {
  return useMemo(() => {
    if (!reviews.length) {
      return {
        goodCount: 0,
        disappointedCount: 0,
        totalCount: 0,
        averageRating: 0,
        goodItems: [],
        disappointedItems: [],
      };
    }

    const goodCount = reviews.filter((r) => r.satisfaction === 'GOOD').length;
    const disappointedCount = reviews.filter(
      (review) => review.satisfaction === 'DISAPPOINTED',
    ).length;

    const validRatings = reviews
      .filter((review) => review.rating !== undefined)
      .map((review) => review.rating as number);
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
