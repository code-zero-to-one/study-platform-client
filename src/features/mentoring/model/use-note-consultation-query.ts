'use client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';
import { getMentorById } from '@/mocks/mentoring-mock-data';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import { useUserStore } from '@/stores/useUserStore';
import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  NoteConsultationListQueryResult,
  NoteConsultationListQuerySource,
} from '@/types/mentoring/note-consultation-query';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';
import {
  NoteConsultationContractError,
  normalizeNoteConsultationQueryError,
  parseNoteConsultationQuerySourceOrThrow,
  parseNoteConsultationResponseOrThrow,
} from './note-consultation-contract';
import { getLastMessagePreview } from './note-consultation-message';
import {
  createNoteConsultationQuerySnapshot,
  noteConsultationQueryKeys,
} from './note-consultation-query-keys';
const getMentorDisplayInfo = (
  mentorId: number,
  createdMentors: MentorProfile[],
) => {
  const fromStore = createdMentors.find((mentor) => mentor.id === mentorId);
  if (fromStore) {
    return {
      name: fromStore.nickname,
      role: fromStore.role,
      memberId: fromStore.memberId,
      imageUrl: fromStore.imageUrl,
    };
  }
  const fromMock = getMentorById(mentorId);
  if (fromMock) {
    return {
      name: fromMock.nickname,
      role: fromMock.role,
      memberId: fromMock.memberId,
      imageUrl: fromMock.imageUrl,
    };
  }

  return { name: '멘토', role: '', memberId: undefined, imageUrl: undefined };
};
const toNoteConsultationListItem = ({
  request,
  displayName,
  displayRole,
  channel,
  counterpartMemberId,
  counterpartProfileImageUrl,
}: {
  request: NoteConsultationListItem['request'];
  displayName: string;
  displayRole: string;
  channel: NoteConsultationListItem['channel'];
  counterpartMemberId?: number;
  counterpartProfileImageUrl?: string;
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
    counterpartMemberId,
    counterpartProfileImageUrl,
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
        counterpartMemberId: mentorInfo.memberId,
        counterpartProfileImageUrl: mentorInfo.imageUrl,
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
              counterpartMemberId: request.menteeMemberId,
            }),
          );
  const sortByLastMessage = (items: NoteConsultationListItem[]) => {
    return [...items].sort((first, second) => {
      return (
        dayjs(second.lastMessageCreatedAt).valueOf() -
        dayjs(first.lastMessageCreatedAt).valueOf()
      );
    });
  };

  return {
    sentItems: sortByLastMessage(sentItems),
    receivedItems: sortByLastMessage(receivedItems),
  };
};
const getNoteConsultationList = (
  source: NoteConsultationListQuerySource,
): NoteConsultationListQueryResult => {
  const parsedSource = parseNoteConsultationQuerySourceOrThrow(source);
  const list = buildNoteConsultationList(parsedSource);

  return parseNoteConsultationResponseOrThrow(list);
};
const EMPTY_NOTE_CONSULTATION_LIST: NoteConsultationListQueryResult = {
  sentItems: [],
  receivedItems: [],
};
export const useNoteConsultationQuery = ({
  memberId,
}: {
  memberId?: number;
}) => {
  const hasHydrated = useMentoringManagementStore((state) => state.hasHydrated);
  const requestsByMentor = useMentoringManagementStore(
    (state) => state.requestsByMentor,
  );
  const ensureNoteDemoData = useMentoringManagementStore(
    (state) => state.ensureNoteDemoData,
  );
  const nickname = useUserStore((state) => state.nickname);
  const memberName = useUserStore((state) => state.memberName);
  const mentorIdByMember = useMentorDirectoryStore(
    (state) => state.mentorIdByMember,
  );
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const myMentorId = memberId ? mentorIdByMember[memberId] : undefined;
  const currentDisplayName = nickname?.trim() || memberName?.trim() || '김서윤';
  useEffect(() => {
    if (memberId && hasHydrated) {
      ensureNoteDemoData(memberId, {
        menteeName: currentDisplayName,
        menteeRole: 'ZERO-ONE 멘티',
      });
    }
  }, [currentDisplayName, ensureNoteDemoData, hasHydrated, memberId]);
  const snapshot = useMemo(() => {
    return createNoteConsultationQuerySnapshot({
      requestsByMentor,
      createdMentors,
      mentorIdByMember,
    });
  }, [createdMentors, mentorIdByMember, requestsByMentor]);
  const fallbackData = useMemo(() => {
    try {
      return getNoteConsultationList({
        memberId,
        myMentorId,
        requestsByMentor,
        createdMentors,
      });
    } catch {
      return EMPTY_NOTE_CONSULTATION_LIST;
    }
  }, [createdMentors, memberId, myMentorId, requestsByMentor]);
  const noteConsultationQuery = useQuery<
    NoteConsultationListQueryResult,
    NoteConsultationContractError
  >({
    queryKey: noteConsultationQueryKeys.list({
      memberId,
      myMentorId,
      snapshot,
      requestsByMentor,
      createdMentors,
    }),
    queryFn: () => {
      try {
        return getNoteConsultationList({
          memberId,
          myMentorId,
          requestsByMentor,
          createdMentors,
        });
      } catch (error) {
        throw normalizeNoteConsultationQueryError(error);
      }
    },
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
