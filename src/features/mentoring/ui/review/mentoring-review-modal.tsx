'use client';

import { Star } from 'lucide-react';
import Button from '@/components/common/ui/button';
import BorderedTextarea from '@/components/common/ui/input/bordered-textarea';
import { Modal } from '@/components/common/ui/modal';
import type { MentoringReviewRecommendation } from '@/types/mentoring/management-domain';

interface MentoringReviewModalProps {
  open: boolean;
  mentorName: string;
  methodLabel: string;
  hasExistingReview?: boolean;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  minimumLength: number;
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
  formError?: string;
  onOpenChange: (open: boolean) => void;
  onRatingChange: (rating: number) => void;
  onRecommendationChange: (
    recommendation: MentoringReviewRecommendation,
  ) => void;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
}

const RECOMMENDATION_OPTIONS = [
  { value: 'RECOMMEND' as const, label: '추천해요' },
  { value: 'NOT_RECOMMEND' as const, label: '추천하지 않아요' },
];

export default function MentoringReviewModal({
  open,
  mentorName,
  methodLabel,
  hasExistingReview = false,
  isSubmitting,
  isSubmitDisabled,
  minimumLength,
  rating,
  recommendation,
  content,
  formError,
  onOpenChange,
  onRatingChange,
  onRecommendationChange,
  onContentChange,
  onSubmit,
}: MentoringReviewModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="medium" description="멘토링 후기 작성 모달">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <div>
              <Modal.Title>
                {hasExistingReview ? '후기 수정하기' : '후기 작성하기'}
              </Modal.Title>
              <p className="mt-50 font-designer-13r text-text-subtle">
                {mentorName} 멘토 · {methodLabel}
              </p>
            </div>
            <Modal.CloseButton />
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-250">
            <section>
              <p className="font-designer-14b text-text-default">상담 만족도</p>
              <p className="mt-50 font-designer-12r text-text-subtle">
                상담 경험을 기준으로 별점을 선택해주세요.
              </p>
              <div className="mt-125 flex items-center gap-75">
                {Array.from({ length: 5 }, (_, index) => {
                  const nextRating = index + 1;
                  const isActive = rating >= nextRating;

                  return (
                    <button
                      key={nextRating}
                      type="button"
                      className="rounded-500 border-border-subtle hover:border-border-brand inline-flex h-44 w-44 items-center justify-center border bg-background-default"
                      onClick={() => onRatingChange(nextRating)}
                    >
                      <Star
                        className={
                          isActive
                            ? 'text-text-warning h-20 w-20 fill-current'
                            : 'text-text-subtlest h-20 w-20'
                        }
                      />
                    </button>
                  );
                })}
                <span className="ml-50 font-designer-13m text-text-subtle">
                  {rating > 0 ? `${rating}점` : '별점을 선택해주세요'}
                </span>
              </div>
            </section>

            <section>
              <p className="font-designer-14b text-text-default">추천 여부</p>
              <div className="mt-125 flex flex-wrap gap-100">
                {RECOMMENDATION_OPTIONS.map((option) => {
                  const isActive = recommendation === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={
                        isActive
                          ? 'rounded-150 border-border-brand bg-fill-brand-subtle-default font-designer-13m text-text-brand border px-150 py-100'
                          : 'rounded-150 border-border-subtle hover:border-border-brand bg-background-default font-designer-13m text-text-subtle border px-150 py-100'
                      }
                      onClick={() => onRecommendationChange(option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-100">
                <p className="font-designer-14b text-text-default">후기 내용</p>
                <span className="font-designer-12r text-text-subtlest">
                  최소 {minimumLength}자
                </span>
              </div>
              <p className="mt-50 font-designer-12r text-text-subtle">
                상담에서 좋았던 점과 실제로 도움이 된 포인트를 남겨주세요.
              </p>
              <BorderedTextarea
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                placeholder="상담에서 얻은 점, 추천하고 싶은 이유, 다음에 바로 적용할 포인트를 적어주세요."
                className="rounded-150 border-border-subtle mt-125 min-h-[180px] resize-none py-125"
              />
              <div className="mt-75 flex items-center justify-between gap-100">
                <span className="font-designer-12r text-text-subtlest">
                  현재 {content.trim().length}자 · 최소 {minimumLength}자
                </span>
                {formError ? (
                  <span className="font-designer-12m text-text-error">
                    {formError}
                  </span>
                ) : null}
              </div>
            </section>
          </Modal.Body>

          <Modal.Footer className="flex justify-end gap-100">
            <Button
              type="button"
              color="secondary"
              size="large"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              닫기
            </Button>
            <Button
              type="button"
              color="primary"
              size="large"
              disabled={isSubmitDisabled || isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? '저장 중...' : '후기 저장'}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
