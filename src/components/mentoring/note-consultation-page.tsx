'use client';

import { useEffect, useMemo, useState } from 'react';
import MentoringListTemplate from '@/components/mentoring/common/mentoring-list-template';
import MentoringStateBoundary from '@/components/mentoring/common/mentoring-state-boundary';
import {
  NoteConsultationContent,
  NoteConsultationEmptyState,
  NoteConsultationHeader,
} from '@/components/mentoring/note-consultation/note-consultation-composite';
import { useNoteConsultationQuery } from '@/features/mentoring/model/use-note-consultation-query';
import { useSendNoteConsultationMessageMutation } from '@/features/mentoring/model/use-send-note-consultation-message-mutation';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import type { NoteConsultationChannel } from '@/types/mentoring/note-consultation-view';

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return '메시지 전송에 실패했습니다.';
};

export default function NoteConsultationPage() {
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
  const [draftByRequest, setDraftByRequest] = useState<Record<string, string>>(
    {},
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

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedRequestId('');

      return;
    }
    const hasSelected = filteredItems.some((item) => item.id === selectedRequestId);
    if (!hasSelected) {
      setSelectedRequestId(filteredItems[0].id);
    }
  }, [filteredItems, selectedRequestId]);

  const selectedItem = filteredItems.find((item) => item.id === selectedRequestId);
  const draft = selectedItem ? draftByRequest[selectedItem.id] ?? '' : '';
  const canSend = draft.trim().length > 0;

  const handleSendMessage = () => {
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
          showToast(getErrorMessage(mutationError), 'error');
        },
      },
    );
  };

  const hasAnyRequest = sentItems.length > 0 || receivedItems.length > 0;
  const listState = !hasHydrated ? 'loading' : isError ? 'error' : 'ready';

  return (
    <MentoringStateBoundary
      state={listState}
      loading={(
        <div className="flex flex-col gap-300">
          <div className="rounded-100 bg-background-alternative h-[40px] w-[200px] animate-pulse" />
          <div className="rounded-200 bg-background-alternative h-[660px] animate-pulse" />
        </div>
      )}
      error={(
        <div className="rounded-200 border border-border-subtle bg-background-default px-300 py-300 text-center">
          <p className="font-designer-16m text-text-default">
            쪽지 상담 데이터를 불러오지 못했습니다.
          </p>
        </div>
      )}
      ready={(
        <MentoringListTemplate
          toolbar={<NoteConsultationHeader />}
          content={
            hasAnyRequest ? (
              <NoteConsultationContent
                activeChannel={activeChannel}
                searchKeyword={searchKeyword}
                filteredItems={filteredItems}
                selectedRequestId={selectedRequestId}
                selectedItem={selectedItem}
                draft={draft}
                canSend={canSend}
                onActiveChannelChange={setActiveChannel}
                onSearchKeywordChange={setSearchKeyword}
                onSelectRequestId={setSelectedRequestId}
                onDraftChange={(value) => {
                  if (!selectedItem) {
                    return;
                  }

                  setDraftByRequest((previous) => ({
                    ...previous,
                    [selectedItem.id]: value,
                  }));
                }}
                onSend={handleSendMessage}
              />
            ) : (
              <NoteConsultationEmptyState />
            )
          }
        />
      )}
    />
  );
}
