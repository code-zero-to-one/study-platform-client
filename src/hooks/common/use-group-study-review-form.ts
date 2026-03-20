import { useEffect, useState } from 'react';

import {
  useCreateGroupStudyReview,
  useGetGroupStudyReviewSelectableItems,
} from '@/hooks/queries/group-study-review-api';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  ReviewSatisfaction,
  SelectableReviewItem,
  SelectableReviewItemListResponse,
} from '@/types/api/group-study-review.types';

interface ReviewFormState {
  satisfaction: ReviewSatisfaction | undefined;
  selectedCodes: string[];
  content: string;
  rating: number;
}

export const MIN_CONTENT_LENGTH = 20;

const INITIAL_FORM: ReviewFormState = {
  satisfaction: undefined,
  selectedCodes: [],
  content: '',
  rating: 0,
};

const SATISFACTION_ITEMS: Record<
  ReviewSatisfaction,
  {
    itemsKey: keyof SelectableReviewItemListResponse;
    itemsLabel: string;
  }
> = {
  GOOD: { itemsKey: 'goodItems', itemsLabel: '어떤 점이 좋았나요?' },
  DISAPPOINTED: {
    itemsKey: 'disappointedItems',
    itemsLabel: '어떤 점이 아쉬웠나요?',
  },
};

export function useGroupStudyReviewForm({
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
  const [form, setForm] = useState<ReviewFormState>(INITIAL_FORM);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const showToast = useToastStore((state) => state.showToast);
  const { data: selectableItems } = useGetGroupStudyReviewSelectableItems();
  const { mutate: createReview, isPending } = useCreateGroupStudyReview();

  // 모달 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      setForm(INITIAL_FORM);
      setHasAttemptedSubmit(false);
    }
  }, [open]);

  const trimmedContentLength = form.content.trim().length;

  const isFormValid =
    form.satisfaction !== undefined &&
    form.selectedCodes.length > 0 &&
    trimmedContentLength >= MIN_CONTENT_LENGTH &&
    form.rating > 0;

  const contentError =
    hasAttemptedSubmit && trimmedContentLength < MIN_CONTENT_LENGTH
      ? `최소 ${MIN_CONTENT_LENGTH}자 이상 입력해주세요.`
      : undefined;

  // 선택된 만족도에 해당하는 항목 목록 (code 없는 항목 제외)
  const currentItems = form.satisfaction
    ? selectableItems?.[SATISFACTION_ITEMS[form.satisfaction].itemsKey]?.filter(
        (item): item is SelectableReviewItem & { code: string } =>
          item.code !== undefined,
      )
    : undefined;

  const itemsLabel = form.satisfaction
    ? SATISFACTION_ITEMS[form.satisfaction].itemsLabel
    : '';

  const handleSatisfactionChange = (next: ReviewSatisfaction) => {
    setForm((prev) => ({
      ...prev,
      satisfaction: next,
      selectedCodes: [],
    }));
  };

  const handleItemToggle = (code: string) => {
    setForm((prev) => {
      const isSelected = prev.selectedCodes.includes(code);

      return {
        ...prev,
        selectedCodes: isSelected
          ? prev.selectedCodes.filter((selectedCode) => selectedCode !== code)
          : [...prev.selectedCodes, code],
      };
    });
  };

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || !form.satisfaction) return;

    const { satisfaction, selectedCodes, content, rating } = form;

    createReview(
      {
        groupStudyId,
        request: {
          satisfaction,
          selectableReviewItemCodes: selectedCodes,
          content,
          rating: Math.round(rating), // 반별점(0.5 단위) → 백엔드 정수 변환
        },
      },
      {
        onSuccess: () => {
          showToast('후기가 작성되었습니다.', 'success');
          onClose();
          onSubmitSuccess?.();
        },
      },
    );
  };

  return {
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
  };
}
