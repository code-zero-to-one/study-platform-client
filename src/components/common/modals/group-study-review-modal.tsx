'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import Checkbox from '@/components/common/ui/checkbox';
import { TextAreaInput } from '@/components/common/ui/input';
import List from '@/components/common/ui/list';
import { Modal } from '@/components/common/ui/modal';
import StarRatingInput from '@/components/common/ui/star-rating-input';
import {
  MIN_CONTENT_LENGTH,
  useGroupStudyReviewForm,
} from '@/hooks/common/use-group-study-review-form';
import type { ReviewSatisfaction } from '@/types/api/group-study-review.types';

interface GroupStudyReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupStudyId: number;
}

const SATISFACTION_CONFIG: Record<ReviewSatisfaction, { label: string }> = {
  GOOD: { label: '좋았어요 😊' },
  DISAPPOINTED: { label: '아쉬웠어요 😅' },
};

export default function GroupStudyReviewModal({
  open,
  onOpenChange,
  groupStudyId,
}: GroupStudyReviewModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content
          onInteractOutside={(e) => e.preventDefault()}
          className={cn(
            // 모바일: 전체화면
            'top-0 left-0 translate-x-0 translate-y-0',
            'w-screen max-w-full max-h-screen h-screen rounded-none',
            // md 이상: 중앙 모달
            'md:top-1/2 md:left-1/2',
            'md:-translate-x-1/2 md:-translate-y-1/2',
            'md:max-w-3xl md:w-full md:h-auto md:max-h-modal',
            'md:rounded-150',
          )}
          description="스터디 경험 후기 작성"
        >
          <Modal.Header variant="form">
            <Modal.Title>스터디 경험 후기를 남겨주세요</Modal.Title>
            <Modal.CloseButton />
          </Modal.Header>

          <GroupStudyReviewForm
            open={open}
            groupStudyId={groupStudyId}
            onClose={() => onOpenChange(false)}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function GroupStudyReviewForm({
  open,
  groupStudyId,
  onClose,
}: {
  open: boolean;
  groupStudyId: number;
  onClose: () => void;
}) {
  const {
    form,
    setForm,
    isFormValid,
    contentError,
    currentItems,
    itemsLabel,
    isPending,
    handleSatisfactionChange,
    handleItemToggle,
    handleSubmit,
  } = useGroupStudyReviewForm({ open, groupStudyId, onClose });

  return (
    <>
      <Modal.Body className="flex flex-col gap-400">
        {/* 만족도 선택 */}
        <div className="flex flex-col items-center gap-150">
          <span className="font-designer-16b text-text-default">
            스터디 만족도
          </span>
          <div className="flex gap-200">
            {(Object.keys(SATISFACTION_CONFIG) as ReviewSatisfaction[]).map(
              (key) => (
                <SatisfactionButton
                  key={key}
                  label={SATISFACTION_CONFIG[key].label}
                  isSelected={form.satisfaction === key}
                  onClick={() => handleSatisfactionChange(key)}
                />
              ),
            )}
          </div>
        </div>

        {/* 세부 항목 선택 */}
        {form.satisfaction && currentItems && currentItems.length > 0 && (
          <div className="flex flex-col gap-150">
            <div className="flex items-center justify-center gap-100">
              <span className="font-designer-16b text-text-default">
                {itemsLabel}
              </span>
              <span className="font-designer-13m text-text-error">필수</span>
            </div>

            <List className="mx-auto">
              {currentItems.map((item) => (
                <List.Item key={item.id}>
                  <Checkbox
                    id={`review-item-${item.id}`}
                    checked={form.selectableReviewItemIds.includes(item.id)}
                    onToggle={() => handleItemToggle(item.id)}
                  />
                  <label
                    htmlFor={`review-item-${item.id}`}
                    className="font-designer-14m text-text-subtle cursor-pointer"
                  >
                    {item.label ?? item.reviewSelection}
                  </label>
                </List.Item>
              ))}
            </List>
          </div>
        )}

        {/* 별점 입력 */}
        <div className="flex flex-col items-center gap-150">
          <div className="flex items-center gap-100">
            <span className="font-designer-16b text-text-default">별점</span>
            <span className="font-designer-13m text-text-error">필수</span>
          </div>
          <StarRatingInput
            value={form.rating}
            onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
          />
          {form.rating > 0 && (
            <span className="font-designer-14r text-text-subtle">
              {form.rating}점
            </span>
          )}
        </div>

        {/* 자유 의견 */}
        <div className="flex flex-col gap-100">
          <div className="flex items-center gap-100">
            <span className="font-designer-16b text-text-default">
              스터디 경험을 자유롭게 남겨주세요
            </span>
            <span className="font-designer-13m text-text-error">필수</span>
          </div>
          <div className="flex flex-col gap-50">
            <TextAreaInput
              value={form.content}
              maxLength={1000}
              placeholder={`스터디 경험을 ${MIN_CONTENT_LENGTH}자 이상 작성해주세요`}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
            />
            {contentError && (
              <p className="font-designer-13r text-text-error">
                {contentError}
              </p>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="flex justify-end gap-100">
        <Button color="secondary" size="large" onClick={onClose}>
          취소
        </Button>
        <Button
          color="primary"
          size="large"
          disabled={!isFormValid || isPending}
          onClick={handleSubmit}
        >
          등록하기
        </Button>
      </Modal.Footer>
    </>
  );
}

function SatisfactionButton({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-150 px-300 py-200 font-designer-14m cursor-pointer transition-colors',
        isSelected
          ? 'bg-fill-brand-default-default text-text-inverse'
          : 'bg-fill-neutral-subtle-default text-text-subtle hover:bg-fill-neutral-subtle-hover',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
