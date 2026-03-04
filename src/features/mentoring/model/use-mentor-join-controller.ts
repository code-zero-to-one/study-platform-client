'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MENTORING_LIST_ERROR_MESSAGES } from '@/features/mentoring/const/mentoring-list-labels';
import { useAuthReady } from '@/hooks/common/use-auth';
import { usePhoneVerificationStatus } from '@/hooks/queries/use-phone-verification-status';
import { useToastStore } from '@/stores/use-toast-store';
import { hasMentorWritePermission } from './mentor-permission';

export interface MentorJoinControllerState {
  isVerificationModalOpen: boolean;
}

export interface MentorJoinControllerActions {
  onClickJoin: () => void;
  onVerificationModalOpenChange: (nextOpen: boolean) => void;
  onVerificationComplete: (phoneNumber: string) => void;
}

export interface MentorJoinControllerViewModel {
  memberId: number | undefined;
  shouldRenderVerificationModal: boolean;
  isJoinButtonDisabled: boolean;
}

export const useMentorJoinController = () => {
  const router = useRouter();
  const { showToast } = useToastStore();
  const { isHydrated, isAuthenticated, data, memberId } = useAuthReady();
  const {
    isVerified,
    isLoading: isVerificationLoading,
    isError: isVerificationError,
    setVerified,
  } = usePhoneVerificationStatus(memberId ?? undefined);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const moveToMentorRegistration = () => {
    router.push('/mentoring/become-mentor?entry=mentor-list');
  };

  const handleVerificationComplete = (phoneNumber: string) => {
    setVerified(phoneNumber);
    setIsVerificationModalOpen(false);
    moveToMentorRegistration();
  };

  const handleClickJoin = () => {
    if (!isHydrated) {
      return;
    }

    if (!isAuthenticated) {
      showToast(MENTORING_LIST_ERROR_MESSAGES.loginRequired, 'error');
      router.push('/login');

      return;
    }

    if (!hasMentorWritePermission(data?.roleIds)) {
      showToast(MENTORING_LIST_ERROR_MESSAGES.roleRequired, 'error');

      return;
    }

    if (!memberId) {
      showToast(MENTORING_LIST_ERROR_MESSAGES.memberInfoMissing, 'error');

      return;
    }

    if (isVerificationLoading) {
      return;
    }

    if (isVerificationError) {
      showToast(MENTORING_LIST_ERROR_MESSAGES.verificationUnavailable, 'error');

      return;
    }

    if (!isVerified) {
      showToast(MENTORING_LIST_ERROR_MESSAGES.verificationRequired, 'error');
      setIsVerificationModalOpen(true);

      return;
    }

    moveToMentorRegistration();
  };

  const handleVerificationModalOpenChange = (nextOpen: boolean) => {
    setIsVerificationModalOpen(nextOpen);
  };

  return {
    state: {
      isVerificationModalOpen,
    } satisfies MentorJoinControllerState,
    actions: {
      onClickJoin: handleClickJoin,
      onVerificationModalOpenChange: handleVerificationModalOpenChange,
      onVerificationComplete: handleVerificationComplete,
    } satisfies MentorJoinControllerActions,
    viewModel: {
      memberId,
      shouldRenderVerificationModal: Boolean(memberId),
      isJoinButtonDisabled: !isHydrated || isVerificationLoading,
    } satisfies MentorJoinControllerViewModel,
  };
};
