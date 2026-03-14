'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import Badge from '@/components/common/ui/badge';
import SurfacePanel from '@/components/common/ui/surface-panel';
import { MENTORING_METHOD_LABEL_MAP } from '@/features/mentoring/model/mentoring-method';
import ReviewStars from '@/features/mentoring/ui/detail/review-stars';
import type { MentoringReview } from '@/types/mentoring/management-domain';

const RECOMMENDATION_META = {
  RECOMMEND: {
    color: 'green' as const,
    label: '추천',
  },
  NOT_RECOMMEND: {
    color: 'red' as const,
    label: '비추천',
  },
};

const formatDateTime = (value: string) => {
  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return '-';
  }

  return parsed.format('YYYY.MM.DD HH:mm');
};

interface MentoringReceivedReviewsPanelProps {
  reviews: MentoringReview[];
  reviewCount: number;
  isLoading: boolean;
  isError: boolean;
}

export default function MentoringReceivedReviewsPanel({
  reviews,
  reviewCount,
  isLoading,
  isError,
}: MentoringReceivedReviewsPanelProps) {
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((first, second) => {
      return dayjs(second.createdAt).valueOf() - dayjs(first.createdAt).valueOf();
    });
  }, [reviews]);

  return (
    <SurfacePanel className="p-200">
      <div className="border-border-subtle mb-150 border-b pb-150">
        <h3 className="font-designer-16b text-text-default">받은 후기</h3>
        <p className="mt-50 font-designer-13r text-text-subtle">
          멘티가 남긴 최신 후기를 확인하고 운영 품질을 점검합니다.
        </p>
      </div>

      {isLoading ? (
        <p className="font-designer-14r text-text-subtle">
          후기를 불러오는 중입니다.
        </p>
      ) : isError ? (
        <p className="font-designer-14r text-text-subtle">
          후기 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : reviewCount === 0 ? (
        <p className="font-designer-14r text-text-subtle">
          아직 멘티가 남긴 후기가 없습니다.
        </p>
      ) : (
        <div className="space-y-125">
          <div className="rounded-100 bg-background-alternative px-150 py-125">
            <p className="font-designer-13b text-text-default">
              총 {reviewCount}건
            </p>
            <p className="mt-25 font-designer-12r text-text-subtle">
              {reviewCount > sortedReviews.length
                ? `최근 ${sortedReviews.length}건을 먼저 보여줍니다.`
                : '최신 후기 순으로 정렬되어 있습니다.'}
            </p>
          </div>

          <ul className="space-y-100">
            {sortedReviews.map((review) => {
              const recommendationMeta =
                RECOMMENDATION_META[review.recommendation];

              return (
                <li
                  key={review.id}
                  className="rounded-150 border-border-subtle bg-background-default border px-175 py-150"
                >
                  <div className="flex flex-wrap items-start justify-between gap-100">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-75">
                        <p className="font-designer-14b text-text-default">
                          {review.menteeName}
                        </p>
                        <Badge color="blue" shape="rectangle">
                          {MENTORING_METHOD_LABEL_MAP[review.method]}
                        </Badge>
                        <Badge
                          color={recommendationMeta.color}
                          shape="rectangle"
                        >
                          {recommendationMeta.label}
                        </Badge>
                      </div>
                      <p className="mt-50 font-designer-12r text-text-subtlest">
                        후기 #{review.id} · 요청 #{review.requestId} ·{' '}
                        {formatDateTime(review.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-75">
                      <ReviewStars rating={review.rating} />
                      <span className="font-designer-13b text-text-default">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-125 whitespace-pre-wrap break-words font-designer-14r leading-relaxed text-text-default">
                    {review.content || '후기 본문이 없습니다.'}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </SurfacePanel>
  );
}
