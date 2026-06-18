'use client';

import {
  getCommunityQnaAccessDeniedMessage,
  getCommunityQnaAuthRequiredMessage,
  getCommunityQnaErrorMessage,
  isCommunityQnaAccessDeniedError,
  isCommunityQnaAuthRequiredError,
  isCommunityQnaNotFoundError,
  isCommunityQnaSelfAcceptanceError,
} from '@/features/community/api/community-qna-api';
import {
  useAcceptCommunityQnaAnswerMutation,
  useClearCommunityQnaAnswerAcceptanceMutation,
} from '@/features/community/model/use-community-qna-mutation';
import { useToastStore } from '@/stores/use-toast-store';
import type { CommunityQnaAnswerItem } from '@/types/community/qna-domain';

const COMMUNITY_QNA_FIRST_PAGE = 1;

interface UseCommunityQnaAnswerAcceptanceControllerParams {
  answer: CommunityQnaAnswerItem;
  canAcceptAnswer: boolean;
  currentAcceptedAnswerId?: number;
  currentAnswerPage: number;
  onChangeAnswerPage: (page: number) => void;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
}

export const useCommunityQnaAnswerAcceptanceController = ({
  answer,
  canAcceptAnswer,
  currentAcceptedAnswerId,
  currentAnswerPage,
  onChangeAnswerPage,
  onRefetchQuestionDetail,
  questionId,
}: UseCommunityQnaAnswerAcceptanceControllerParams) => {
  const showToast = useToastStore((state) => state.showToast);
  const acceptMutation = useAcceptCommunityQnaAnswerMutation();
  const clearAcceptanceMutation =
    useClearCommunityQnaAnswerAcceptanceMutation();
  const isPending =
    acceptMutation.isPending || clearAcceptanceMutation.isPending;

  const syncAfterAcceptanceChange = async () => {
    if (currentAnswerPage !== COMMUNITY_QNA_FIRST_PAGE) {
      onChangeAnswerPage(COMMUNITY_QNA_FIRST_PAGE);

      return;
    }

    await onRefetchQuestionDetail();
  };

  const handleAcceptAnswer = async () => {
    try {
      await acceptMutation.mutateAsync({
        questionId,
        answerId: answer.id,
      });
      await syncAfterAcceptanceChange();
      showToast(
        answer.isAccepted
          ? '채택 상태를 다시 확인했습니다.'
          : currentAcceptedAnswerId
            ? '답변을 재채택했습니다.'
            : '답변을 채택했습니다.',
      );
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(getCommunityQnaAuthRequiredMessage('답변을 채택'), 'info');

        return;
      }

      if (isCommunityQnaSelfAcceptanceError(error)) {
        await onRefetchQuestionDetail();
        showToast('자신의 답변은 채택할 수 없습니다.', 'error');

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        showToast(getCommunityQnaAccessDeniedMessage('답변을 채택'), 'error');

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          '질문 또는 답변을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '답변 채택에 실패했습니다.'),
        'error',
      );
    }
  };

  const handleClearAcceptance = async () => {
    try {
      await clearAcceptanceMutation.mutateAsync({
        questionId,
        answerId: answer.id,
      });
      await syncAfterAcceptanceChange();
      showToast('답변 채택을 해제했습니다.');
    } catch (error) {
      if (isCommunityQnaAuthRequiredError(error)) {
        showToast(
          getCommunityQnaAuthRequiredMessage('답변 채택을 해제'),
          'info',
        );

        return;
      }

      if (isCommunityQnaAccessDeniedError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          getCommunityQnaAccessDeniedMessage('답변 채택을 해제'),
          'error',
        );

        return;
      }

      if (isCommunityQnaNotFoundError(error)) {
        await onRefetchQuestionDetail();
        showToast(
          '질문 또는 답변을 찾을 수 없습니다. 최신 상태를 다시 확인해 주세요.',
          'error',
        );

        return;
      }

      showToast(
        getCommunityQnaErrorMessage(error, '답변 채택 해제에 실패했습니다.'),
        'error',
      );
    }
  };

  const acceptLabel = answer.isAccepted
    ? '채택된 답변'
    : currentAcceptedAnswerId
      ? '이 답변으로 재채택'
      : '이 답변 채택';

  return {
    state: {
      isPending,
    },
    actions: {
      handleAcceptAnswer,
      handleClearAcceptance,
    },
    viewModel: {
      acceptLabel,
      canShowActions: canAcceptAnswer,
      isAccepted: answer.isAccepted,
    },
  };
};
