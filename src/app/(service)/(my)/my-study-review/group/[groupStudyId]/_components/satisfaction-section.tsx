'use client';

import { Star } from 'lucide-react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Progress from '@/components/common/ui/progress';
import type { GroupStudyReviewStatistics } from '@/hooks/queries/group-study-review-api';

interface SatisfactionSectionProps {
  statistics?: GroupStudyReviewStatistics;
  emptyMessage?: string;
}

const STAR_COUNT = 5;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-25">
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const isFull = rating >= i + 1;
        const isHalf = rating > i && rating < i + 1;

        return (
          <div key={i} className="relative">
            <Star className="h-250 w-250 shrink-0 fill-current text-icon-disabled" />
            {(isFull || isHalf) && (
              <div
                className={cn(
                  'absolute inset-0 overflow-hidden',
                  isFull ? 'w-full' : 'w-1/2',
                )}
              >
                <Star className="h-250 w-250 shrink-0 fill-current text-text-warning" />
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
  emptyMessage,
}: SatisfactionSectionProps) {
  const {
    goodCount = 0,
    disappointedCount = 0,
    totalCount = 0,
    averageRating = 0,
  } = statistics ?? {};

  const goodPercent =
    totalCount > 0 ? Math.round((goodCount / totalCount) * 100) : 0;
  const disappointedPercent =
    totalCount > 0 ? Math.round((disappointedCount / totalCount) * 100) : 0;

  return (
    <div className="flex gap-300">
      {/* 만족도 카드 */}
      <div className="border-border-subtle flex-1 rounded-100 border p-300">
        <h3 className="font-designer-16b text-text-default mb-200">만족도</h3>

        {totalCount === 0 ? (
          <span className="font-designer-13r text-text-subtlest">
            {emptyMessage ?? '아직 없어요'}
          </span>
        ) : (
          <div className="flex flex-col gap-150">
            <div className="flex items-center gap-200">
              <div className="flex w-100 items-center gap-75">
                <span className="font-designer-14m text-text-default">
                  좋았어요
                </span>
                <span>{'\u{1F60A}'}</span>
              </div>
              <div className="flex-1">
                <Progress
                  value={goodPercent}
                  indicatorColor="bg-fill-information-default-default"
                />
              </div>
              <span className="font-designer-14m text-text-subtle w-100 text-right">
                {goodPercent}% ({goodCount}/{totalCount})
              </span>
            </div>

            <div className="flex items-center gap-200">
              <div className="flex w-100 items-center gap-75">
                <span className="font-designer-14m text-text-default">
                  아쉬웠어요
                </span>
                <span>{'\u{1F605}'}</span>
              </div>
              <div className="flex-1">
                <Progress
                  value={disappointedPercent}
                  indicatorColor="bg-fill-danger-default-default"
                />
              </div>
              <span className="font-designer-14m text-text-subtle w-100 text-right">
                {disappointedPercent}% ({disappointedCount}/{totalCount})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 평균 별점 카드 */}
      <div className="border-border-subtle flex-1 rounded-100 border p-300">
        <h3 className="font-designer-16b text-text-default mb-200">
          평균 별점
        </h3>
        {totalCount === 0 ? (
          <span className="font-designer-13r text-text-subtlest">
            {emptyMessage ?? '아직 없어요'}
          </span>
        ) : (
          <div className="flex items-center gap-200">
            <span className="font-designer-36b text-text-strong tabular-nums">
              {averageRating.toFixed(2)}
            </span>

            <div className="flex flex-1 flex-col gap-75">
              <StarRating rating={averageRating} />
              <span className="font-designer-13r text-text-subtle">
                총 {totalCount}명 참여
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
