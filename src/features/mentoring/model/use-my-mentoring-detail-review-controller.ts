'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUpsertMentoringReviewMutation } from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { MIN_MY_MENTORING_REVIEW_LENGTH } from '@/features/mentoring/model/use-my-mentoring-review-controller';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringReviewEligibility,
  MentoringReviewRecommendation,
} from '@/types/mentoring/management-domain';

interface DetailReviewDraft {
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
}

const createDefaultDraft = (): DetailReviewDraft => {
  return {
    rating: 0,
    recommendation: 'RECOMMEND',
    content: '',
  };
};

const createDraftFromReview = (
  review?: MentoringReview,
): DetailReviewDraft => {
  if (!review) {
    return createDefaultDraft();
  }

  return {
    rating: review.rating,
    recommendation: review.recommendation,
    content: review.content,
  };
};

export const useMyMentoringDetailReviewController = ({
  request,
  review,
  reviewEligibility,
}: {
  request?: MentoringRequest;
  review?: MentoringReview;
  reviewEligibility?: MentoringReviewEligibility;
}) => {
  const { showToast } = useToastStore();
  const upsertReviewMutation = useUpsertMentoringReviewMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<DetailReviewDraft>(createDefaultDraft());
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(createDraftFromReview(review));
    setFormError('');
  }, [isOpen, review]);

  const canOpen = useMemo(() => {
    return Boolean(review) || reviewEligibility?.canReview === true;
  }, [review, reviewEligibility?.canReview]);

  const open = useCallback(() => {
    if (!request) {
      return;
    }

    if (!canOpen) {
      showToast(
        reviewEligibility?.reason ?? '후기를 작성할 수 없는 상태입니다.',
        'error',
      );

      return;
    }

    setDraft(createDraftFromReview(review));
    setFormError('');
    setIsOpen(true);
  }, [canOpen, request, review, reviewEligibility?.reason, showToast]);

  const close = useCallback(() => {
    setIsOpen(false);
    setFormError('');
  }, []);

  const setRating = useCallback((rating: number) => {
    setDraft((previous) => ({ ...previous, rating }));
  }, []);

  const setRecommendation = useCallback(
    (recommendation: MentoringReviewRecommendation) => {
      setDraft((previous) => ({ ...previous, recommendation }));
    },
    [],
  );

  const setContent = useCallback((content: string) => {
    setDraft((previous) => ({ ...previous, content }));
  }, []);

  const isSubmitDisabled = useMemo(() => {
    return (
      draft.rating < 1 ||
      draft.content.trim().length < MIN_MY_MENTORING_REVIEW_LENGTH ||
      !request ||
      typeof request.menteeMemberId !== 'number'
    );
  }, [draft.content, draft.rating, request, request?.menteeMemberId]);

  const submit = useCallback(async () => {
    if (!request || typeof request.menteeMemberId !== 'number') {
      return;
    }

    if (isSubmitDisabled) {
      const nextError =
        draft.content.trim().length < MIN_MY_MENTORING_REVIEW_LENGTH
          ? `후기는 최소 ${MIN_MY_MENTORING_REVIEW_LENGTH}자 이상 작성해주세요.`
          : '별점을 선택해주세요.';

      setFormError(nextError);
      showToast(nextError, 'error');

      return;
    }

    try {
      const result = await upsertReviewMutation.mutateAsync({
        mentorId: request.mentorId,
        requestId: request.id,
        menteeMemberId: request.menteeMemberId,
        menteeName: request.menteeName,
        rating: draft.rating,
        recommendation: draft.recommendation,
        content: draft.content.trim(),
      });

      showToast(
        result.isUpdated ? '후기를 수정했습니다.' : '후기를 등록했습니다.',
        'success',
      );
      close();
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : '후기 등록에 실패했습니다.';
      setFormError(reason);
      showToast(reason, 'error');
    }
  }, [close, draft, isSubmitDisabled, request, showToast, upsertReviewMutation]);

  return {
    state: {
      isOpen,
      draft,
      formError,
    },
    viewModel: {
      canOpen,
      isSubmitDisabled,
      isSubmitting: upsertReviewMutation.isPending,
      minimumLength: MIN_MY_MENTORING_REVIEW_LENGTH,
    },
    actions: {
      open,
      close,
      onOpenChange: (nextOpen: boolean) => {
        if (nextOpen) {
          open();

          return;
        }

        close();
      },
      onRatingChange: setRating,
      onRecommendationChange: setRecommendation,
      onContentChange: setContent,
      onSubmit: (): void => {
        void submit();
      },
    },
  };
};
