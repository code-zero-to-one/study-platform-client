import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { BankSearchApi } from '@/api/openapi';
import {
  type BankSearchApiResponse,
  type BankSearchQueryKey,
  type BankSearchResponse,
} from '@/types/mentoring-api';

const bankSearchApi = createApiInstance(BankSearchApi);
const BANK_SEARCH_QUERY_KEY: BankSearchQueryKey = ['bankSearch'];

export const useSearchBanks = () => {
  return useQuery<BankSearchResponse>({
    queryKey: BANK_SEARCH_QUERY_KEY,
    queryFn: async () => {
      const response = await bankSearchApi.getBanks();
      const responseData: BankSearchApiResponse = response.data;

      return responseData.content ?? [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
