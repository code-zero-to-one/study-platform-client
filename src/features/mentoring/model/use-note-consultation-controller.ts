'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
import type {
  MentoringConversationMessage,
  MentoringRequest,
} from '@/types/mentoring/management-domain';
import type {
  NoteConsultationChannelSummaryItem,
  NoteConsultationControllerActions,
  NoteConsultationControllerResult,
  NoteConsultationControllerState,
  NoteConsultationItemStatusSummary,
  NoteConsultationControllerViewModel,
} from '@/types/mentoring/note-consultation-controller-view';
import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';
import { noteConsultationQueryKeys } from './note-consultation-query-keys';
import { useNoteConsultationQuery } from './use-note-consultation-query';
import { useSendNoteConsultationMessageMutation } from './use-send-note-consultation-message-mutation';

const NOTE_CONSULTATION_LIST_ERROR_MESSAGE =
  '쪽지상담 데이터를 불러오지 못했습니다.';

const isManualTransferPending = (request: MentoringRequest) => {
  return (
    request.paymentMode === 'MANUAL_TRANSFER' &&
    request.paymentStatus !== 'CONFIRMED'
  );
};

const hasMentorFirstReply = (request: MentoringRequest) => {
  return request.conversation.some((message) => {
    return message.sender === 'MENTOR';
  });
};

const canMentorSendMessage = (request: MentoringRequest) => {
  return request.status === 'ACCEPTED' && !isManualTransferPending(request);
};

const canMenteeSendMessage = (request: MentoringRequest) => {
  return request.status === 'ACCEPTED' && hasMentorFirstReply(request);
};

const getLastConversationSender = (request: MentoringRequest) => {
  const lastConversation = [...request.conversation]
    .filter((message) => message.sender !== 'SYSTEM')
    .at(-1);

  return lastConversation?.sender;
};

const getItemStatusSummary = (
  item: NoteConsultationListItem,
): NoteConsultationItemStatusSummary => {
  const { request, channel } = item;
  const mentorFirstReplyExists = hasMentorFirstReply(request);
  const manualTransferPending = isManualTransferPending(request);
  const lastSender = getLastConversationSender(request);

  if (request.status === 'REJECTED') {
    return {
      key: 'rejected',
      label: '신청 거절',
      tone: 'red',
    };
  }

  if (request.status !== 'ACCEPTED') {
    return {
      key: 'mentor-confirmation',
      label: channel === 'received' ? '수락 필요' : '멘토 확인 대기',
      tone: 'orange',
    };
  }

  if (manualTransferPending) {
    return {
      key: 'payment-confirmation',
      label: channel === 'received' ? '입금 확인 필요' : '입금 확인 대기',
      tone: 'orange',
    };
  }

  if (!mentorFirstReplyExists) {
    return {
      key: 'first-reply',
      label: channel === 'received' ? '첫 답변 필요' : '첫 답변 대기',
      tone: 'blue',
    };
  }

  if (channel === 'received') {
    return lastSender === 'MENTEE'
      ? {
          key: 'my-reply',
          label: '내 답변 필요',
          tone: 'blue',
        }
      : {
          key: 'counterpart-reply',
          label: '멘티 추가 질문 대기',
          tone: 'green',
        };
  }

  return lastSender === 'MENTOR'
    ? {
        key: 'my-reply',
        label: '추가 질문 가능',
        tone: 'blue',
      }
    : {
        key: 'counterpart-reply',
        label: '멘토 답변 대기',
        tone: 'green',
      };
};

const NOTE_CONSULTATION_SUMMARY_ORDER: NoteConsultationItemStatusSummary['key'][] =
  [
    'mentor-confirmation',
    'payment-confirmation',
    'first-reply',
    'my-reply',
    'counterpart-reply',
    'rejected',
  ];

const buildChannelSummaryItems = (
  items: NoteConsultationListItem[],
  itemStatusSummaries: Record<string, NoteConsultationItemStatusSummary>,
): NoteConsultationChannelSummaryItem[] => {
  const countByKey = new Map<
    NoteConsultationItemStatusSummary['key'],
    NoteConsultationChannelSummaryItem
  >();

  for (const item of items) {
    const summary = itemStatusSummaries[item.id];
    if (!summary) {
      continue;
    }

    const current = countByKey.get(summary.key);
    if (current) {
      countByKey.set(summary.key, {
        ...current,
        count: current.count + 1,
      });
      continue;
    }

    countByKey.set(summary.key, {
      key: summary.key,
      label: summary.label,
      tone: summary.tone,
      count: 1,
    });
  }

  return NOTE_CONSULTATION_SUMMARY_ORDER.map((key) =>
    countByKey.get(key),
  ).filter(
    (item): item is NoteConsultationChannelSummaryItem => item !== undefined,
  );
};

const createMenteeFollowUpMessage = (
  content: string,
): MentoringConversationMessage => {
  return {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`,
    sender: 'MENTEE',
    content,
    createdAt: new Date().toISOString(),
  };
};

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return '메시지 전송에 실패했습니다.';
};

export const useNoteConsultationController = ({
  initialRequestId,
  initialChannel,
}: {
  initialRequestId?: string;
  initialChannel?: NoteConsultationChannel;
} = {}): NoteConsultationControllerResult => {
  const { memberId, isHydrated: isAuthHydrated } = useAuthReady();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  const { hasHydrated, sentItems, receivedItems, isError, isFetching } =
    useNoteConsultationQuery({
      memberId,
    });
  const sendMessageMutation = useSendNoteConsultationMessageMutation();

  const [activeChannel, setActiveChannel] = useState<NoteConsultationChannel>(
    initialChannel ?? 'sent',
  );
  const [selectedRequestId, setSelectedRequestId] = useState(
    initialRequestId ?? '',
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [draftByRequest, setDraftByRequest] = useState<Record<string, string>>(
    {},
  );

  const allItems = useMemo(
    () => [...sentItems, ...receivedItems],
    [receivedItems, sentItems],
  );
  const activeItems = activeChannel === 'sent' ? sentItems : receivedItems;
  const filteredItems = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) {
      return activeItems;
    }

    return activeItems.filter((item) => {
      return (
        item.displayName.includes(keyword) ||
        item.displayRole.includes(keyword) ||
        item.lastMessageContent.includes(keyword)
      );
    });
  }, [activeItems, searchKeyword]);

  const itemStatusSummaries = useMemo(() => {
    return Object.fromEntries(
      allItems.map((item) => [item.id, getItemStatusSummary(item)]),
    ) as Record<string, NoteConsultationItemStatusSummary>;
  }, [allItems]);

  const pinnedItem = useMemo(() => {
    if (!initialRequestId) {
      return undefined;
    }

    return allItems.find((item) => item.id === initialRequestId);
  }, [allItems, initialRequestId]);

  useEffect(() => {
    if (!pinnedItem || pinnedItem.channel === activeChannel) {
      return;
    }

    setActiveChannel(pinnedItem.channel);
  }, [activeChannel, pinnedItem]);

  const activeChannelSummaryItems = useMemo(() => {
    return buildChannelSummaryItems(filteredItems, itemStatusSummaries);
  }, [filteredItems, itemStatusSummaries]);

  useEffect(() => {
    if (initialChannel) {
      setActiveChannel(initialChannel);
    }
  }, [initialChannel]);

  useEffect(() => {
    if (initialRequestId) {
      setSelectedRequestId(initialRequestId);
    }
  }, [initialRequestId]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      if (!initialRequestId) {
        setSelectedRequestId('');
      }

      return;
    }
    const hasSelected = filteredItems.some(
      (item) => item.id === selectedRequestId,
    );
    if (!hasSelected) {
      setSelectedRequestId(filteredItems[0].id);
    }
  }, [filteredItems, initialRequestId, selectedRequestId]);

  const selectedItem =
    filteredItems.find((item) => item.id === selectedRequestId) ??
    activeItems.find((item) => item.id === selectedRequestId);
  const selectedRequest = selectedItem?.request;
  const draft = selectedItem ? (draftByRequest[selectedItem.id] ?? '') : '';
  const canSend =
    !!selectedItem &&
    !!selectedRequest &&
    draft.trim().length > 0 &&
    (selectedItem.channel === 'received'
      ? canMentorSendMessage(selectedRequest)
      : canMenteeSendMessage(selectedRequest));

  const handleUpdateDraft = useCallback(
    (value: string) => {
      if (!selectedItem) {
        return;
      }

      setDraftByRequest((previous) => ({
        ...previous,
        [selectedItem.id]: value,
      }));
    },
    [selectedItem],
  );

  const handleSendMessage = useCallback(async () => {
    if (!selectedItem || !selectedRequest) {
      return;
    }

    const content = (draftByRequest[selectedItem.id] ?? '').trim();
    if (!content) {
      return;
    }

    if (selectedItem.channel === 'received') {
      if (!canMentorSendMessage(selectedRequest)) {
        return;
      }

      sendMessageMutation.mutate(
        {
          mentorId: selectedRequest.mentorId,
          requestId: selectedItem.id,
          content,
        },
        {
          onSuccess: () => {
            setDraftByRequest((previous) => ({
              ...previous,
              [selectedItem.id]: '',
            }));
            showToast('메시지를 보냈습니다.', 'success');
          },
          onError: (mutationError) => {
            showToast(getMutationErrorMessage(mutationError), 'error');
          },
        },
      );

      return;
    }

    if (!canMenteeSendMessage(selectedRequest)) {
      return;
    }

    let result: {
      ok: boolean;
      reason?: string;
    } = {
      ok: false,
      reason: '신청 정보를 찾을 수 없습니다.',
    };

    useMentoringManagementStore.setState((state) => {
      const requests = state.requestsByMentor[selectedRequest.mentorId] ?? [];
      const targetIndex = requests.findIndex((request) => {
        return request.id === selectedItem.id;
      });
      if (targetIndex < 0) {
        return state;
      }

      const targetRequest = requests[targetIndex];
      if (!canMenteeSendMessage(targetRequest)) {
        result = {
          ok: false,
          reason: '멘토의 첫 답변 이후에만 후속 질문을 보낼 수 있습니다.',
        };

        return state;
      }

      const nextRequests = [...requests];
      nextRequests[targetIndex] = {
        ...targetRequest,
        conversation: [
          ...targetRequest.conversation,
          createMenteeFollowUpMessage(content),
        ],
      };

      result = {
        ok: true,
      };

      return {
        requestsByMentor: {
          ...state.requestsByMentor,
          [selectedRequest.mentorId]: nextRequests,
        },
      };
    });

    if (!result.ok) {
      showToast(result.reason ?? '메시지 전송에 실패했습니다.', 'error');

      return;
    }

    await queryClient.invalidateQueries({
      queryKey: noteConsultationQueryKeys.lists(),
    });

    setDraftByRequest((previous) => ({
      ...previous,
      [selectedItem.id]: '',
    }));
    showToast('메시지를 보냈습니다.', 'success');
  }, [
    draftByRequest,
    queryClient,
    selectedItem,
    selectedRequest,
    sendMessageMutation,
    showToast,
  ]);

  const listState =
    !isAuthHydrated || !hasHydrated ? 'loading' : isError ? 'error' : 'ready';
  const hasAnyRequest = allItems.length > 0;
  const pinnedItemStatusSummary = pinnedItem
    ? itemStatusSummaries[pinnedItem.id]
    : undefined;
  const isRestoringPinnedItem =
    !!initialRequestId &&
    !pinnedItem &&
    (!isAuthHydrated || !hasHydrated || isFetching);
  const hasMissingPinnedItem =
    !!initialRequestId &&
    !pinnedItem &&
    isAuthHydrated &&
    hasHydrated &&
    !isFetching;

  return {
    state: {
      listState,
      activeChannel,
      searchKeyword,
      selectedRequestId,
      draft,
      isSending: sendMessageMutation.isPending,
    } satisfies NoteConsultationControllerState,
    viewModel: {
      hasAnyRequest,
      filteredItems,
      selectedItem,
      canSend,
      itemStatusSummaries,
      activeChannelSummaryItems,
      pinnedItem,
      pinnedItemStatusSummary,
      isRestoringPinnedItem,
      hasMissingPinnedItem,
      errorMessage: NOTE_CONSULTATION_LIST_ERROR_MESSAGE,
    } satisfies NoteConsultationControllerViewModel,
    actions: {
      setActiveChannel,
      setSearchKeyword,
      selectRequest: setSelectedRequestId,
      updateDraft: handleUpdateDraft,
      sendMessage: handleSendMessage,
    } satisfies NoteConsultationControllerActions,
  };
};
