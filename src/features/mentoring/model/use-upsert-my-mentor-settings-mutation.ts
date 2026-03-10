'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertMyMentorSettings } from '@/features/mentoring/api/mentor-api';
import { shouldUseLocalMentorFallback } from '@/features/mentoring/model/mentor-directory-local-fallback';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useUserStore } from '@/stores/useUserStore';
import type { MentorRegistrationFormValues } from '@/types/schemas/mentor-registration-schema';
import { mentorDirectoryQueryKeys } from './mentor-directory-query-keys';

export const useUpsertMyMentorSettingsMutation = () => {
  const queryClient = useQueryClient();
  const memberId = useUserStore((state) => state.memberId ?? undefined);
  const profileImageUrl = useUserStore((state) => state.profileImageUrl);
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const registerMentorProfile = useMentorDirectoryStore(
    (state) => state.registerMentorProfile,
  );

  return useMutation({
    mutationFn: async (values: MentorRegistrationFormValues) => {
      try {
        return await upsertMyMentorSettings(values);
      } catch (error) {
        if (!memberId || !shouldUseLocalMentorFallback(error)) {
          throw error;
        }

        const existingMentorId = mentorIdByMember[memberId];
        const mentorId = registerMentorProfile(memberId, values, {
          imageUrl: profileImageUrl ?? undefined,
        });

        return {
          mentorId,
          created: existingMentorId === undefined,
          updatedAt: values.updatedAt || new Date().toISOString(),
        };
      }
    },
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
