'use client';

import { useState } from 'react';
import type {
  GroupStudyReviewStatistics,
  GroupStudyReviewStatisticsItem,
} from '@/hooks/queries/group-study-review-api';

const DEFAULT_SHOW_COUNT = 5;

interface CardProps {
  title: string;
  items: GroupStudyReviewStatisticsItem[];
  showToggle?: boolean;
  emptyMessage: string;
}

function EvaluationCard({
  title,
  items,
  showToggle = false,
  emptyMessage,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, DEFAULT_SHOW_COUNT);
  const hasMore = items.length > DEFAULT_SHOW_COUNT;

  return (
    <div className="rounded-100 border-border-subtle min-h-[200px] border p-200">
      <div className={`mb-200 flex ${showToggle ? 'justify-between' : ''}`}>
        <h3 className="font-designer-16b text-text-default">{title}</h3>
        {showToggle && hasMore && (
          <button
            type="button"
            className="font-designer-14m text-text-subtle cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '접기' : '더보기'}
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-50">
          {visible.map((item, index) => (
            <li
              key={item.id ?? index}
              className="bg-background-accent-gray-default text-text-default rounded-50 flex justify-between px-200 py-100"
            >
              <span className="font-designer-14r">{item.label}</span>
              <span className="font-designer-14b">{item.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="font-designer-13r text-text-subtlest">
          {emptyMessage}
        </span>
      )}
    </div>
  );
}

interface EvaluationSectionProps {
  statistics: GroupStudyReviewStatistics;
  studyTypeName?: string;
}

export default function EvaluationSection({
  statistics,
  studyTypeName,
}: EvaluationSectionProps) {
  const emptyMessage = studyTypeName
    ? `아직 받은 ${studyTypeName} 평가가 없습니다`
    : '아직 받은 평가가 없습니다';
  const goodItems = statistics.goodItems ?? [];
  const disappointedItems = statistics.disappointedItems ?? [];
  const goodTotalCount = goodItems.reduce(
    (sum, item) => sum + (item.count ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-200">
      <div className="flex items-center gap-100">
        <h2 className="font-designer-20b text-text-default">받은 평가</h2>
        <span className="font-designer-20b text-text-default">
          {goodTotalCount}
        </span>
      </div>
      <span className="font-designer-14r text-text-subtle">
        개선이 필요한 점은 스터디장에게만 보여요
      </span>

      <div className="grid grid-cols-2 gap-300">
        <EvaluationCard
          title="좋았던 점"
          items={goodItems}
          showToggle
          emptyMessage={emptyMessage}
        />
        <EvaluationCard
          title="개선이 필요한 점"
          items={disappointedItems}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}
