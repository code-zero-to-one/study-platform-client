'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { getMentorById } from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  NoteConsultationListQueryResult,
  NoteConsultationListQuerySource,
} from '@/types/mentoring/note-consultation-query';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';
import { getLastMessagePreview } from './note-consultation-message';
import {
  createNoteConsultationQuerySnapshot,
  noteConsultationQueryKeys,
} from './note-consultation-query-keys';

const getMentorDisplayInfo = (mentorId: number, createdMentors: MentorProfile[]) => {
  const fromStore = createdMentors.find((mentor) => mentor.id === mentorId);
  if (fromStore) {
    return { name: fromStore.nickname, role: fromStore.role };
  }
  const fromMock = getMentorById(mentorId);
  if (fromMock) {
    return { name: fromMock.nickname, role: fromMock.role };
  }

  return { name: '멘토', role: '' };
};

const toNoteConsultationListItem = ({
  request,
  displayName,
  displayRole,
  channel,
}: {
  request: NoteConsultationListItem['request'];
  displayName: string;
  displayRole: string;
  channel: NoteConsultationListItem['channel'];
}): NoteConsultationListItem => {
  const lastMessage = getLastMessagePreview(request);
  const mentorReplyCount = request.conversation.filter((message) => {
    return message.sender === 'MENTOR';
  }).length;

  return {
    id: request.id,
    request,
    displayName,
    displayRole,
    channel,
    lastMessageContent: lastMessage.content,
    lastMessageCreatedAt: lastMessage.createdAt,
    mentorReplyCount,
  };
};

const buildNoteConsultationList = ({
  memberId,
  myMentorId,
  requestsByMentor,
  createdMentors,
}: NoteConsultationListQuerySource): NoteConsultationListQueryResult => {
  const allRequests = Object.values(requestsByMentor).flat();

  const sentItems = allRequests
    .filter((request) => {
      return request.method === 'note' && request.menteeMemberId === memberId;
    })
    .map((request) => {
      const mentorInfo = getMentorDisplayInfo(request.mentorId, createdMentors);

      return toNoteConsultationListItem({
        request,
        displayName: mentorInfo.name,
        displayRole: mentorInfo.role,
        channel: 'sent',
      });
    });

  const receivedItems =
    myMentorId === undefined
      ? []
      : (requestsByMentor[myMentorId] ?? [])
          .filter((request) => request.method === 'note')
          .map((request) =>
            toNoteConsultationListItem({
              request,
              displayName: request.menteeName,
              displayRole: request.menteeRole,
              channel: 'received',
            }),
          );

  return { sentItems, receivedItems };
};

export const useNoteConsultationQuery = ({ memberId }: { memberId?: number }) => {
  const hasHydrated = useMentoringManagementStore((state) => state.hasHydrated);
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const ensureNoteDemoData = useMentoringManagementStore(
    (state) => state.ensureNoteDemoData,
  );
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );

  const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;

  useEffect(() => {
    if (memberId && hasHydrated) {
      ensureNoteDemoData(memberId);
    }
  }, [ensureNoteDemoData, hasHydrated, memberId]);

  const snapshot = useMemo(() => {
    return createNoteConsultationQuerySnapshot({
      requestsByMentor,
      createdMentors,
      mentorIdByMember,
    });
  }, [createdMentors, mentorIdByMember, requestsByMentor]);

  const fallbackData = useMemo(() => {
    return buildNoteConsultationList({
      memberId,
      myMentorId,
      requestsByMentor,
      createdMentors,
    });
  }, [createdMentors, memberId, myMentorId, requestsByMentor]);

  const noteConsultationQuery = useQuery<NoteConsultationListQueryResult>({
    queryKey: noteConsultationQueryKeys.list({
      memberId,
      myMentorId,
      snapshot,
      requestsByMentor,
      createdMentors,
    }),
    queryFn: () =>
      buildNoteConsultationList({
        memberId,
        myMentorId,
        requestsByMentor,
        createdMentors,
      }),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    enabled: hasHydrated,
    placeholderData: keepPreviousData,
  });

  const data = noteConsultationQuery.data ?? fallbackData;

  return {
    hasHydrated,
    myMentorId,
    sentItems: data.sentItems,
    receivedItems: data.receivedItems,
    isLoading: !hasHydrated || noteConsultationQuery.isLoading,
    isFetching: noteConsultationQuery.isFetching,
    isError: noteConsultationQuery.isError,
    error: noteConsultationQuery.error,
  };
};
