'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendNoteConsultationMessage } from '@/features/mentoring/api/mentoring-lifecycle-api';
import type {
  SendNoteConsultationMessageMutationParams,
  SendNoteConsultationMessageMutationResult,
} from '@/types/mentoring/note-consultation-query';
import {
  NoteConsultationContractError,
  normalizeNoteConsultationMutationError,
  parseSendNoteConsultationMessageParamsOrThrow,
} from './note-consultation-contract';
import { mentoringLifecycleQueryKeys } from './mentoring-lifecycle-query-keys';

export const useSendNoteConsultationMessageMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SendNoteConsultationMessageMutationResult,
    NoteConsultationContractError,
    SendNoteConsultationMessageMutationParams
  >({
    mutationFn: async (input) => {
      try {
        const parsedInput =
          parseSendNoteConsultationMessageParamsOrThrow(input);

        return await sendNoteConsultationMessage({
          mentorId: parsedInput.mentorId,
          requestId: parsedInput.requestId,
          messageId: parsedInput.messageId,
          content: parsedInput.content,
          messageContents: parsedInput.messageContents,
          attachmentFileKeys: parsedInput.attachmentFileKeys,
          attachedFileNames: parsedInput.attachedFileNames,
          referenceLinks: parsedInput.referenceLinks,
        });
      } catch (error) {
        throw normalizeNoteConsultationMutationError(error);
      }
    },
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: mentoringLifecycleQueryKeys.noteConsultations(),
        }),
        queryClient.invalidateQueries({
          queryKey: mentoringLifecycleQueryKeys.myDashboards(),
        }),
        queryClient.invalidateQueries({
          queryKey: mentoringLifecycleQueryKeys.mentorWorkspaces(),
        }),
        queryClient.invalidateQueries({
          queryKey: mentoringLifecycleQueryKeys.requestDetail(
            variables.requestId,
          ),
        }),
      ]);
    },
  });
};
