'use client';

import { useQuery } from '@tanstack/react-query';
import { getNoteConsultationList } from '@/features/mentoring/api/mentoring-lifecycle-api';
import type { NoteConsultationListQueryResult } from '@/types/mentoring/note-consultation-query';
import {
  NoteConsultationContractError,
  normalizeNoteConsultationQueryError,
  parseNoteConsultationResponseOrThrow,
} from './note-consultation-contract';
import { mentoringLifecycleQueryKeys } from './mentoring-lifecycle-query-keys';

const EMPTY_NOTE_CONSULTATION_LIST: NoteConsultationListQueryResult = {
  sentItems: [],
  receivedItems: [],
};

export const useNoteConsultationQuery = ({
  memberId,
  mentorIdOverride,
}: {
  memberId?: number;
  mentorIdOverride?: number;
}) => {
  const noteConsultationQuery = useQuery<
    NoteConsultationListQueryResult,
    NoteConsultationContractError
  >({
    queryKey: mentoringLifecycleQueryKeys.noteConsultationList({
      memberId,
      mentorId: mentorIdOverride,
    }),
    queryFn: async () => {
      try {
        const response = await getNoteConsultationList({
          mentorId: mentorIdOverride,
        });

        return parseNoteConsultationResponseOrThrow(response);
      } catch (error) {
        throw normalizeNoteConsultationQueryError(error);
      }
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    enabled: typeof memberId === 'number',
  });

  const data = noteConsultationQuery.data ?? EMPTY_NOTE_CONSULTATION_LIST;

  return {
    hasHydrated:
      typeof memberId !== 'number' ||
      noteConsultationQuery.isSuccess ||
      noteConsultationQuery.isError,
    myMentorId: mentorIdOverride,
    sentItems: data.sentItems,
    receivedItems: data.receivedItems,
    isLoading:
      typeof memberId === 'number' ? noteConsultationQuery.isLoading : false,
    isFetching: noteConsultationQuery.isFetching,
    isError: noteConsultationQuery.isError,
    error: noteConsultationQuery.error,
  };
};
