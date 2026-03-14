'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertMyMentorSettings } from '@/features/mentoring/api/mentor-api';
import type { MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';
import { mentorDirectoryQueryKeys } from './mentor-directory-query-keys';

export const useUpsertMyMentorSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      registrationOptions,
      persistedPredefinedCoreKeywords,
    }: {
      values: MentorRegistrationFormValues;
      registrationOptions: MentorRegistrationOptions;
      persistedPredefinedCoreKeywords?: ReadonlyArray<{
        code: string;
        label: string;
      }>;
    }) =>
      upsertMyMentorSettings({
        values,
        registrationOptions,
        persistedPredefinedCoreKeywords,
      }),
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
    onError: () => undefined,
  });
};
