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
  selectableReviewItemIds: number[];
  content: string;
  rating: number;
}

export const MIN_CONTENT_LENGTH = 20;

const INITIAL_FORM: ReviewFormState = {
  satisfaction: undefined,
  selectableReviewItemIds: [],
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
}: {
  open: boolean;
  groupStudyId: number;
  onClose: () => void;
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
    form.selectableReviewItemIds.length > 0 &&
    trimmedContentLength >= MIN_CONTENT_LENGTH &&
    form.rating > 0;

  const contentError =
    hasAttemptedSubmit && trimmedContentLength < MIN_CONTENT_LENGTH
      ? `최소 ${MIN_CONTENT_LENGTH}자 이상 입력해주세요.`
      : undefined;

  // 선택된 만족도에 해당하는 항목 목록 (id 없는 항목 제외)
  const currentItems = form.satisfaction
    ? selectableItems?.[
        SATISFACTION_ITEMS[form.satisfaction].itemsKey
      ]?.filter(
        (item): item is SelectableReviewItem & { id: number } =>
          item.id !== undefined,
      )
    : undefined;

  const itemsLabel = form.satisfaction
    ? SATISFACTION_ITEMS[form.satisfaction].itemsLabel
    : '';

  const handleSatisfactionChange = (next: ReviewSatisfaction) => {
    setForm((prev) => ({
      ...prev,
      satisfaction: next,
      selectableReviewItemIds: [], // 만족도 전환 시 선택 항목 초기화
    }));
  };

  const handleItemToggle = (id: number) => {
    setForm((prev) => {
      const isSelected = prev.selectableReviewItemIds.includes(id);

      return {
        ...prev,
        selectableReviewItemIds: isSelected
          ? prev.selectableReviewItemIds.filter((i) => i !== id)
          : [...prev.selectableReviewItemIds, id],
      };
    });
  };

  const handleSubmit = () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || !form.satisfaction) return;

    const { satisfaction, selectableReviewItemIds, content, rating } = form;

    createReview(
      {
        groupStudyId,
        request: { satisfaction, selectableReviewItemIds, content, rating },
      },
      {
        onSuccess: () => {
          showToast('후기가 작성되었습니다.', 'success');
          onClose();
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
