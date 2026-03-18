'use client';

import { Star } from 'lucide-react';
import Progress from '@/components/common/ui/progress';
import type { GroupStudyReviewStatistics } from '@/hooks/queries/group-study-review-api';

interface SatisfactionSectionProps {
  statistics: GroupStudyReviewStatistics;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-50">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;

        return (
          <div key={i} className="relative">
            <Star size={16} className="text-background-accent-gray-subtle" />
            {(filled || half) && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? '100%' : '50%' }}
              >
                <Star
                  size={16}
                  className="fill-yellow-400 text-yellow-400"
                  style={{ minWidth: 16 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SatisfactionSection({
  statistics,
}: SatisfactionSectionProps) {
  const {
    goodCount = 0,
    disappointedCount = 0,
    totalCount = 0,
    averageRating = 0,
  } = statistics;

  const goodPercent =
    totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
  const disappointedPercent =
    totalCount > 0 ? Math.round((disappointedCount / totalCount) * 100) : 0;

  return (
    <div className="flex gap-300">
      {/* 만족도 카드 */}
      <div className="bg-background-surface-default flex flex-1 flex-col gap-200 rounded-200 p-250">
        <span className="font-designer-14b text-text-default">만족도</span>

        <div className="flex flex-col gap-150">
          <div className="flex flex-col gap-100">
            <div className="flex items-center justify-between">
              <span className="font-designer-13r text-text-default">
                좋았어요 😍
              </span>
              <span className="font-designer-12r text-text-subtle">
                {goodPercent}% ({goodCount}/{totalCount})
              </span>
            </div>
            <Progress value={goodPercent} indicatorColor="bg-blue-500" />
          </div>

          <div className="flex flex-col gap-100">
            <div className="flex items-center justify-between">
              <span className="font-designer-13r text-text-default">
                아쉬웠어요 😄
              </span>
              <span className="font-designer-12r text-text-subtle">
                {disappointedPercent}% ({disappointedCount}/{totalCount})
              </span>
            </div>
            <Progress value={disappointedPercent} indicatorColor="bg-red-400" />
          </div>
        </div>
      </div>

      {/* 평균 별점 카드 */}
      <div className="bg-background-surface-default flex w-[140px] shrink-0 flex-col items-center justify-center gap-100 rounded-200 p-250">
        <span className="font-designer-14b text-text-default">평균 별점</span>
        <span className="font-designer-24b text-text-default">
          {averageRating.toFixed(2)}
        </span>
        <StarRating rating={averageRating} />
        <span className="font-designer-12r text-text-subtle">
          총 {totalCount}명 참여
        </span>
      </div>
    </div>
  );
}
