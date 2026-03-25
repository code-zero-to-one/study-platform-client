'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markMentorEntryOnboardingSeen } from '@/features/mentoring/api/mentor-api';
import { mentorDirectoryQueryKeys } from '@/features/mentoring/model/directory/mentor-directory-query-keys';

export const useMarkMentorEntryOnboardingSeenMutation = (
  memberId: number | undefined,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markMentorEntryOnboardingSeen(),
    onSuccess: async (status) => {
      if (!memberId) {
        return;
      }

      queryClient.setQueryData(
        mentorDirectoryQueryKeys.entryOnboarding(memberId),
        status,
      );
    },
  });
};
