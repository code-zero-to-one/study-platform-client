'use client';

import type {
  GroupStudyBasicInfoResponseDto,
  GroupStudyDetailInfoResponseDto,
} from '@/api/openapi';
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
  detailInfo: GroupStudyDetailInfoResponseDto;
  basicInfo: GroupStudyBasicInfoResponseDto;
  onSubmitSuccess?: () => void;
}

const SATISFACTION_CONFIG: Record<
  ReviewSatisfaction,
  { label: string; emoji: string }
> = {
  GOOD: { label: '좋았어요', emoji: '\u{1F60A}' },
  DISAPPOINTED: { label: '아쉬웠어요', emoji: '\u{1F605}' },
};

export default function GroupStudyReviewModal({
  open,
  onOpenChange,
  groupStudyId,
  detailInfo,
  basicInfo,
  onSubmitSuccess,
}: GroupStudyReviewModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content
          onInteractOutside={(e) => e.preventDefault()}
          mobileFullscreen
          description="스터디 경험 후기 작성"
        >
          <Modal.Header variant="form">
            <div className="flex flex-col gap-50">
              <Modal.Title className="font-designer-16b text-text-default truncate max-w-[360px]">
                {detailInfo.title}
              </Modal.Title>
              <span className="font-designer-13r text-text-subtlest">{`${basicInfo?.startDate} ~ ${basicInfo?.endDate}`}</span>
            </div>
            <Modal.CloseButton />
          </Modal.Header>

          <GroupStudyReviewForm
            open={open}
            groupStudyId={groupStudyId}
            onClose={() => onOpenChange(false)}
            onSubmitSuccess={onSubmitSuccess}
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
  onSubmitSuccess,
}: {
  open: boolean;
  groupStudyId: number;
  onClose: () => void;
  onSubmitSuccess?: () => void;
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
  } = useGroupStudyReviewForm({ open, groupStudyId, onClose, onSubmitSuccess });

  return (
    <>
      <Modal.Body className="overflow-auto flex flex-1 flex-col gap-400 px-400 py-300">
        <div className="flex flex-col items-center gap-75">
          <h2 className="font-designer-20b text-text-strong text-center">
            스터디 전체 경험은 어떠셨나요?
          </h2>
          <p className="font-designer-14r text-text-subtle text-center">
            성장하는 스터디 문화를 위해 소중한 의견을 들려주세요.
          </p>
        </div>
        <div className="flex flex-col items-center gap-150">
          <span className="font-designer-16b text-text-default">
            스터디 만족도
          </span>
          <div className="flex items-center justify-center gap-300">
            {(Object.keys(SATISFACTION_CONFIG) as ReviewSatisfaction[]).map(
              (key) => (
                <SatisfactionButton
                  key={key}
                  label={SATISFACTION_CONFIG[key].label}
                  emoji={SATISFACTION_CONFIG[key].emoji}
                  isSelected={form.satisfaction === key}
                  onClick={() => handleSatisfactionChange(key)}
                />
              ),
            )}
          </div>
        </div>

        {form.satisfaction && currentItems && currentItems.length > 0 && (
          <div className="flex flex-col gap-150">
            <div className="flex items-center justify-center gap-100">
              <span className="font-designer-16b text-text-default">
                {itemsLabel}
              </span>
              <span className="font-designer-13m text-text-error">필수</span>
            </div>

            <List className="mx-auto w-full">
              {currentItems.map((item) => (
                <List.Item key={item.code}>
                  <Checkbox
                    id={`review-item-${item.code}`}
                    checked={form.selectedCodes.includes(item.code)}
                    onToggle={() => handleItemToggle(item.code)}
                  />
                  <label
                    htmlFor={`review-item-${item.code}`}
                    className="font-designer-14m text-text-subtle cursor-pointer"
                  >
                    {item.label ?? item.reviewSelection}
                  </label>
                </List.Item>
              ))}
            </List>
          </div>
        )}

        <div className="flex flex-col gap-100">
          <div className="flex items-center justify-center gap-100">
            <span className="font-designer-16b text-text-default text-center">
              더 자세한 의견을 들려주세요.
            </span>
            <span className="font-designer-13m text-text-error">필수</span>
          </div>
          <div className="flex flex-col gap-50">
            <TextAreaInput
              value={form.content}
              maxLength={1000}
              placeholder={`전반적인 스터디 경험에 대한 자유로운 의견을 작성해주세요. (최소 ${MIN_CONTENT_LENGTH}자)`}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, content: e.target.value }))
              }
              className="h-[120px] resize-none w-full"
            />
            {contentError && (
              <p className="font-designer-13r text-text-error">
                {contentError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-150">
          <div className="flex items-center justify-center gap-100">
            <span className="font-designer-16b text-text-default">
              스터디 전체 만족도 평가
            </span>
            <span className="font-designer-13m text-text-error">필수</span>
          </div>
          <div className="flex items-center gap-50">
            <StarRatingInput
              value={form.rating}
              onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="font-designer-14r text-text-subtle text-center">
            함께 달려온 시간, 정말 수고 많으셨어요! 🎉<br />
            남겨주신 한 마디가 더 나은 스터디를 만드는 힘이 됩니다.
          </p>
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
          제출하기
        </Button>
      </Modal.Footer>
    </>
  );
}

function SatisfactionButton({
  label,
  isSelected,
  onClick,
  emoji,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  emoji: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex flex-col w-fit gap-75 rounded-150 font-designer-14m cursor-pointer transition-colors',
        isSelected ? 'text-fill-brand-default-default' : 'text-text-subtlest',
      )}
      onClick={onClick}
    >
      {label}
      <div
        className={cn(
          'flex h-[52px] w-[52px] items-center justify-center rounded-full text-[28px] transition-all bg-fill-neutral-subtle-default',
          isSelected
            ? 'bg-fill-neutral-default-default'
            : ' opacity-50 hover:opacity-80',
        )}
      >
        {emoji}
      </div>
    </button>
  );
}
