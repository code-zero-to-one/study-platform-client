'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import type {
  NoteConsultationControllerActions,
  NoteConsultationControllerResult,
  NoteConsultationControllerState,
  NoteConsultationControllerViewModel,
} from '@/types/mentoring/note-consultation-controller-view';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';
import { useNoteConsultationQuery } from './use-note-consultation-query';
import { useSendNoteConsultationMessageMutation } from './use-send-note-consultation-message-mutation';

const NOTE_CONSULTATION_LIST_ERROR_MESSAGE =
  '쪽지 상담 데이터를 불러오지 못했습니다.';

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return '메시지 전송에 실패했습니다.';
};

export const useNoteConsultationController =
  (): NoteConsultationControllerResult => {
    const { memberId } = useAuthReady();
    const { showToast } = useToastStore();
    const { hasHydrated, sentItems, receivedItems, isError } =
      useNoteConsultationQuery({
        memberId,
      });
    const sendMessageMutation = useSendNoteConsultationMessageMutation();

    const [activeChannel, setActiveChannel] =
      useState<NoteConsultationChannel>('sent');
    const [selectedRequestId, setSelectedRequestId] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [draftByRequest, setDraftByRequest] = useState<
      Record<string, string>
    >({});

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

    useEffect(() => {
      if (filteredItems.length === 0) {
        setSelectedRequestId('');

        return;
      }
      const hasSelected = filteredItems.some(
        (item) => item.id === selectedRequestId,
      );
      if (!hasSelected) {
        setSelectedRequestId(filteredItems[0].id);
      }
    }, [filteredItems, selectedRequestId]);

    const selectedItem = filteredItems.find(
      (item) => item.id === selectedRequestId,
    );
    const draft = selectedItem ? (draftByRequest[selectedItem.id] ?? '') : '';
    const canSend = draft.trim().length > 0;

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

    const handleSendMessage = useCallback(() => {
      if (!selectedItem || selectedItem.channel !== 'received') {
        return;
      }

      const content = (draftByRequest[selectedItem.id] ?? '').trim();
      if (!content) {
        return;
      }

      sendMessageMutation.mutate(
        {
          mentorId: selectedItem.request.mentorId,
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
    }, [draftByRequest, selectedItem, sendMessageMutation, showToast]);

    const listState = !hasHydrated ? 'loading' : isError ? 'error' : 'ready';
    const hasAnyRequest = sentItems.length > 0 || receivedItems.length > 0;

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
