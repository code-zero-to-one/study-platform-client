'use client';

import { useMentorJoinController } from '@/features/mentoring/model/use-mentor-join-controller';
import MentorJoinCard from './mentor-join-card';

export default function MentorJoinCardContainer() {
  const { state, actions, viewModel } = useMentorJoinController();

  return (
    <MentorJoinCard
      memberId={viewModel.memberId}
      shouldRenderVerificationModal={viewModel.shouldRenderVerificationModal}
      isVerificationModalOpen={state.isVerificationModalOpen}
      isJoinButtonDisabled={viewModel.isJoinButtonDisabled}
      onClickJoin={actions.onClickJoin}
      onVerificationModalOpenChange={actions.onVerificationModalOpenChange}
      onVerificationComplete={actions.onVerificationComplete}
    />
  );
}
