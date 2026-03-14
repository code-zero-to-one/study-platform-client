'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuthReady } from '@/hooks/common/use-auth';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  NoteConsultationControllerActions,
  NoteConsultationControllerResult,
  NoteConsultationControllerState,
  NoteConsultationControllerViewModel,
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

const hasMentorFirstReply = (item: NoteConsultationListItem) => {
  return (
    item.mentorReplyCount > 0 ||
    item.request.conversation.some((message) => {
      return message.sender === 'MENTOR';
    })
  );
};

const hasAcceptedRequest = (request: MentoringRequest) => {
  return (
    request.status === 'ACCEPTED' ||
    request.displayStatus === 'NOTE_WAITING' ||
    request.displayStatus === 'COMPLETED'
  );
};

const isRejectedRequest = (request: MentoringRequest) => {
  return request.status === 'REJECTED' || request.displayStatus === 'REJECTED';
};

const isClosedRequest = (request: MentoringRequest) => {
  return (
    request.status === 'CLOSED' ||
    request.displayStatus === 'COMPLETED' ||
    request.displayStatus === 'CANCELLED'
  );
};

const getMentorStageFilter = (
  item: NoteConsultationListItem,
): NoteConsultationStatusFilter => {
  const { request } = item;
  const mentorFirstReplyExists = hasMentorFirstReply(item);

  if (isRejectedRequest(request) || isClosedRequest(request)) {
    return 'mentor-completed';
  }
  if (mentorFirstReplyExists) {
    return 'mentor-completed';
  }
  if (hasAcceptedRequest(request)) {
    return 'mentor-drafting';
  }

  return 'mentor-requested';
};

const getMenteeStageFilter = (
  item: NoteConsultationListItem,
): NoteConsultationStatusFilter => {
  const { request } = item;
  const mentorFirstReplyExists = hasMentorFirstReply(item);

  if (isRejectedRequest(request) || isClosedRequest(request)) {
    return 'mentee-completed';
  }
  if (mentorFirstReplyExists) {
    return 'mentee-answered';
  }
  if (hasAcceptedRequest(request) || request.status === 'PENDING') {
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
    return getMentorStageFilter(item) === filter;
  }
  if (preset === 'mentee') {
    return getMenteeStageFilter(item) === filter;
  }

  return false;
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

export const useNoteConsultationController = ({
  initialRequestId,
  initialChannel,
  lockedChannel,
  statusTabPreset = 'none',
  mentorIdOverride,
}: {
  initialRequestId?: string;
  initialChannel?: NoteConsultationChannel;
  lockedChannel?: NoteConsultationChannel;
  statusTabPreset?: NoteConsultationStatusTabPreset;
  mentorIdOverride?: number;
} = {}): NoteConsultationControllerResult => {
  const { memberId, isHydrated: isAuthHydrated } = useAuthReady();
  const { hasHydrated, sentItems, receivedItems, isError, isFetching } =
    useNoteConsultationQuery({ memberId, mentorIdOverride });
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
    const hasSelectedInActiveItems = activeItems.some(
      (item) => item.id === selectedRequestId,
    );

    if (!filteredItems.length) {
      if (!initialRequestId && !hasSelectedInActiveItems) {
        setSelectedRequestId('');
      }

      return;
    }

    if (!hasSelectedInActiveItems && !initialRequestId) {
      setSelectedRequestId('');
    }
  }, [activeItems, filteredItems, initialRequestId, selectedRequestId]);

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
