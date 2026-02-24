'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type {
  SendNoteConsultationMessageMutationParams,
  SendNoteConsultationMessageMutationResult,
} from '@/types/mentoring/note-consultation-query';
import { noteConsultationQueryKeys } from './note-consultation-query-keys';

export const useSendNoteConsultationMessageMutation = () => {
  const queryClient = useQueryClient();
  const sendMentorMessage = useMentoringManagementStore(
    (state) => state.sendMentorMessage,
  );

  return useMutation<
    SendNoteConsultationMessageMutationResult,
    Error,
    SendNoteConsultationMessageMutationParams
  >({
    mutationFn: async ({ mentorId, requestId, content }) => {
      const normalizedContent = content.trim();
      if (!normalizedContent) {
        throw new Error('메시지 내용을 입력해주세요.');
      }

      const result = sendMentorMessage({
        mentorId,
        requestId,
        content: normalizedContent,
      });
      if (!result.ok) {
        throw new Error(result.reason ?? '메시지 전송에 실패했습니다.');
      }

      return result;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: noteConsultationQueryKeys.lists(),
      });
    },
  });
};
