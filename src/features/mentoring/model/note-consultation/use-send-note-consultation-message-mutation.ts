'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type {
  SendNoteConsultationMessageMutationParams,
  SendNoteConsultationMessageMutationResult,
} from '@/types/mentoring/note-consultation-query';
import {
  NoteConsultationContractError,
  normalizeNoteConsultationMutationError,
  parseSendNoteConsultationMessageParamsOrThrow,
} from './note-consultation-contract';
import { noteConsultationQueryKeys } from './note-consultation-query-keys';

export const useSendNoteConsultationMessageMutation = () => {
  const queryClient = useQueryClient();
  const sendMentorMessage = useMentoringManagementStore(
    (state) => state.sendMentorMessage,
  );

  return useMutation<
    SendNoteConsultationMessageMutationResult,
    NoteConsultationContractError,
    SendNoteConsultationMessageMutationParams
  >({
    mutationFn: async (input) => {
      try {
        const parsedInput =
          parseSendNoteConsultationMessageParamsOrThrow(input);
        const result = sendMentorMessage({
          mentorId: parsedInput.mentorId,
          requestId: parsedInput.requestId,
          content: parsedInput.content,
        });
        if (!result.ok) {
          throw new Error(result.reason ?? '메시지 전송에 실패했습니다.');
        }

        return result;
      } catch (error) {
        throw normalizeNoteConsultationMutationError(error);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: noteConsultationQueryKeys.lists(),
      });
    },
  });
};
