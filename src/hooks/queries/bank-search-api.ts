import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { BankSearchApi } from '@/api/openapi';

const bankSearchApi = createApiInstance(BankSearchApi);

export const useSearchBanks = () => {
  return useQuery({
    queryKey: ['bankSearch'],
    queryFn: async () => {
      const { data } = await bankSearchApi.getBanks();

      return data.content;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
