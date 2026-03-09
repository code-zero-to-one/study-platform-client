import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstanceV2 } from '@/api/client/axiosV2';
import { createApiInstance } from '@/api/client/open-api-instance';
import { AdminMatchingApi, MatchingApi } from '@/api/openapi';
import type {
  AdminMatchingCreateRequest,
  AdminMatchingUpdateRequest,
  AutoRunMatchingRequestDto,
  ResetWeeklyMatchingRequest,
} from '@/api/openapi/models';
import {
  normalizeAdminMatchingQueryError,
  parseAdminMatchingAdminOptionsOrThrow,
  parseAdminMatchingSchedulerConfigOrThrow,
  parseAdminMatchingRequestListOrThrow,
  parseAdminMatchingRequestOrThrow,
  parseAdminMatchingSystemStatusOrThrow,
  parseResetWeeklyMatchingResponseOrThrow,
} from '@/features/admin/matching/model/admin-matching-contract';
import type { AdminMatchingRequestListFilters } from '@/types/matching/admin-query';
import { adminMatchingQueryKeys } from '@/types/matching/admin-query';
import type { AdminMatchingSchedulerConfigUpdateRequest } from '@/types/schemas/admin-matching-schema';

const matchingApi = createApiInstance(MatchingApi);
const adminMatchingApi = createApiInstance(AdminMatchingApi);
const ADMIN_MATCHING_ADMIN_MEMBER_PARAMS = {
  'role-id': 'ROLE_ADMIN',
  'member-status': 'ACTIVE',
  page: 1,
  'page-size': 100,
} as const;

const getMatchingRequestExtraFields = (response: unknown) => {
  const record = (response ?? {}) as {
    weeklyPeriodIdentifier?: string;
    content?: string;
  };

  return {
    weeklyPeriodIdentifier: record.weeklyPeriodIdentifier,
    content: record.content,
  };
};

const setAdminMatchingRequestCache = ({
  queryClient,
  request,
}: {
  queryClient: ReturnType<typeof useQueryClient>;
  request: ReturnType<typeof parseAdminMatchingRequestOrThrow>;
}) => {
  queryClient.setQueryData(
    adminMatchingQueryKeys.requestDetail(request.matchingRequestId),
    request,
  );
};

const toAdminMatchingRequestListParams = (
  filters: AdminMatchingRequestListFilters,
) => {
  return {
    'weekly-period-identifier': filters.weeklyPeriodIdentifier,
    status: filters.status,
    type: filters.type,
    'search-keyword': filters.searchKeyword,
    page: filters.page,
    'page-size': filters.pageSize,
  };
};

export const getAdminMatchingRequestList = async (
  filters: AdminMatchingRequestListFilters,
) => {
  try {
    const { data } = await axiosInstanceV2.get<{
      content?: unknown;
      message?: string;
    }>('/api/v1/admin/matching/requests', {
      params: toAdminMatchingRequestListParams(filters),
    });

    return parseAdminMatchingRequestListOrThrow(data.content);
  } catch (error) {
    throw normalizeAdminMatchingQueryError(error);
  }
};

export const getAdminMatchingAdminOptions = async () => {
  try {
    const { data } = await axiosInstanceV2.get<{
      content?: unknown;
      message?: string;
    }>('/api/v1/admin/members', {
      params: ADMIN_MATCHING_ADMIN_MEMBER_PARAMS,
    });

    return parseAdminMatchingAdminOptionsOrThrow(data.content);
  } catch (error) {
    throw normalizeAdminMatchingQueryError(error);
  }
};

export const getAdminMatchingSchedulerConfig = async () => {
  try {
    const { data } = await axiosInstanceV2.get<{
      content?: unknown;
      message?: string;
    }>('/api/v1/admin/matching/scheduler-config');

    return parseAdminMatchingSchedulerConfigOrThrow(data.content);
  } catch (error) {
    throw normalizeAdminMatchingQueryError(error);
  }
};

export const getAdminMatchingRequest = async (matchingRequestId: number) => {
  try {
    const { data } =
      await adminMatchingApi.getMatchingRequest(matchingRequestId);

    return parseAdminMatchingRequestOrThrow(data.content);
  } catch (error) {
    throw normalizeAdminMatchingQueryError(error);
  }
};

export const useAdminMatchingRequestListQuery = (
  filters: AdminMatchingRequestListFilters,
) => {
  return useQuery({
    queryKey: adminMatchingQueryKeys.requestList(filters),
    queryFn: () => getAdminMatchingRequestList(filters),
    staleTime: 60_000,
  });
};

export const useAdminMatchingAdminOptionsQuery = () => {
  return useQuery({
    queryKey: adminMatchingQueryKeys.adminMembers(),
    queryFn: getAdminMatchingAdminOptions,
    staleTime: 60_000,
  });
};

export const useAdminMatchingSchedulerConfigQuery = () => {
  return useQuery({
    queryKey: adminMatchingQueryKeys.schedulerConfig(),
    queryFn: getAdminMatchingSchedulerConfig,
    staleTime: 60_000,
  });
};

export const useMatchingSystemStatusQuery = () => {
  return useQuery({
    queryKey: adminMatchingQueryKeys.systemStatus(),
    queryFn: async () => {
      try {
        const { data } = await matchingApi.getMatchingSystemStatus();

        return parseAdminMatchingSystemStatusOrThrow(data.content);
      } catch (error) {
        throw normalizeAdminMatchingQueryError(error);
      }
    },
    staleTime: 60_000,
  });
};

export const useUpdateAdminMatchingSchedulerConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AdminMatchingSchedulerConfigUpdateRequest) => {
      const { data } = await axiosInstanceV2.patch<{
        content?: unknown;
        message?: string;
      }>('/api/v1/admin/matching/scheduler-config', request);

      return {
        config: parseAdminMatchingSchedulerConfigOrThrow(data.content),
        message: data.message,
      };
    },
    onSuccess: ({ config }) => {
      queryClient.setQueryData(
        adminMatchingQueryKeys.schedulerConfig(),
        config,
      );
    },
  });
};

export const useRunAutoMatchingJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AutoRunMatchingRequestDto) => {
      const { data } = await adminMatchingApi.runAutoMatchingJob(request);

      return {
        message: data.message,
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.systemStatus(),
      });
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.requests(),
      });
    },
  });
};

export const useStartStudyCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await adminMatchingApi.startStudyCycle();

      return {
        message: data.message,
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.systemStatus(),
      });
    },
  });
};

export const useEndStudyCycleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await adminMatchingApi.endStudyCycle();

      return {
        message: data.message,
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.systemStatus(),
      });
    },
  });
};

export const useCreateAdminMatchingRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AdminMatchingCreateRequest) => {
      const { data } =
        await adminMatchingApi.createMatchingRequestByAdmin(request);
      const extraFields = getMatchingRequestExtraFields(data.content);
      const parsedRequest = parseAdminMatchingRequestOrThrow({
        ...data.content,
        weeklyPeriodIdentifier:
          extraFields.weeklyPeriodIdentifier ?? request.weeklyPeriodIdentifier,
        content: extraFields.content ?? request.content,
      });

      return {
        request: parsedRequest,
        message: data.message,
      };
    },
    onSuccess: async ({ request }) => {
      setAdminMatchingRequestCache({ queryClient, request });
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.requests(),
      });
    },
  });
};

export const useUpdateAdminMatchingRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchingRequestId,
      request,
      fallbackWeeklyPeriodIdentifier,
    }: {
      matchingRequestId: number;
      request: AdminMatchingUpdateRequest;
      fallbackWeeklyPeriodIdentifier?: string;
    }) => {
      const { data } = await adminMatchingApi.updateMatchingRequestByAdmin(
        matchingRequestId,
        request,
      );
      const extraFields = getMatchingRequestExtraFields(data.content);
      const parsedRequest = parseAdminMatchingRequestOrThrow({
        ...data.content,
        weeklyPeriodIdentifier:
          extraFields.weeklyPeriodIdentifier ?? fallbackWeeklyPeriodIdentifier,
      });

      return {
        request: parsedRequest,
        message: data.message,
      };
    },
    onSuccess: async ({ request }) => {
      setAdminMatchingRequestCache({ queryClient, request });
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.requestDetail(
          request.matchingRequestId,
        ),
      });
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.requests(),
      });
    },
  });
};

export const useDeleteAdminMatchingRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchingRequestId: number) => {
      await adminMatchingApi.deleteMatchingRequestByAdmin(matchingRequestId);

      return {
        matchingRequestId,
      };
    },
    onSuccess: async ({ matchingRequestId }) => {
      queryClient.removeQueries({
        queryKey: adminMatchingQueryKeys.requestDetail(matchingRequestId),
      });
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.requests(),
      });
    },
  });
};

export const useResetWeeklyMatchingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ResetWeeklyMatchingRequest) => {
      const { data } = await adminMatchingApi.resetWeeklyMatching(request);

      return {
        result: parseResetWeeklyMatchingResponseOrThrow(data.content),
        message: data.message,
      };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminMatchingQueryKeys.requests(),
      });
    },
  });
};
