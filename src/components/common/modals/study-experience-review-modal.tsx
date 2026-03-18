'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import Checkbox from '@/components/common/ui/checkbox';
import List from '@/components/common/ui/list';
import { Modal } from '@/components/common/ui/modal';
import StarRatingInput from '@/components/common/ui/star-rating-input';
import {
  MOCK_GROUP_STUDIES_FOR_REVIEW,
  MOCK_PREMIUM_STUDIES_FOR_REVIEW,
  NEGATIVE_ITEMS,
  POSITIVE_ITEMS,
} from '@/mocks/study-review-mock-data';

type Satisfaction = 'GOOD' | 'DISAPPOINTED';

interface FormState {
  satisfaction: Satisfaction | undefined;
  selectedItemIndices: number[];
  content: string;
  rating: number;
}

const MIN_CONTENT_LENGTH = 20;
const MAX_CONTENT_LENGTH = 1000;

const INITIAL_FORM: FormState = {
  satisfaction: undefined,
  selectedItemIndices: [],
  content: '',
  rating: 0,
};

function getStudyInfo(
  studyType: 'GROUP_STUDY' | 'PREMIUM_STUDY',
  studyId: number,
): { title: string; startDate: string; endDate: string } {
  const list =
    studyType === 'GROUP_STUDY'
      ? MOCK_GROUP_STUDIES_FOR_REVIEW
      : MOCK_PREMIUM_STUDIES_FOR_REVIEW;
  const study = list.find((s) => s.studyId === studyId);

  return {
    title: study?.title ?? '스터디',
    startDate: study?.startDate ?? '',
    endDate: study?.endDate ?? '',
  };
}

interface StudyExperienceReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyType: 'GROUP_STUDY' | 'PREMIUM_STUDY';
  studyId: number;
  studyTitle?: string;
  studyStartDate?: string;
  studyEndDate?: string;
}

export default function StudyExperienceReviewModal({
  open,
  onOpenChange,
  studyType,
  studyId,
  studyTitle,
  studyStartDate,
  studyEndDate,
}: StudyExperienceReviewModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Props로 받은 값이 있으면 우선 사용, 없으면 mock 데이터에서 조회
  const mockStudyInfo = getStudyInfo(studyType, studyId);
  const studyInfo = {
    title: studyTitle ?? mockStudyInfo.title,
    startDate: studyStartDate ?? mockStudyInfo.startDate,
    endDate: studyEndDate ?? mockStudyInfo.endDate,
  };

  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setHasAttemptedSubmit(false);
    }
  }, [open]);

  const currentItems =
    form.satisfaction === 'GOOD' ? POSITIVE_ITEMS : NEGATIVE_ITEMS;

  const itemsLabel =
    form.satisfaction === 'GOOD'
      ? '어떤 점이 좋았나요?'
      : '어떤 점이 아쉬웠나요?';

  const trimmedContentLength = form.content.trim().length;
  const isFormValid =
    form.satisfaction !== undefined &&
    form.selectedItemIndices.length > 0 &&
    trimmedContentLength >= MIN_CONTENT_LENGTH &&
    form.rating > 0;

  const contentError =
    hasAttemptedSubmit && trimmedContentLength < MIN_CONTENT_LENGTH
      ? `최소 ${MIN_CONTENT_LENGTH}자 이상 입력해주세요.`
      : undefined;

  const handleSatisfactionChange = (next: Satisfaction) => {
    setForm((prev) => ({
      ...prev,
      satisfaction: next,
      selectedItemIndices: [],
    }));
  };

  const handleItemToggle = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      selectedItemIndices: prev.selectedItemIndices.includes(idx)
        ? prev.selectedItemIndices.filter((i) => i !== idx)
        : [...prev.selectedItemIndices, idx],
    }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CONTENT_LENGTH) {
      setForm((prev) => ({ ...prev, content: value }));
    }
  };

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid) return;

    // 컨페티 + 성공 모달
    fireConfetti();
    onOpenChange(false);
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 300);
  };

  return (
    <>
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Portal>
          <Modal.Overlay />
          <Modal.Content
            onInteractOutside={(e) => e.preventDefault()}
            className={cn(
              'top-0 left-0 translate-x-0 translate-y-0',
              'w-screen max-w-full max-h-screen h-screen rounded-none',
              'md:top-1/2 md:left-1/2',
              'md:-translate-x-1/2 md:-translate-y-1/2',
              'md:max-w-[480px] md:w-full md:h-auto md:max-h-[90vh]',
              'md:rounded-150',
            )}
            description="스터디 전체 경험 후기 작성"
          >
          <Modal.Header variant="form">
            <div className="flex flex-col gap-25">
              <span className="font-designer-16b text-text-default truncate max-w-[360px]">
                {studyInfo.title}
              </span>
              {studyInfo.startDate && studyInfo.endDate && (
                <span className="font-designer-13r text-text-subtlest">
                  {studyInfo.startDate} ~ {studyInfo.endDate}
                </span>
              )}
            </div>
            <Modal.CloseButton />
          </Modal.Header>

            <Modal.Body className="flex flex-col gap-400">
              {/* 타이틀 */}
              <div className="flex flex-col items-center gap-75">
                <h2 className="font-designer-20b text-text-strong text-center">
                  스터디 전체 경험은 어떠셨나요?
                </h2>
                <p className="font-designer-14r text-text-subtle text-center">
                  성장하는 스터디 문화를 위해 소중한 의견을 들려주세요.
                </p>
              </div>

              {/* 스터디 만족도 */}
              <div className="flex flex-col items-center gap-150">
                <span className="font-designer-16b text-text-default">
                  스터디 만족도
                </span>
                <div className="flex items-center justify-center gap-300">
                  {/* 좋았어요 왼쪽, 아쉬웠어요 오른쪽 */}
                  <SatisfactionEmojiButton
                    label="좋았어요"
                    emoji="😊"
                    isSelected={form.satisfaction === 'GOOD'}
                    onClick={() => handleSatisfactionChange('GOOD')}
                  />
                  <SatisfactionEmojiButton
                    label="아쉬웠어요"
                    emoji="😅"
                    isSelected={form.satisfaction === 'DISAPPOINTED'}
                    onClick={() => handleSatisfactionChange('DISAPPOINTED')}
                  />
                </div>
              </div>

              {/* 세부 평가 항목 선택 */}
              {form.satisfaction && (
                <div className="flex flex-col gap-150">
                  <div className="flex items-center justify-center gap-100">
                    <span className="font-designer-16b text-text-default">
                      {itemsLabel}
                    </span>
                    <span className="font-designer-13m text-text-error">
                      필수
                    </span>
                  </div>
                  <List className="mx-auto w-full">
                    {currentItems.map((item, idx) => (
                      <List.Item key={idx}>
                        <Checkbox
                          id={`exp-review-item-${idx}`}
                          checked={form.selectedItemIndices.includes(idx)}
                          onToggle={() => handleItemToggle(idx)}
                        />
                        <label
                          htmlFor={`exp-review-item-${idx}`}
                          className="font-designer-14m text-text-subtle cursor-pointer"
                        >
                          {item}
                        </label>
                      </List.Item>
                    ))}
                  </List>
                </div>
              )}

              {/* 자유 의견 */}
              <div className="flex flex-col gap-100">
                <div className="flex items-center justify-center gap-100">
                  <span className="font-designer-16b text-text-default text-center">
                    더 자세한 의견을 들려주세요.
                  </span>
                  <span className="font-designer-13m text-text-error">필수</span>
                </div>
                <div className="flex flex-col gap-50">
                  <textarea
                    value={form.content}
                    onChange={handleContentChange}
                    placeholder="전반적인 스터디 경험에 대한 자유로운 의견을 작성해주세요. (최소 20자)"
                    className={cn(
                      'rounded-100 border-border-default border p-150',
                      'font-designer-14r text-text-default',
                      'placeholder:text-text-subtlest',
                      'h-[120px] w-full resize-none',
                      'focus:border-border-brand focus:outline-none',
                    )}
                    maxLength={MAX_CONTENT_LENGTH}
                  />
                  <div className="flex justify-between">
                    {contentError ? (
                      <p className="font-designer-13r text-text-error">
                        {contentError}
                      </p>
                    ) : (
                      <div />
                    )}
                    <span className="font-designer-13r text-text-subtlest">
                      {form.content.length}/{MAX_CONTENT_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              {/* 전체 별점 평가 */}
              <div className="flex flex-col items-center gap-150">
                <div className="flex items-center justify-center gap-100">
                  <span className="font-designer-16b text-text-default">
                    스터디 전체 만족도 평가
                  </span>
                  <span className="font-designer-13m text-text-error">필수</span>
                </div>
                <StarRatingInput
                  value={form.rating}
                  onChange={(rating) =>
                    setForm((prev) => ({ ...prev, rating }))
                  }
                />
              </div>

              {/* 격려 문구 */}
              <div className="flex flex-col items-center">
                <p className="font-designer-14r text-text-subtle text-center">
                  함께 달려온 시간, 정말 수고 많으셨어요! 🎉
                  <br />
                  남겨주신 한 마디가 더 나은 스터디를 만드는 힘이 됩니다.
                </p>
              </div>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-100">
              <Button
                color="secondary"
                size="large"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button
                color="primary"
                size="large"
                disabled={!isFormValid}
                onClick={handleSubmit}
              >
                제출하기
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal.Portal>
      </Modal.Root>

      {/* 제출 완료 성공 모달 */}
      <ReviewSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        studyType={studyType}
      />
    </>
  );
}

function SatisfactionEmojiButton({
  label,
  emoji,
  isSelected,
  onClick,
}: {
  label: string;
  emoji: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-fit cursor-pointer flex-col items-center gap-75"
      onClick={onClick}
    >
      <span
        className={cn(
          'font-designer-14m transition-colors',
          isSelected ? 'text-fill-brand-default-default' : 'text-text-subtlest',
        )}
      >
        {label}
      </span>
      <div
        className={cn(
          'flex h-[52px] w-[52px] items-center justify-center rounded-full text-[28px] transition-all',
          isSelected
            ? 'bg-fill-neutral-default-default scale-110'
            : 'bg-fill-neutral-subtle-default opacity-50 hover:opacity-80',
        )}
      >
        {emoji}
      </div>
    </button>
  );
}

function ReviewSuccessModal({
  open,
  onOpenChange,
  studyType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studyType: 'GROUP_STUDY' | 'PREMIUM_STUDY';
}) {
  const router = useRouter();

  const handleGroupStudy = () => {
    onOpenChange(false);
    router.push('/group-study');
  };

  const handlePremiumStudy = () => {
    onOpenChange(false);
    router.push('/premium-study');
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content
          className={cn(
            'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)] max-w-[400px]',
            'rounded-150',
          )}
          description="후기 제출 완료"
        >
          <Modal.Body className="flex flex-col items-center gap-300 py-500 px-400 text-center">
            <div className="text-[56px]">🎊</div>
            <div className="flex flex-col gap-100">
              <h2 className="font-designer-22b text-text-strong">
                스터디 완주를 축하합니다!
              </h2>
              <p className="font-designer-14r text-text-subtle">
                나에게 맞는 새로운 스터디를 탐색해보세요.
              </p>
            </div>

            <div className="mt-100 grid w-full grid-cols-2 gap-150">
              <Button
                color="secondary"
                size="large"
                className="w-full"
                onClick={handleGroupStudy}
              >
                동료들과 공부하기
              </Button>
              <Button
                color="primary"
                size="large"
                className="w-full"
                onClick={handlePremiumStudy}
              >
                멘토님과 공부하기
              </Button>
            </div>
          </Modal.Body>
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function fireConfetti() {
  import('canvas-confetti')
    .then((module) => {
      const confetti = module.default;

      const count = 300;
      const defaults = { origin: { y: 0.5 }, zIndex: 9999 };

      function fire(particleRatio: number, opts: Record<string, unknown>) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        }).catch(() => {
          // Silently ignore confetti errors
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#FF5C5C', '#FF9900', '#FFD700'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#00C2FF', '#9B51E0', '#FF5C5C'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#FF9900', '#00C2FF', '#4CAF50'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
        colors: ['#FFD700', '#9B51E0'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ['#FF5C5C', '#00C2FF'],
      });
    })
    .catch(() => {
      // Silently ignore confetti import errors
    });
}
