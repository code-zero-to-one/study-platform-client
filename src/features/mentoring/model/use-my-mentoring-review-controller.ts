'use client';

import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMentorDirectoryListQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useUpsertMentoringReviewMutation } from '@/features/mentoring/model/use-mentoring-lifecycle-mutations';
import { useMyMentoringDashboardQuery } from '@/features/mentoring/model/use-my-mentoring-dashboard-query';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
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
  const { data: mentorsData } = useMentorDirectoryListQuery({
    page: 0,
    size: 100,
  });
  const dashboardQuery = useMyMentoringDashboardQuery({
    enabled: Boolean(memberId),
    page: 0,
    size: 100,
  });
  const mentors = useMemo(() => mentorsData?.mentors ?? [], [mentorsData]);
  const { showToast } = useToastStore();
  const upsertReviewMutation = useUpsertMentoringReviewMutation();
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

    return Object.entries(dashboardQuery.requestsByMentor)
      .flatMap(([mentorIdKey, requests]) => {
        const mentorId = Number(mentorIdKey);
        const mentor = mentorMap.get(mentorId);
        const sessions = dashboardQuery.sessionsByMentor[mentorId] ?? [];
        const reviews = dashboardQuery.reviewsByMentor[mentorId] ?? [];

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
            const dashboardItem = dashboardQuery.data?.items.find((item) => {
              return item.request.id === request.id;
            });
            const eligibility = dashboardItem?.reviewEligibility ?? {
              canReview: false,
              reason: '상담 종료 후 작성할 수 있습니다.',
              isCompleted: false,
            };
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
    dashboardQuery.data?.items,
    dashboardQuery.requestsByMentor,
    dashboardQuery.reviewsByMentor,
    dashboardQuery.sessionsByMentor,
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

  const handleSubmit = useCallback(async () => {
    if (!activeItem || !memberId) {
      return;
    }

    try {
      const result = await upsertReviewMutation.mutateAsync({
        mentorId: activeItem.request.mentorId,
        requestId: activeItem.request.id,
        menteeMemberId: memberId,
        menteeName: activeItem.request.menteeName,
        rating: draft.rating,
        recommendation: draft.recommendation,
        content: draft.content,
      });
      showToast(
        result.isUpdated ? '후기를 수정했습니다.' : '후기를 등록했습니다.',
        'success',
      );
      handleCloseDraft();
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : '후기 등록에 실패했습니다.';
      setFormError(reason);
      showToast(reason, 'error');
    }
  }, [
    activeItem,
    draft,
    handleCloseDraft,
    memberId,
    showToast,
    upsertReviewMutation,
  ]);

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
