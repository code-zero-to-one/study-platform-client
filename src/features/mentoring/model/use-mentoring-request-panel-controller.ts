'use client';

import dayjs from 'dayjs';
import { useMemo } from 'react';
import { MENTORING_REQUEST_STATUS_META } from '@/features/mentoring/model/management-status-meta';
import { getMethodLabel } from '@/features/mentoring/model/mentor-profile-utils';
import { useMentoringManagementStore } from '@/stores/useMentoringManagementStore';
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

const MENTORING_REQUEST_DETAIL_BASE_PATH = '/mentoring-management/requests';

const getPreferredScheduleText = (request: MentoringRequest) => {
  if (!request.preferredDate) {
    return '수락 후 확인가능';
  }
  if (!request.preferredTime) {
    return request.preferredDate;
  }

  return `${dayjs(request.preferredDate).format('YY. MM. DD.')} ${request.preferredTime}`;
};

const toRequestDetailHref = (requestId: string) => {
  return `${MENTORING_REQUEST_DETAIL_BASE_PATH}?id=${requestId}`;
};

export const useMentoringRequestPanelController = ({
  mentorId,
  filterRequestId,
}: UseMentoringRequestPanelControllerParams): MentoringRequestPanelControllerResult => {
  const allRequests = useMentoringManagementStore(
    (state) => state.requestsByMentor[mentorId] ?? [],
  );

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
        request.paymentMode === 'MANUAL_TRANSFER' &&
        request.paymentStatus === 'PENDING_TRANSFER',
    ).length;
  }, [requests]);

  const mode = useMemo<MentoringRequestPanelMode>(() => {
    if (requests.length === 0) {
      return 'empty';
    }
    if (filterRequestId && requests.length === 1) {
      return 'detail';
    }

    return 'list';
  }, [filterRequestId, requests.length]);

  const rows = useMemo<MentoringRequestRowViewModel[]>(() => {
    return requests.map((request) => {
      const statusMeta = MENTORING_REQUEST_STATUS_META[request.status];

      return {
        id: request.id,
        statusLabel: statusMeta.label,
        statusColor: statusMeta.color,
        methodLabel: getMethodLabel(request.method),
        menteeName: request.menteeName,
        menteeRole: request.menteeRole,
        requestedAtText: dayjs(request.requestedAt).format('YYYY.MM.DD (ddd)'),
        preferredScheduleText: getPreferredScheduleText(request),
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
      titleText: '개별지',
      showUrgentBanner: urgentCount > 0 && mode === 'list',
      rows,
    } satisfies MentoringRequestPanelViewModel,
    actions: {
      toRequestDetailHref,
    } satisfies MentoringRequestPanelActions,
  };
};
