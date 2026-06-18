'use client';

import { useEffect, useRef, useState } from 'react';
import { useMentorEntryOnboardingStatusQuery } from '@/features/mentoring/model/directory/use-mentor-directory-query';
import type { MentorRegistrationGuardState } from '@/types/mentoring/registration-view';

interface UseMentorRegistrationEntryOnboardingStateParams {
  memberId: number | undefined;
  isHydrated: boolean;
  isAuthenticated: boolean;
  canWriteMentorProfile: boolean;
  isEntryFromMentoringList: boolean;
  guardState: MentorRegistrationGuardState;
}

export const useMentorRegistrationEntryOnboardingState = ({
  memberId,
  isHydrated,
  isAuthenticated,
  canWriteMentorProfile,
  isEntryFromMentoringList,
  guardState,
}: UseMentorRegistrationEntryOnboardingStateParams) => {
  const mentorEntryOnboardingStatusQuery = useMentorEntryOnboardingStatusQuery(
    memberId,
    isHydrated &&
      isAuthenticated &&
      canWriteMentorProfile &&
      Boolean(memberId) &&
      isEntryFromMentoringList,
  );
  const [isEntryOnboardingOpen, setIsEntryOnboardingOpen] = useState(false);
  const [isEntryOnboardingResolved, setIsEntryOnboardingResolved] =
    useState(false);
  const entryOnboardingInitializedRef = useRef(false);

  useEffect(() => {
    entryOnboardingInitializedRef.current = false;
    setIsEntryOnboardingResolved(!isEntryFromMentoringList);
    setIsEntryOnboardingOpen(false);
  }, [isEntryFromMentoringList, memberId]);

  useEffect(() => {
    if (entryOnboardingInitializedRef.current) {
      return;
    }

    if (
      !isHydrated ||
      !isAuthenticated ||
      !memberId ||
      !canWriteMentorProfile ||
      !isEntryFromMentoringList
    ) {
      return;
    }

    if (
      mentorEntryOnboardingStatusQuery.isLoading ||
      mentorEntryOnboardingStatusQuery.isFetching
    ) {
      return;
    }

    entryOnboardingInitializedRef.current = true;
    setIsEntryOnboardingResolved(true);

    if (mentorEntryOnboardingStatusQuery.data?.show === true) {
      setIsEntryOnboardingOpen(true);
    }
  }, [
    canWriteMentorProfile,
    isAuthenticated,
    isEntryFromMentoringList,
    isHydrated,
    memberId,
    mentorEntryOnboardingStatusQuery.data?.show,
    mentorEntryOnboardingStatusQuery.isFetching,
    mentorEntryOnboardingStatusQuery.isLoading,
  ]);

  return {
    isEntryOnboardingOpen,
    isEntryOnboardingPending:
      guardState === 'ready' &&
      isEntryFromMentoringList &&
      !isEntryOnboardingResolved,
    setIsEntryOnboardingOpen,
  };
};
