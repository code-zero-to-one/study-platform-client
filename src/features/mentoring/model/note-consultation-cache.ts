import type { QueryClient } from '@tanstack/react-query';
import type { MentoringRequestDetailResource } from '@/features/mentoring/api/mentoring-lifecycle-api';
import { mentoringLifecycleQueryKeys } from '@/features/mentoring/model/mentoring-lifecycle-query-keys';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';
import type { NoteConsultationListQueryResult } from '@/types/mentoring/note-consultation-query';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';

const toConversationTimestamp = (value: string) => {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const upsertConversationMessage = ({
  conversation,
  message,
}: {
  conversation: MentoringConversationMessage[];
  message: MentoringConversationMessage;
}) => {
  const messageIndex = conversation.findIndex((item) => item.id === message.id);
  const nextConversation =
    messageIndex >= 0
      ? conversation.map((item, index) => {
          return index === messageIndex ? { ...item, ...message } : item;
        })
      : [...conversation, message];

  return nextConversation.sort((first, second) => {
    return (
      toConversationTimestamp(first.createdAt) -
      toConversationTimestamp(second.createdAt)
    );
  });
};

const updateRequestItems = ({
  items,
  requestId,
  updater,
}: {
  items: NoteConsultationListItem[];
  requestId: string;
  updater: (item: NoteConsultationListItem) => NoteConsultationListItem;
}) => {
  return items.map((item) => {
    if (item.request.id !== requestId) {
      return item;
    }

    return updater(item);
  });
};

export const mergeNoteConsultationSelectedRequest = ({
  detailRequest,
  fallbackRequest,
}: {
  detailRequest?: MentoringRequest;
  fallbackRequest?: MentoringRequest;
}) => {
  if (!detailRequest) {
    return fallbackRequest;
  }
  if (!fallbackRequest) {
    return detailRequest;
  }

  return {
    ...fallbackRequest,
    ...detailRequest,
    menteeMemberId: detailRequest.menteeMemberId ?? fallbackRequest.menteeMemberId,
    preferredDate: detailRequest.preferredDate ?? fallbackRequest.preferredDate,
    preferredTime: detailRequest.preferredTime ?? fallbackRequest.preferredTime,
    requestTitle: detailRequest.requestTitle ?? fallbackRequest.requestTitle,
    requestContents:
      (detailRequest.requestContents?.length ?? 0) > 0
        ? detailRequest.requestContents
        : fallbackRequest.requestContents,
    attachedFiles:
      (detailRequest.attachedFiles?.length ?? 0) > 0
        ? detailRequest.attachedFiles
        : fallbackRequest.attachedFiles,
    attachedFileNames:
      (detailRequest.attachedFileNames?.length ?? 0) > 0
        ? detailRequest.attachedFileNames
        : fallbackRequest.attachedFileNames,
    referenceLinks:
      (detailRequest.referenceLinks?.length ?? 0) > 0
        ? detailRequest.referenceLinks
        : fallbackRequest.referenceLinks,
    decisionNote: detailRequest.decisionNote ?? fallbackRequest.decisionNote,
    closeNote: detailRequest.closeNote ?? fallbackRequest.closeNote,
    acceptedAt: detailRequest.acceptedAt ?? fallbackRequest.acceptedAt,
    rejectedAt: detailRequest.rejectedAt ?? fallbackRequest.rejectedAt,
    closedAt: detailRequest.closedAt ?? fallbackRequest.closedAt,
    linkedSessionId:
      detailRequest.linkedSessionId ?? fallbackRequest.linkedSessionId,
    conversation:
      detailRequest.conversation.length > 0
        ? detailRequest.conversation
        : fallbackRequest.conversation,
  } satisfies MentoringRequest;
};

export const patchNoteConsultationRequestCache = ({
  queryClient,
  requestId,
  patch,
}: {
  queryClient: QueryClient;
  requestId: string;
  patch: Partial<MentoringRequest>;
}) => {
  queryClient.setQueriesData<NoteConsultationListQueryResult>(
    { queryKey: mentoringLifecycleQueryKeys.noteConsultations() },
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        sentItems: updateRequestItems({
          items: current.sentItems,
          requestId,
          updater: (item) => ({
            ...item,
            request: {
              ...item.request,
              ...patch,
            },
          }),
        }),
        receivedItems: updateRequestItems({
          items: current.receivedItems,
          requestId,
          updater: (item) => ({
            ...item,
            request: {
              ...item.request,
              ...patch,
            },
          }),
        }),
      };
    },
  );

  queryClient.setQueryData<MentoringRequestDetailResource>(
    mentoringLifecycleQueryKeys.requestDetail(requestId),
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        request: {
          ...current.request,
          ...patch,
        },
      };
    },
  );
};

export const upsertNoteConsultationMessageCache = ({
  queryClient,
  requestId,
  message,
}: {
  queryClient: QueryClient;
  requestId: string;
  message: MentoringConversationMessage;
}) => {
  const updateItem = (item: NoteConsultationListItem) => {
    const nextConversation = upsertConversationMessage({
      conversation: item.request.conversation,
      message,
    });
    const lastMessage = nextConversation.at(-1);
    const mentorReplyCount = nextConversation.filter((conversationMessage) => {
      return conversationMessage.sender === 'MENTOR';
    }).length;

    return {
      ...item,
      lastMessageContent: lastMessage?.content ?? item.lastMessageContent,
      lastMessageCreatedAt: lastMessage?.createdAt ?? item.lastMessageCreatedAt,
      mentorReplyCount,
      request: {
        ...item.request,
        conversation: nextConversation,
      },
    };
  };

  queryClient.setQueriesData<NoteConsultationListQueryResult>(
    { queryKey: mentoringLifecycleQueryKeys.noteConsultations() },
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        sentItems: updateRequestItems({
          items: current.sentItems,
          requestId,
          updater: updateItem,
        }),
        receivedItems: updateRequestItems({
          items: current.receivedItems,
          requestId,
          updater: updateItem,
        }),
      };
    },
  );

  queryClient.setQueryData<MentoringRequestDetailResource>(
    mentoringLifecycleQueryKeys.requestDetail(requestId),
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        request: {
          ...current.request,
          conversation: upsertConversationMessage({
            conversation: current.request.conversation,
            message,
          }),
        },
      };
    },
  );
};
