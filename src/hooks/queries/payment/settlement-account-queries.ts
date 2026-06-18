import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { SettlementAccountApi } from '@/api/openapi';
import type { SettlementAccountRegisterRequest } from '@/api/openapi/models/settlement-account-register-request';

const settlementAccountApi = createApiInstance(SettlementAccountApi);

export const useGetSettlementAccount = (enabled = true) => {
  return useQuery({
    queryKey: ['settlementAccount'],
    queryFn: async () => {
      const { data } = await settlementAccountApi.get();

      return data.content;
    },
    retry: false,
    enabled,
  });
};

export const useRegisterSettlementAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SettlementAccountRegisterRequest) => {
      const { data } = await settlementAccountApi.register(request);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settlementAccount'] });
    },
  });
};

export const useUpdateSettlementAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: SettlementAccountRegisterRequest) => {
      const { data } = await settlementAccountApi.update(request);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settlementAccount'] });
    },
  });
};

export const useDeleteSettlementAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await settlementAccountApi._delete();

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settlementAccount'] });
    },
  });
};
