'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markMentorEntryOnboardingSeen } from '@/features/mentoring/api/mentor-api';
import { mentorDirectoryQueryKeys } from './mentor-directory-query-keys';

export const useMarkMentorEntryOnboardingSeenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markMentorEntryOnboardingSeen(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: mentorDirectoryQueryKeys.entryOnboarding(),
      });
    },
  });
};
