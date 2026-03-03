'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import {
  getRequestReviewEligibility,
  useMentoringManagementStore,
} from '@/stores/useMentoringManagementStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringReviewRecommendation,
  MentoringSession,
} from '@/types/mentoring/management-domain';

export type ReviewCardStatus = 'READY' | 'WRITTEN' | 'LOCKED';

export interface ReviewCardItem {
  mentor: MentorProfile | undefined;
  request: MentoringRequest;
  session?: MentoringSession;
  review?: MentoringReview;
  status: ReviewCardStatus;
  blockedReason?: string;
}

interface ReviewDraft {
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
}

interface ActiveDraftKey {
  mentorId: number;
  requestId: string;
}

export interface MyMentoringReviewControllerState {
  items: ReviewCardItem[];
  activeItem?: ReviewCardItem;
  draft: ReviewDraft;
  formError: string;
  isModalOpen: boolean;
}

export interface MyMentoringReviewControllerActions {
  onOpenDraft: (item: ReviewCardItem) => void;
  onCloseDraft: () => void;
  onModalOpenChange: (open: boolean) => void;
  onDraftRatingChange: (rating: number) => void;
  onDraftRecommendationChange: (
    recommendation: MentoringReviewRecommendation,
  ) => void;
  onDraftContentChange: (content: string) => void;
  onSubmit: () => void;
}

export interface MyMentoringReviewControllerViewModel {
  readyCount: number;
  writtenCount: number;
  isSubmitDisabled: boolean;
}

export const MIN_MY_MENTORING_REVIEW_LENGTH = 10;

const statusOrder: Record<ReviewCardStatus, number> = {
  READY: 0,
  WRITTEN: 1,
  LOCKED: 2,
};

const createDefaultDraft = (): ReviewDraft => {
  return {
    rating: 0,
    recommendation: 'RECOMMEND',
    content: '',
  };
};

export const useMyMentoringReviewController = () => {
  const { memberId } = useAuthReady();
  const { data: mentorsData } = useMentorDirectoryListQuery();
  const mentors = useMemo(() => mentorsData ?? [], [mentorsData]);
  const { showToast } = useToastStore();
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const sessionsByMentor = useMentoringManagementStore(
    (state) => state.sessionsByMentor,
  );
  const reviewsByMentor = useMentoringManagementStore(
    (state) => state.reviewsByMentor,
  );
  const submitReview = useMentoringManagementStore(
    (state) => state.submitReview,
  );
  const [activeDraftKey, setActiveDraftKey] = useState<ActiveDraftKey | null>(
    null,
  );
  const [draft, setDraft] = useState<ReviewDraft>(createDefaultDraft());
  const [formError, setFormError] = useState('');

  const mentorMap = useMemo(() => {
    return new Map<number, MentorProfile>(
      mentors.map((mentor) => [mentor.id, mentor]),
    );
  }, [mentors]);

  const items = useMemo(() => {
    if (!memberId) {
      return [] as ReviewCardItem[];
    }

    return Object.entries(requestsByMentor)
      .flatMap(([mentorIdKey, requests]) => {
        const mentorId = Number(mentorIdKey);
        const mentor = mentorMap.get(mentorId);
        const sessions = sessionsByMentor[mentorId] ?? [];
        const reviews = reviewsByMentor[mentorId] ?? [];

        return requests
          .filter((request) => request.menteeMemberId === memberId)
          .map((request) => {
            const linkedSession = request.linkedSessionId
              ? sessions.find(
                  (session) => session.id === request.linkedSessionId,
                )
              : undefined;
            const linkedReview = reviews.find((review) => {
              return (
                review.requestId === request.id &&
                review.menteeMemberId === memberId
              );
            });
            const eligibility = getRequestReviewEligibility({
              request,
              session: linkedSession,
            });
            const status: ReviewCardStatus = linkedReview
              ? 'WRITTEN'
              : eligibility.canReview
                ? 'READY'
                : 'LOCKED';

            return {
              mentor,
              request,
              session: linkedSession,
              review: linkedReview,
              status,
              blockedReason: eligibility.reason,
            } satisfies ReviewCardItem;
          });
      })
      .sort((first, second) => {
        const byStatus = statusOrder[first.status] - statusOrder[second.status];
        if (byStatus !== 0) {
          return byStatus;
        }

        return (
          dayjs(second.request.requestedAt).valueOf() -
          dayjs(first.request.requestedAt).valueOf()
        );
      });
  }, [
    memberId,
    mentorMap,
    requestsByMentor,
    reviewsByMentor,
    sessionsByMentor,
  ]);

  const readyCount = useMemo(() => {
    return items.filter((item) => item.status === 'READY').length;
  }, [items]);
  const writtenCount = useMemo(() => {
    return items.filter((item) => item.status === 'WRITTEN').length;
  }, [items]);

  const activeItem = useMemo(() => {
    if (!activeDraftKey) {
      return undefined;
    }

    return items.find((item) => {
      return (
        item.request.mentorId === activeDraftKey.mentorId &&
        item.request.id === activeDraftKey.requestId
      );
    });
  }, [activeDraftKey, items]);

  useEffect(() => {
    if (!activeItem) {
      setDraft(createDefaultDraft());
      setFormError('');

      return;
    }

    if (activeItem.review) {
      setDraft({
        rating: activeItem.review.rating,
        recommendation: activeItem.review.recommendation,
        content: activeItem.review.content,
      });
    } else {
      setDraft(createDefaultDraft());
    }
    setFormError('');
  }, [activeItem]);

  const handleOpenDraft = useCallback((item: ReviewCardItem) => {
    if (item.status === 'LOCKED') {
      return;
    }

    setActiveDraftKey({
      mentorId: item.request.mentorId,
      requestId: item.request.id,
    });
  }, []);

  const handleCloseDraft = useCallback(() => {
    setActiveDraftKey(null);
  }, []);

  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleCloseDraft();
      }
    },
    [handleCloseDraft],
  );

  const handleDraftRatingChange = useCallback((rating: number) => {
    setDraft((previous) => ({ ...previous, rating }));
  }, []);

  const handleDraftRecommendationChange = useCallback(
    (recommendation: MentoringReviewRecommendation) => {
      setDraft((previous) => ({ ...previous, recommendation }));
    },
    [],
  );

  const handleDraftContentChange = useCallback((content: string) => {
    setDraft((previous) => ({ ...previous, content }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!activeItem || !memberId) {
      return;
    }

    const result = submitReview({
      mentorId: activeItem.request.mentorId,
      requestId: activeItem.request.id,
      menteeMemberId: memberId,
      menteeName: activeItem.request.menteeName,
      rating: draft.rating,
      recommendation: draft.recommendation,
      content: draft.content,
    });

    if (!result.ok) {
      const reason = result.reason ?? '후기 등록에 실패했습니다.';
      setFormError(reason);
      showToast(reason, 'error');

      return;
    }

    showToast(
      result.isUpdated ? '후기를 수정했습니다.' : '후기를 등록했습니다.',
      'success',
    );
    handleCloseDraft();
  }, [activeItem, draft, handleCloseDraft, memberId, showToast, submitReview]);

  return {
    state: {
      items,
      activeItem,
      draft,
      formError,
      isModalOpen: !!activeItem,
    } satisfies MyMentoringReviewControllerState,
    actions: {
      onOpenDraft: handleOpenDraft,
      onCloseDraft: handleCloseDraft,
      onModalOpenChange: handleModalOpenChange,
      onDraftRatingChange: handleDraftRatingChange,
      onDraftRecommendationChange: handleDraftRecommendationChange,
      onDraftContentChange: handleDraftContentChange,
      onSubmit: handleSubmit,
    } satisfies MyMentoringReviewControllerActions,
    viewModel: {
      readyCount,
      writtenCount,
      isSubmitDisabled:
        draft.rating < 1 ||
        draft.content.trim().length < MIN_MY_MENTORING_REVIEW_LENGTH,
    } satisfies MyMentoringReviewControllerViewModel,
  };
};
