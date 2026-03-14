'use client';

import dayjs from 'dayjs';
import { Star } from 'lucide-react';
import Button from '@/components/common/ui/button';
import Badge from '@/components/common/ui/badge';
import type {
  MentoringReview,
  MentoringReviewEligibility,
} from '@/types/mentoring/management-domain';

interface MentoringReviewSummaryCardProps {
  review?: MentoringReview;
  reviewEligibility?: MentoringReviewEligibility;
  onWriteReview?: () => void;
  onEditReview?: () => void;
}

const formatReviewDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  return dayjs(value).format('YYYY.MM.DD HH:mm');
};

export default function MentoringReviewSummaryCard({
  review,
  reviewEligibility,
  onWriteReview,
  onEditReview,
}: MentoringReviewSummaryCardProps) {
  if (review) {
    return (
      <div className="rounded-150 border-border-information bg-background-accent-blue-subtle border px-200 py-175">
        <div className="flex flex-wrap items-start justify-between gap-150">
          <div>
            <p className="font-designer-14b text-text-default">
              내가 작성한 후기
            </p>
            <div className="mt-75 flex flex-wrap items-center gap-75">
              <div className="flex items-center gap-50">
                {Array.from({ length: 5 }, (_, index) => {
                  const isActive = review.rating >= index + 1;

                  return (
                    <Star
                      key={index}
                      className={
                        isActive
                          ? 'text-text-warning h-14 w-14 fill-current'
                          : 'text-text-subtlest h-14 w-14'
                      }
                    />
                  );
                })}
              </div>
              <span className="font-designer-13m text-text-default">
                {review.rating.toFixed(1)}점
              </span>
              <Badge
                color={
                  review.recommendation === 'RECOMMEND' ? 'green' : 'orange'
                }
                shape="round"
              >
                {review.recommendation === 'RECOMMEND'
                  ? '추천해요'
                  : '추천하지 않아요'}
              </Badge>
            </div>
          </div>
          {onEditReview ? (
            <Button
              type="button"
              color="outlined"
              size="small"
              onClick={onEditReview}
            >
              후기 수정하기
            </Button>
          ) : null}
        </div>
        <p className="mt-150 leading-relaxed whitespace-pre-line font-designer-14r text-text-default">
          {review.content}
        </p>
        <p className="mt-100 font-designer-12r text-text-subtle">
          마지막 저장 {formatReviewDate(review.updatedAt || review.createdAt)}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-150 border-border-information bg-background-accent-blue-subtle border px-200 py-175">
      <p className="font-designer-14b text-text-default">
        상담이 끝났다면 후기를 남겨주세요.
      </p>
      <p className="mt-50 leading-relaxed font-designer-13r text-text-subtle">
        {reviewEligibility?.canReview
          ? '기억이 선명할 때 후기를 남기면 다음에 참고하기도 쉽고, 다른 멘티에게도 도움이 됩니다.'
          : (reviewEligibility?.reason ??
            '상담이 종료되면 후기 작성 버튼이 열립니다.')}
      </p>
      {reviewEligibility?.canReview && onWriteReview ? (
        <div className="mt-150 flex justify-end">
          <Button type="button" color="primary" size="small" onClick={onWriteReview}>
            후기 작성하기
          </Button>
        </div>
      ) : null}
    </div>
  );
}
