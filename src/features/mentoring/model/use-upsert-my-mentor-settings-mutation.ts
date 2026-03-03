'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertMyMentorSettings } from '@/features/mentoring/api/mentor-api';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';
import { mentorDirectoryQueryKeys } from './mentor-directory-query-keys';

export const useUpsertMyMentorSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MentorRegistrationFormValues) =>
      upsertMyMentorSettings(values),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: mentorDirectoryQueryKeys.directories(),
      });
      await queryClient.invalidateQueries({
        queryKey: mentorDirectoryQueryKeys.mySettings(),
      });
      await queryClient.invalidateQueries({
        queryKey: mentorDirectoryQueryKeys.detail(result.mentorId),
      });
    },
  });
};
