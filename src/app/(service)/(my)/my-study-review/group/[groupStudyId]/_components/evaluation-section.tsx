'use client';

import { useState } from 'react';
import type {
  GroupStudyReviewStatistics,
  GroupStudyReviewStatisticsItem,
} from '@/hooks/queries/group-study-review-api';

const DEFAULT_SHOW_COUNT = 5;

function ItemList({ items }: { items: GroupStudyReviewStatisticsItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, DEFAULT_SHOW_COUNT);
  const hasMore = items.length > DEFAULT_SHOW_COUNT;

  return (
    <div className="flex flex-col gap-150">
      {visible.map((item, index) => (
        <div
          key={item.id ?? index}
          className="flex items-center justify-between"
        >
          <span className="font-designer-13r text-text-default">
            {item.label}
          </span>
          <span className="font-designer-13r text-text-subtle">{item.count}</span>
        </div>
      ))}

      {hasMore && (
        <button
          type="button"
          className="font-designer-13r text-text-subtlest cursor-pointer self-start"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '접기' : '더보기'}
        </button>
      )}
    </div>
  );
}

interface EvaluationSectionProps {
  statistics: GroupStudyReviewStatistics;
}

export default function EvaluationSection({
  statistics,
}: EvaluationSectionProps) {
  const goodItems = statistics.goodItems ?? [];
  const disappointedItems = statistics.disappointedItems ?? [];
  const goodTotalCount = goodItems.reduce((sum, item) => sum + (item.count ?? 0), 0);

  return (
    <div className="flex flex-col gap-200">
      <div className="flex flex-col gap-50">
        <span className="font-designer-16b text-text-default">
          받은 평가 {goodTotalCount}
        </span>
        <span className="font-designer-13r text-text-subtle">
          개선이 필요한 점은 나에게만 보여요
        </span>
      </div>

      <div className="flex gap-200">
        {/* 좋았던 점 */}
        <div className="bg-background-surface-default flex flex-1 flex-col gap-200 rounded-200 p-250">
          <span className="font-designer-14b text-text-default">
            좋았던 점
          </span>
          {goodItems.length > 0 ? (
            <ItemList items={goodItems} />
          ) : (
            <span className="font-designer-13r text-text-subtlest">
              아직 없어요
            </span>
          )}
        </div>

        {/* 개선이 필요한 점 */}
        <div className="bg-background-surface-default flex flex-1 flex-col gap-200 rounded-200 p-250">
          <span className="font-designer-14b text-text-default">
            개선이 필요한 점
          </span>
          {disappointedItems.length > 0 ? (
            <ItemList items={disappointedItems} />
          ) : (
            <span className="font-designer-13r text-text-subtlest">
              아직 없어요
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
