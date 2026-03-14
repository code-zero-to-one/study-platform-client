'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
  MENTORING_PAYMENT_STATUS_META,
  MENTORING_REQUEST_STATUS_META,
} from '@/features/mentoring/model/management-status-meta';
import { getMethodLabel } from '@/features/mentoring/model/mentor-profile-utils';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  MentoringRequestPanelActions,
  MentoringRequestPanelControllerResult,
  MentoringRequestPanelMode,
  MentoringRequestPanelState,
  MentoringRequestPanelViewModel,
  MentoringRequestRowViewModel,
  UseMentoringRequestPanelControllerParams,
} from '@/types/mentoring/management-request-panel-view';
import { useMentorWorkspaceQuery } from './use-mentor-workspace-query';

const MENTORING_REQUEST_DETAIL_BASE_PATH = '/mentoring-management/requests';
const EMPTY_REQUESTS: MentoringRequest[] = [];

const getPreferredScheduleText = (request: MentoringRequest) => {
  if (request.method === 'note') {
    return request.status === 'ACCEPTED'
      ? '멘토 답변 1회로 진행'
      : '수락 후 첫 답변으로 시작';
  }

  if (!request.preferredDate) {
    return '수락 후 확인가능';
  }
  if (!request.preferredTime) {
    return dayjs(request.preferredDate).format('YYYY.MM.DD');
  }

  return `${dayjs(request.preferredDate).format('YYYY.MM.DD')} ${request.preferredTime}`;
};

const toRequestDetailHref = (requestId: string) => {
  return `${MENTORING_REQUEST_DETAIL_BASE_PATH}?id=${requestId}`;
};

const hasMentorFirstReply = (request: MentoringRequest) => {
  return request.conversation.some((message) => message.sender === 'MENTOR');
};

const getAttentionMeta = (request: MentoringRequest) => {
  if (request.status === 'PENDING') {
    const hours = dayjs().diff(dayjs(request.requestedAt), 'hour');
    if (hours >= 24) {
      return {
        label: '24시간 초과',
        color: 'red' as const,
      };
    }
  }

  if (
    request.method !== 'note' &&
    request.status === 'ACCEPTED' &&
    !request.linkedSessionId
  ) {
    return {
      label: '일정 확정 필요',
      color: 'orange' as const,
    };
  }

  if (
    request.method === 'note' &&
    request.status === 'ACCEPTED' &&
    !hasMentorFirstReply(request)
  ) {
    return {
      label: '첫 답변 필요',
      color: 'blue' as const,
    };
  }

  return undefined;
};

const getActionMeta = (request: MentoringRequest) => {
  if (request.status === 'PENDING') {
    return {
      label: request.method === 'note' ? '수락 결정' : '일정 검토',
      description:
        request.method === 'note'
          ? '질문 범위와 자료를 보고 수락 또는 거절을 결정하세요.'
          : '희망 일정과 질문 범위를 보고 수락 또는 거절을 결정하세요.',
    };
  }

  if (request.status === 'ACCEPTED') {
    if (request.method === 'note') {
      return {
        label: hasMentorFirstReply(request) ? '답변 확인' : '첫 답변 준비',
        description: hasMentorFirstReply(request)
          ? '답변 내용과 상담 종료 여부를 바로 확인하세요.'
          : '첫 답변 1회가 이번 쪽지상담의 핵심 응답입니다.',
      };
    }

    return {
      label: request.linkedSessionId ? '확정 내용 확인' : '일정 확정',
      description: request.linkedSessionId
        ? '확정 시간과 진행 채널 또는 장소가 최신인지 확인하세요.'
        : '상세 화면에서 시간과 진행 방식 또는 장소를 확정하세요.',
    };
  }

  return {
    label: '처리 확인',
    description: '남긴 사유와 기록이 멘티에게 충분히 전달되는지 확인하세요.',
  };
};

export const useMentoringRequestPanelController = ({
  mentorId,
  filterRequestId,
}: UseMentoringRequestPanelControllerParams): MentoringRequestPanelControllerResult => {
  const workspaceQuery = useMentorWorkspaceQuery({
    mentorId,
    enabled: true,
  });
  const allRequests = workspaceQuery.data?.allRequests ?? EMPTY_REQUESTS;

  const requests = useMemo(() => {
    if (!filterRequestId) {
      return allRequests;
    }

    return allRequests.filter((request) => request.id === filterRequestId);
  }, [allRequests, filterRequestId]);

  const urgentCount = useMemo(() => {
    return requests.filter(
      (request) =>
        request.status === 'PENDING' &&
        dayjs().diff(dayjs(request.requestedAt), 'hour') >= 24,
    ).length;
  }, [requests]);

  const mode = useMemo<MentoringRequestPanelMode>(() => {
    if (!workspaceQuery.isFetched) {
      return filterRequestId ? 'detail' : 'list';
    }

    if (workspaceQuery.isFetched && requests.length === 0) {
      return 'empty';
    }
    if (filterRequestId && requests.length === 1) {
      return 'detail';
    }

    return 'list';
  }, [filterRequestId, requests.length, workspaceQuery.isFetched]);

  const rows = useMemo<MentoringRequestRowViewModel[]>(() => {
    return requests.map((request) => {
      const statusMeta = MENTORING_REQUEST_STATUS_META[request.status];
      const paymentMeta = MENTORING_PAYMENT_STATUS_META[request.paymentStatus];
      const attentionMeta = getAttentionMeta(request);
      const actionMeta = getActionMeta(request);

      return {
        id: request.id,
        statusLabel: statusMeta.label,
        statusColor: statusMeta.color,
        paymentStatusLabel: paymentMeta.label,
        paymentStatusColor: paymentMeta.color,
        methodLabel: getMethodLabel(request.method),
        menteeName: request.menteeName,
        menteeRole: request.menteeRole,
        requestedAtText: dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm'),
        requestedAtLabel: '접수일',
        preferredScheduleText: getPreferredScheduleText(request),
        preferredScheduleLabel:
          request.method === 'note' ? '진행 방식' : '희망 일정',
        attentionLabel: attentionMeta?.label,
        attentionColor: attentionMeta?.color,
        actionLabel: actionMeta.label,
        actionDescription: actionMeta.description,
      };
    });
  }, [requests]);

  return {
    state: {
      mode,
      urgentCount,
      detailRequest: mode === 'detail' ? requests[0] : undefined,
    } satisfies MentoringRequestPanelState,
    viewModel: {
      titleText: '신청 목록',
      showUrgentBanner: urgentCount > 0 && mode === 'list',
      rows,
    } satisfies MentoringRequestPanelViewModel,
    actions: {
      toRequestDetailHref,
    } satisfies MentoringRequestPanelActions,
  };
};
