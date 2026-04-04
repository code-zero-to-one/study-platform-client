'use client';

import Button from '@/components/common/ui/button';
import { useCommunityQnaAnswerAcceptanceController } from '@/features/community/model/use-community-qna-answer-acceptance-controller';
import type { CommunityQnaAnswerItem } from '@/types/community/qna-domain';

interface CommunityQnaAnswerAcceptanceActionsProps {
  answer: CommunityQnaAnswerItem;
  canAcceptAnswer: boolean;
  currentAcceptedAnswerId?: number;
  currentAnswerPage: number;
  onChangeAnswerPage: (page: number) => void;
  onRefetchQuestionDetail: () => Promise<unknown>;
  questionId: number;
}

export default function CommunityQnaAnswerAcceptanceActions({
  answer,
  canAcceptAnswer,
  currentAcceptedAnswerId,
  currentAnswerPage,
  onChangeAnswerPage,
  onRefetchQuestionDetail,
  questionId,
}: CommunityQnaAnswerAcceptanceActionsProps) {
  const { state, actions, viewModel } =
    useCommunityQnaAnswerAcceptanceController({
      answer,
      canAcceptAnswer,
      currentAcceptedAnswerId,
      currentAnswerPage,
      onChangeAnswerPage,
      onRefetchQuestionDetail,
      questionId,
    });

  if (!viewModel.canShowActions) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-75">
      {viewModel.isAccepted ? (
        <Button
          type="button"
          color="secondary"
          size="small"
          loading={state.isPending}
          onClick={actions.handleClearAcceptance}
        >
          채택 해제
        </Button>
      ) : (
        <Button
          type="button"
          color="primary"
          size="small"
          loading={state.isPending}
          onClick={actions.handleAcceptAnswer}
        >
          {viewModel.acceptLabel}
        </Button>
      )}
    </div>
  );
}
