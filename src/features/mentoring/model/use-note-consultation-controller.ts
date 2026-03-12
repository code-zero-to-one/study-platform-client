'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAuthReady } from '@/hooks/common/use-auth';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  NoteConsultationControllerActions,
  NoteConsultationControllerResult,
  NoteConsultationControllerState,
  NoteConsultationControllerViewModel,
  NoteConsultationItemStatusSummary,
  NoteConsultationStatusFilter,
  NoteConsultationStatusTab,
} from '@/types/mentoring/note-consultation-controller-view';
import type {
  NoteConsultationChannel,
  NoteConsultationListItem,
} from '@/types/mentoring/note-consultation-view';
import { useNoteConsultationQuery } from './use-note-consultation-query';
const NOTE_CONSULTATION_LIST_ERROR_MESSAGE =
  '쪽지상담 데이터를 불러오지 못했습니다.';
type NoteConsultationStatusTabPreset = 'mentor' | 'mentee' | 'none';
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
const getItemStatusSummary = (
  item: NoteConsultationListItem,
): NoteConsultationItemStatusSummary => {
  const { request } = item;
  const mentorFirstReplyExists = hasMentorFirstReply(request);
  const manualTransferPending = isManualTransferPending(request);
  if (request.status === 'REJECTED') {
    return { key: 'rejected', label: '답변거절', tone: 'red' };
  }
  const isCompleted =
    request.status === 'ACCEPTED' &&
    !manualTransferPending &&
    mentorFirstReplyExists;
  if (isCompleted) {
    return { key: 'completed', label: '답변 완료', tone: 'green' };
  }

  return { key: 'pending', label: '확인대기', tone: 'orange' };
};
const MENTOR_STATUS_TABS: Array<{
  key: NoteConsultationStatusFilter;
  label: string;
}> = [
  { key: 'mentor-requested', label: '신청접수' },
  { key: 'mentor-drafting', label: '답변작성' },
  { key: 'mentor-completed', label: '처리완료' },
];
const MENTEE_STATUS_TABS: Array<{
  key: NoteConsultationStatusFilter;
  label: string;
}> = [
  { key: 'mentee-pending', label: '승인 대기' },
  { key: 'mentee-answered', label: '답변완료' },
  { key: 'mentee-completed', label: '처리완료' },
];
const getMentorStageFilter = (
  request: MentoringRequest,
): NoteConsultationStatusFilter => {
  const mentorFirstReplyExists = hasMentorFirstReply(request);
  if (request.status === 'PENDING' || isManualTransferPending(request)) {
    return 'mentor-requested';
  }
  if (request.status === 'ACCEPTED' && !mentorFirstReplyExists) {
    return 'mentor-drafting';
  }

  return 'mentor-completed';
};
const getMenteeStageFilter = (
  request: MentoringRequest,
): NoteConsultationStatusFilter => {
  const mentorFirstReplyExists = hasMentorFirstReply(request);
  if (request.status === 'PENDING') {
    return 'mentee-pending';
  }
  if (
    request.status === 'ACCEPTED' &&
    !isManualTransferPending(request) &&
    mentorFirstReplyExists
  ) {
    return 'mentee-answered';
  }
  if (request.status === 'ACCEPTED') {
    return 'mentee-pending';
  }

  return 'mentee-completed';
};
const matchesStatusFilter = (
  item: NoteConsultationListItem,
  filter: NoteConsultationStatusFilter,
  preset: NoteConsultationStatusTabPreset,
) => {
  if (filter === 'all') {
    return true;
  }
  if (preset === 'mentor') {
    return getMentorStageFilter(item.request) === filter;
  }
  if (preset === 'mentee') {
    return getMenteeStageFilter(item.request) === filter;
  }

  return false;
};
export const useNoteConsultationController = ({
  initialRequestId,
  initialChannel,
  lockedChannel,
  statusTabPreset = 'none',
}: {
  initialRequestId?: string;
  initialChannel?: NoteConsultationChannel;
  lockedChannel?: NoteConsultationChannel;
  statusTabPreset?: NoteConsultationStatusTabPreset;
} = {}): NoteConsultationControllerResult => {
  const { memberId, isHydrated: isAuthHydrated } = useAuthReady();
  const { hasHydrated, sentItems, receivedItems, isError, isFetching } =
    useNoteConsultationQuery({ memberId });
  const [activeChannel, setActiveChannel] = useState<NoteConsultationChannel>(
    lockedChannel ?? initialChannel ?? 'sent',
  );
  const [selectedRequestId, setSelectedRequestId] = useState(
    initialRequestId ?? '',
  );
  const [statusFilter, setStatusFilter] =
    useState<NoteConsultationStatusFilter>('all');
  const allItems = useMemo(
    () => [...sentItems, ...receivedItems],
    [receivedItems, sentItems],
  );
  const activeItems = activeChannel === 'sent' ? sentItems : receivedItems;
  const itemStatusSummaries = useMemo(() => {
    return Object.fromEntries(
      allItems.map((item) => [item.id, getItemStatusSummary(item)]),
    ) as Record<string, NoteConsultationItemStatusSummary>;
  }, [allItems]);
  const statusTabs = useMemo<NoteConsultationStatusTab[]>(() => {
    if (statusTabPreset === 'mentor') {
      return MENTOR_STATUS_TABS.map((tab) => ({
        ...tab,
        count: activeItems.filter((item) => {
          return matchesStatusFilter(item, tab.key, statusTabPreset);
        }).length,
      }));
    }
    if (statusTabPreset === 'mentee') {
      return MENTEE_STATUS_TABS.map((tab) => ({
        ...tab,
        count: activeItems.filter((item) => {
          return matchesStatusFilter(item, tab.key, statusTabPreset);
        }).length,
      }));
    }

    return [];
  }, [activeItems, statusTabPreset]);
  useEffect(() => {
    if (statusTabs.length === 0) {
      if (statusFilter !== 'all') {
        setStatusFilter('all');
      }

      return;
    }

    const hasActiveFilter = statusTabs.some((tab) => tab.key === statusFilter);
    if (!hasActiveFilter) {
      setStatusFilter(statusTabs[0].key);
    }
  }, [statusFilter, statusTabs]);
  const filteredItems = useMemo(() => {
    if (statusTabPreset === 'none' || statusFilter === 'all') {
      return activeItems;
    }

    return activeItems.filter((item) => {
      return matchesStatusFilter(item, statusFilter, statusTabPreset);
    });
  }, [activeItems, statusFilter, statusTabPreset]);
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
  useEffect(() => {
    if (lockedChannel) {
      return;
    }
    if (initialChannel) {
      setActiveChannel(initialChannel);
    }
  }, [initialChannel, lockedChannel]);
  useEffect(() => {
    if (!lockedChannel) {
      return;
    }
    setActiveChannel(lockedChannel);
  }, [lockedChannel]);
  useEffect(() => {
    if (initialRequestId) {
      setSelectedRequestId(initialRequestId);
    }
  }, [initialRequestId]);
  useEffect(() => {
    if (!filteredItems.length) {
      if (!initialRequestId) {
        setSelectedRequestId('');
      }

      return;
    }
    const hasSelected = filteredItems.some(
      (item) => item.id === selectedRequestId,
    );
    if (!hasSelected && !initialRequestId) {
      setSelectedRequestId('');
    }
  }, [filteredItems, initialRequestId, selectedRequestId]);
  const selectedItem =
    filteredItems.find((item) => item.id === selectedRequestId) ??
    activeItems.find((item) => item.id === selectedRequestId);
  const listState =
    !isAuthHydrated || !hasHydrated ? 'loading' : isError ? 'error' : 'ready';
  const hasAnyRequest = allItems.length > 0;
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
      statusFilter,
      selectedRequestId,
    } satisfies NoteConsultationControllerState,
    viewModel: {
      hasAnyRequest,
      filteredItems,
      statusTabs,
      selectedItem,
      itemStatusSummaries,
      isRestoringPinnedItem,
      hasMissingPinnedItem,
      errorMessage: NOTE_CONSULTATION_LIST_ERROR_MESSAGE,
    } satisfies NoteConsultationControllerViewModel,
    actions: {
      setActiveChannel: (channel) => {
        if (lockedChannel) {
          return;
        }
        setActiveChannel(channel);
      },
      setStatusFilter,
      selectRequest: setSelectedRequestId,
    } satisfies NoteConsultationControllerActions,
  };
};
