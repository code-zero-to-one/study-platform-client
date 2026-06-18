'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import type {
  AdminMatchingCreateRequest,
  AdminMatchingUpdateRequest,
  AutoRunMatchingRequestDto,
  ResetWeeklyMatchingRequest,
} from '@/api/openapi/models';
import { useAuthReady } from '@/features/auth/model/use-auth';
import {
  getAdminMatchingRequest,
  useAdminMatchingAdminOptionsQuery,
  useAdminMatchingRequestListQuery,
  useCreateAdminMatchingRequestMutation,
  useDeleteAdminMatchingRequestMutation,
  useEndStudyCycleMutation,
  useAdminMatchingSchedulerConfigQuery,
  useMatchingSystemStatusQuery,
  useResetWeeklyMatchingMutation,
  useRunAutoMatchingJobMutation,
  useStartStudyCycleMutation,
  useUpdateAdminMatchingSchedulerConfigMutation,
  useUpdateAdminMatchingRequestMutation,
} from '@/hooks/queries/admin/admin-matching-queries';
import { useToastStore } from '@/stores/use-toast-store';
import {
  DEFAULT_ADMIN_MATCHING_SCHEDULED_DAY_OF_WEEK,
  DEFAULT_ADMIN_MATCHING_SCHEDULED_TIME,
} from '@/types/matching/admin-domain';
import type {
  AdminMatchingRequestDetail,
  AdminMatchingScheduledDayOfWeek,
} from '@/types/matching/admin-domain';
import {
  adminMatchingQueryKeys,
  DEFAULT_ADMIN_MATCHING_REQUEST_PAGE,
  type AdminMatchingRequestListFilters,
} from '@/types/matching/admin-query';
import type {
  AdminMatchingSchedulerConfigFormInput,
  AdminMatchingSchedulerConfigFormValues,
  AdminMatchingRequestListFilterFormInput,
  AdminMatchingRequestListFilterFormValues,
} from '@/types/schemas/admin-matching-schema';
import {
  ADMIN_MATCHING_FILTER_ALL_VALUE,
  toAdminMatchingSchedulerConfigUpdateRequest,
} from '@/types/schemas/admin-matching-schema';
import {
  formatDateDot,
  formatDateTimeDot,
  formatKoreaYMD,
  getKoreaCurrentMonday,
} from '@/utils/time';
import {
  ADMIN_MATCHING_SCHEDULED_DAY_META,
  ADMIN_MATCHING_REQUEST_STATUS_META,
  getAdminMatchingSchedulerMeta,
  ADMIN_MATCHING_SYSTEM_STATUS_META,
  UNKNOWN_ADMIN_MATCHING_SYSTEM_STATUS_META,
} from './admin-matching-meta';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const createDefaultRequestListFilterValues = (
  currentWeekMonday: string,
): AdminMatchingRequestListFilterFormInput => {
  return {
    weeklyPeriodIdentifier: currentWeekMonday,
    status: ADMIN_MATCHING_FILTER_ALL_VALUE,
    type: ADMIN_MATCHING_FILTER_ALL_VALUE,
    searchKeyword: '',
    pageSize: '20',
  };
};

const toSchedulerConfigFormInput = ({
  defaultAdminId,
  schedulerConfig,
}: {
  defaultAdminId?: number;
  schedulerConfig?: {
    enabled: boolean;
    autoCycleEndEnabled: boolean;
    adminId?: number;
    scheduledDayOfWeek: AdminMatchingScheduledDayOfWeek;
    scheduledTime: string;
    templateType?: 'STUDY' | 'TIME' | 'RANDOM';
    matchingKValue?: number;
    numberOfNearestNeighbors?: number;
    chunkSize?: number;
    saveResultsChunkSize?: number;
  };
}): AdminMatchingSchedulerConfigFormInput => {
  return {
    enabled: schedulerConfig?.enabled ?? false,
    autoCycleEndEnabled: schedulerConfig?.autoCycleEndEnabled ?? false,
    adminId: schedulerConfig?.adminId
      ? String(schedulerConfig.adminId)
      : defaultAdminId
        ? String(defaultAdminId)
        : '',
    scheduledDayOfWeek:
      schedulerConfig?.scheduledDayOfWeek ??
      DEFAULT_ADMIN_MATCHING_SCHEDULED_DAY_OF_WEEK,
    scheduledTime:
      schedulerConfig?.scheduledTime ?? DEFAULT_ADMIN_MATCHING_SCHEDULED_TIME,
    templateType: schedulerConfig?.templateType ?? '',
    matchingKValue:
      schedulerConfig?.matchingKValue !== undefined
        ? String(schedulerConfig.matchingKValue)
        : '',
    numberOfNearestNeighbors:
      schedulerConfig?.numberOfNearestNeighbors !== undefined
        ? String(schedulerConfig.numberOfNearestNeighbors)
        : '',
    chunkSize:
      schedulerConfig?.chunkSize !== undefined
        ? String(schedulerConfig.chunkSize)
        : '',
    saveResultsChunkSize:
      schedulerConfig?.saveResultsChunkSize !== undefined
        ? String(schedulerConfig.saveResultsChunkSize)
        : '',
  };
};

const toRequestListFilters = (
  values: AdminMatchingRequestListFilterFormValues,
): AdminMatchingRequestListFilters => {
  return {
    weeklyPeriodIdentifier: values.weeklyPeriodIdentifier,
    status:
      values.status === ADMIN_MATCHING_FILTER_ALL_VALUE
        ? undefined
        : values.status,
    type:
      values.type === ADMIN_MATCHING_FILTER_ALL_VALUE ? undefined : values.type,
    searchKeyword: values.searchKeyword,
    page: DEFAULT_ADMIN_MATCHING_REQUEST_PAGE,
    pageSize: Number(values.pageSize),
  };
};

export const useAdminMatchingController = () => {
  const queryClient = useQueryClient();
  const { memberId } = useAuthReady();
  const { showToast } = useToastStore();
  const adminOptionsQuery = useAdminMatchingAdminOptionsQuery();
  const schedulerConfigQuery = useAdminMatchingSchedulerConfigQuery();
  const systemStatusQuery = useMatchingSystemStatusQuery();
  const updateSchedulerConfigMutation =
    useUpdateAdminMatchingSchedulerConfigMutation();
  const runAutoMatchingMutation = useRunAutoMatchingJobMutation();
  const startStudyCycleMutation = useStartStudyCycleMutation();
  const endStudyCycleMutation = useEndStudyCycleMutation();
  const createMatchingRequestMutation = useCreateAdminMatchingRequestMutation();
  const updateMatchingRequestMutation = useUpdateAdminMatchingRequestMutation();
  const deleteMatchingRequestMutation = useDeleteAdminMatchingRequestMutation();
  const resetWeeklyMatchingMutation = useResetWeeklyMatchingMutation();

  const currentWeekMonday = formatKoreaYMD(getKoreaCurrentMonday());
  const requestListDefaultFilterValues = useMemo(
    () => createDefaultRequestListFilterValues(currentWeekMonday),
    [currentWeekMonday],
  );
  const schedulerConfigDefaultValues = useMemo(
    () =>
      toSchedulerConfigFormInput({
        defaultAdminId: memberId,
        schedulerConfig: schedulerConfigQuery.data,
      }),
    [memberId, schedulerConfigQuery.data],
  );

  const [requestListFilters, setRequestListFilters] =
    useState<AdminMatchingRequestListFilters>(() =>
      toRequestListFilters(requestListDefaultFilterValues),
    );
  const requestListQuery = useAdminMatchingRequestListQuery(requestListFilters);

  const [selectedRequest, setSelectedRequest] =
    useState<AdminMatchingRequestDetail>();
  const [selectedMatchingRequestId, setSelectedMatchingRequestId] =
    useState<number>();
  const [requestDetailErrorMessage, setRequestDetailErrorMessage] =
    useState('');
  const [isRequestDetailLoading, setIsRequestDetailLoading] = useState(false);

  const systemStatus = systemStatusQuery.data?.status;

  const systemStatusMeta = useMemo(() => {
    if (!systemStatus) {
      return UNKNOWN_ADMIN_MATCHING_SYSTEM_STATUS_META;
    }

    return ADMIN_MATCHING_SYSTEM_STATUS_META[systemStatus];
  }, [systemStatus]);
  const schedulerConfigMeta = useMemo(
    () => getAdminMatchingSchedulerMeta(schedulerConfigQuery.data),
    [schedulerConfigQuery.data],
  );

  const selectMatchingRequest = async (matchingRequestId: number) => {
    setSelectedMatchingRequestId(matchingRequestId);
    setIsRequestDetailLoading(true);

    try {
      const request = await queryClient.fetchQuery({
        queryKey: adminMatchingQueryKeys.requestDetail(matchingRequestId),
        queryFn: () => getAdminMatchingRequest(matchingRequestId),
        staleTime: 0,
      });

      setSelectedRequest(request);
      setRequestDetailErrorMessage('');
    } catch (error) {
      const message = getErrorMessage(
        error,
        '매칭 요청 상세를 불러오지 못했습니다.',
      );

      setSelectedRequest(undefined);
      setRequestDetailErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsRequestDetailLoading(false);
    }
  };

  const applyRequestListFilters = (
    values: AdminMatchingRequestListFilterFormValues,
  ) => {
    setRequestListFilters(toRequestListFilters(values));
    setSelectedMatchingRequestId(undefined);
    setSelectedRequest(undefined);
    setRequestDetailErrorMessage('');
  };

  const changeRequestListPage = (page: number) => {
    setRequestListFilters((previous) => ({
      ...previous,
      page,
    }));
  };

  const runAutoMatching = async (request: AutoRunMatchingRequestDto) => {
    try {
      const result = await runAutoMatchingMutation.mutateAsync(request);

      if (selectedMatchingRequestId) {
        await selectMatchingRequest(selectedMatchingRequestId);
      }

      showToast(result.message ?? '자동 매칭 실행을 요청했습니다.', 'success');
    } catch (error) {
      showToast(
        getErrorMessage(error, '자동 매칭 실행 요청에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const updateSchedulerConfig = async (
    values: AdminMatchingSchedulerConfigFormValues,
  ) => {
    try {
      const result = await updateSchedulerConfigMutation.mutateAsync(
        toAdminMatchingSchedulerConfigUpdateRequest(values),
      );

      showToast(
        result.message ?? '자동 매칭 스케줄러 설정을 저장했습니다.',
        'success',
      );
    } catch (error) {
      showToast(
        getErrorMessage(error, '자동 매칭 스케줄러 설정 저장에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const startStudyCycle = async () => {
    try {
      const result = await startStudyCycleMutation.mutateAsync();

      await systemStatusQuery.refetch();
      showToast(result.message ?? '스터디 사이클을 시작했습니다.', 'success');
    } catch (error) {
      showToast(
        getErrorMessage(error, '스터디 사이클 시작에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const endStudyCycle = async () => {
    try {
      const result = await endStudyCycleMutation.mutateAsync();

      await systemStatusQuery.refetch();
      showToast(result.message ?? '스터디 사이클을 종료했습니다.', 'success');
    } catch (error) {
      showToast(
        getErrorMessage(error, '스터디 사이클 종료에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const createMatchingRequest = async (request: AdminMatchingCreateRequest) => {
    try {
      const result = await createMatchingRequestMutation.mutateAsync(request);

      setSelectedMatchingRequestId(result.request.matchingRequestId);
      setSelectedRequest(result.request);
      setRequestDetailErrorMessage('');
      showToast(result.message ?? '수동 매칭을 생성했습니다.', 'success');

      return result.request;
    } catch (error) {
      showToast(
        getErrorMessage(error, '수동 매칭 생성에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const updateMatchingRequest = async ({
    request,
  }: {
    request: AdminMatchingUpdateRequest;
  }) => {
    if (!selectedRequest) {
      showToast('먼저 목록에서 매칭 요청을 선택해주세요.', 'error');

      return null;
    }

    const nextContent = request.content ?? '';
    const currentContent = selectedRequest.content ?? '';
    const hasChanged =
      request.partnerId !== selectedRequest.partnerId ||
      request.status !== selectedRequest.status ||
      nextContent !== currentContent;

    if (!hasChanged) {
      showToast('변경된 내용이 없습니다.', 'error');

      return null;
    }

    try {
      const result = await updateMatchingRequestMutation.mutateAsync({
        matchingRequestId: selectedRequest.matchingRequestId,
        request,
        fallbackWeeklyPeriodIdentifier: selectedRequest.weeklyPeriodIdentifier,
      });

      setSelectedMatchingRequestId(result.request.matchingRequestId);
      setSelectedRequest(result.request);
      setRequestDetailErrorMessage('');
      showToast(result.message ?? '매칭 요청을 수정했습니다.', 'success');

      return result.request;
    } catch (error) {
      showToast(
        getErrorMessage(error, '매칭 요청 수정에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const deleteMatchingRequest = async () => {
    if (!selectedRequest) {
      showToast('삭제할 매칭 요청이 없습니다.', 'error');

      return;
    }

    try {
      await deleteMatchingRequestMutation.mutateAsync(
        selectedRequest.matchingRequestId,
      );

      setSelectedMatchingRequestId(undefined);
      setSelectedRequest(undefined);
      setRequestDetailErrorMessage('');
      showToast('매칭 요청을 삭제했습니다.', 'success');
    } catch (error) {
      showToast(
        getErrorMessage(error, '매칭 요청 삭제에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const resetWeeklyMatching = async (request: ResetWeeklyMatchingRequest) => {
    try {
      const result = await resetWeeklyMatchingMutation.mutateAsync(request);

      if (
        selectedRequest?.weeklyPeriodIdentifier &&
        selectedRequest.weeklyPeriodIdentifier ===
          request.weeklyPeriodIdentifier
      ) {
        setSelectedMatchingRequestId(undefined);
        setSelectedRequest(undefined);
      }
      setRequestDetailErrorMessage('');
      showToast(result.message ?? '주차 데이터를 초기화했습니다.', 'success');

      return result.result;
    } catch (error) {
      showToast(
        getErrorMessage(error, '주차 데이터 초기화에 실패했습니다.'),
        'error',
      );
      throw error;
    }
  };

  const selectedRequestStatusMeta = selectedRequest
    ? ADMIN_MATCHING_REQUEST_STATUS_META[selectedRequest.status]
    : undefined;

  return {
    state: {
      adminOptions: adminOptionsQuery.data ?? [],
      adminOptionsErrorMessage: adminOptionsQuery.isError
        ? getErrorMessage(
            adminOptionsQuery.error,
            '관리자 목록을 불러오지 못했습니다.',
          )
        : '',
      defaultAdminId: memberId,
      schedulerConfig: schedulerConfigQuery.data,
      schedulerConfigErrorMessage: schedulerConfigQuery.isError
        ? getErrorMessage(
            schedulerConfigQuery.error,
            '자동 매칭 스케줄러 설정을 불러오지 못했습니다.',
          )
        : '',
      requestList: requestListQuery.data,
      requestListFilters,
      requestListErrorMessage: requestListQuery.isError
        ? getErrorMessage(
            requestListQuery.error,
            '매칭 요청 목록을 불러오지 못했습니다.',
          )
        : '',
      selectedMatchingRequestId,
      selectedRequest,
      requestDetailErrorMessage,
      isRequestListLoading: requestListQuery.isLoading,
      isRequestListFetching: requestListQuery.isFetching,
      isRequestDetailLoading,
      isAdminOptionsLoading: adminOptionsQuery.isLoading,
      isSchedulerConfigLoading: schedulerConfigQuery.isLoading,
      isSchedulerConfigSaving: updateSchedulerConfigMutation.isPending,
      isSystemStatusLoading: systemStatusQuery.isLoading,
      isRunPending: runAutoMatchingMutation.isPending,
      isStartCyclePending: startStudyCycleMutation.isPending,
      isEndCyclePending: endStudyCycleMutation.isPending,
      isCreatePending: createMatchingRequestMutation.isPending,
      isUpdatePending: updateMatchingRequestMutation.isPending,
      isDeletePending: deleteMatchingRequestMutation.isPending,
      isResetPending: resetWeeklyMatchingMutation.isPending,
    },
    viewModel: {
      currentWeekMonday,
      schedulerConfigDefaultValues,
      requestListDefaultFilterValues,
      requestListSummary: {
        totalElements: requestListQuery.data?.totalElements ?? 0,
      },
      schedulerConfigMeta,
      schedulerConfigSummary: {
        scheduledRunText: `${
          ADMIN_MATCHING_SCHEDULED_DAY_META[
            schedulerConfigQuery.data?.scheduledDayOfWeek ??
              DEFAULT_ADMIN_MATCHING_SCHEDULED_DAY_OF_WEEK
          ].label
        } ${schedulerConfigQuery.data?.scheduledTime ?? DEFAULT_ADMIN_MATCHING_SCHEDULED_TIME}`,
        autoCycleEndText: schedulerConfigQuery.data?.autoCycleEndEnabled
          ? '활성화'
          : '비활성화',
        adminText: schedulerConfigQuery.data?.adminName
          ? `${schedulerConfigQuery.data.adminName}${
              schedulerConfigQuery.data.adminId
                ? ` (#${schedulerConfigQuery.data.adminId})`
                : ''
            }`
          : schedulerConfigQuery.data?.adminId
            ? `#${schedulerConfigQuery.data.adminId}`
            : '-',
        updatedAtText: schedulerConfigQuery.data?.updatedAt
          ? formatDateTimeDot(schedulerConfigQuery.data.updatedAt)
          : '-',
      },
      systemStatus,
      systemStatusMeta,
      systemStatusErrorMessage: systemStatusQuery.isError
        ? getErrorMessage(
            systemStatusQuery.error,
            '매칭 시스템 상태를 불러오지 못했습니다.',
          )
        : '',
      canStartCycle: systemStatus !== 'STUDYING',
      canEndCycle: systemStatus === 'STUDYING',
      selectedRequestStatusMeta,
      selectedRequestSummary: selectedRequest
        ? {
            memberText: selectedRequest.memberName
              ? `${selectedRequest.memberName} (#${selectedRequest.memberId})`
              : `#${selectedRequest.memberId}`,
            partnerText: selectedRequest.partnerName
              ? `${selectedRequest.partnerName} (#${selectedRequest.partnerId})`
              : `#${selectedRequest.partnerId}`,
            createdAtText: selectedRequest.createdAt
              ? formatDateTimeDot(selectedRequest.createdAt)
              : '-',
            updatedAtText: selectedRequest.updatedAt
              ? formatDateTimeDot(selectedRequest.updatedAt)
              : '-',
            weeklyPeriodIdentifierText: selectedRequest.weeklyPeriodIdentifier
              ? formatDateDot(selectedRequest.weeklyPeriodIdentifier)
              : '-',
          }
        : undefined,
    },
    actions: {
      applyRequestListFilters,
      changeRequestListPage,
      selectMatchingRequest,
      updateSchedulerConfig,
      runAutoMatching,
      startStudyCycle,
      endStudyCycle,
      createMatchingRequest,
      updateMatchingRequest,
      deleteMatchingRequest,
      resetWeeklyMatching,
    },
  };
};
