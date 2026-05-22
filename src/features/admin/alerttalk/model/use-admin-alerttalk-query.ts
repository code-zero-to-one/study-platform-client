import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dryRunAdminAlerttalkSchedule,
  getAdminAlerttalkDeliveryLogDetail,
  getAdminAlerttalkDeliveryLogs,
  getAdminAlerttalkTemplates,
  retryAdminAlerttalkDeliveryLog,
  syncAdminAlerttalkTemplates,
  testSendAdminAlerttalkTemplate,
} from '@/features/admin/alerttalk/api/admin-alerttalk-api';
import type {
  AdminAlerttalkDeliveryLogFilters,
  AdminAlerttalkTemplateListParams,
} from '@/features/admin/alerttalk/model/admin-alerttalk-contract';
import { useToastStore } from '@/stores/use-toast-store';
import { analyzeError } from '@/utils/error-handler';

export const adminAlerttalkQueryKeys = {
  all: ['admin-alerttalk'] as const,
  templates: (params: AdminAlerttalkTemplateListParams) =>
    [...adminAlerttalkQueryKeys.all, 'templates', params] as const,
  templateLists: () => [...adminAlerttalkQueryKeys.all, 'templates'] as const,
  deliveryLogs: (filters: AdminAlerttalkDeliveryLogFilters) =>
    [...adminAlerttalkQueryKeys.all, 'delivery-logs', filters] as const,
  deliveryLogLists: () =>
    [...adminAlerttalkQueryKeys.all, 'delivery-logs'] as const,
  deliveryLogDetail: (jobId?: number) =>
    [...adminAlerttalkQueryKeys.all, 'delivery-log-detail', jobId] as const,
};

const showMutationError = (error: unknown) => {
  const { userMessage } = analyzeError(error);
  useToastStore
    .getState()
    .showToast(userMessage || '요청 처리 중 오류가 발생했습니다.', 'error');
};

export const useAdminAlerttalkTemplatesQuery = (
  params: AdminAlerttalkTemplateListParams,
) =>
  useQuery({
    queryKey: adminAlerttalkQueryKeys.templates(params),
    queryFn: () => getAdminAlerttalkTemplates(params),
    staleTime: 60_000,
  });

export const useAdminAlerttalkDeliveryLogsQuery = (
  filters: AdminAlerttalkDeliveryLogFilters,
) =>
  useQuery({
    queryKey: adminAlerttalkQueryKeys.deliveryLogs(filters),
    queryFn: () => getAdminAlerttalkDeliveryLogs(filters),
    staleTime: 30_000,
  });

export const useAdminAlerttalkDeliveryLogDetailQuery = (jobId?: number) =>
  useQuery({
    queryKey: adminAlerttalkQueryKeys.deliveryLogDetail(jobId),
    queryFn: () => getAdminAlerttalkDeliveryLogDetail(jobId ?? 0),
    enabled: typeof jobId === 'number',
    staleTime: 30_000,
  });

export const useSyncAdminAlerttalkTemplatesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncAdminAlerttalkTemplates,
    onSuccess: async (response) => {
      useToastStore
        .getState()
        .showToast(
          `${response.syncedCount}개 템플릿 상태를 동기화했습니다.`,
          'success',
        );
      await queryClient.invalidateQueries({
        queryKey: adminAlerttalkQueryKeys.templateLists(),
      });
    },
    onError: showMutationError,
  });
};

export const useTestSendAdminAlerttalkTemplateMutation = () =>
  useMutation({
    mutationFn: testSendAdminAlerttalkTemplate,
    onSuccess: () => {
      useToastStore
        .getState()
        .showToast('테스트 발송을 요청했습니다.', 'success');
    },
    onError: showMutationError,
  });

export const useRetryAdminAlerttalkDeliveryLogMutation = (jobId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryAdminAlerttalkDeliveryLog,
    onSuccess: async (response) => {
      useToastStore
        .getState()
        .showToast(
          `재실행 job ${response.retriedJobId}를 생성했습니다.`,
          'success',
        );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminAlerttalkQueryKeys.deliveryLogLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: adminAlerttalkQueryKeys.deliveryLogDetail(jobId),
        }),
      ]);
    },
    onError: showMutationError,
  });
};

export const useDryRunAdminAlerttalkScheduleMutation = () =>
  useMutation({
    mutationFn: dryRunAdminAlerttalkSchedule,
    onError: showMutationError,
  });
