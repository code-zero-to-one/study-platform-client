import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { SettlementUserApi } from '@/api/openapi/api/settlement-user-api';
import type { SettlementSearchConditionStatusEnum } from '@/api/openapi/models/settlement-search-condition';

const settlementUserApi = createApiInstance(SettlementUserApi);

interface SettlementParams {
  page?: number;
  size?: number;
  sort?: string[];
  startDate?: string;
  endDate?: string;
  studyTitle?: string;
  settlementId?: number;
  status?: SettlementSearchConditionStatusEnum;
}

export const useGetMySettlements = ({
  page = 0,
  size = 10,
  sort,
  startDate,
  endDate,
  studyTitle,
  settlementId,
  status,
}: SettlementParams = {}) => {
  return useQuery({
    queryKey: [
      'mySettlements',
      page,
      size,
      sort,
      startDate,
      endDate,
      studyTitle,
      settlementId,
      status,
    ],
    queryFn: async () => {
      const sortString = sort?.join(',');

      const { data } = await settlementUserApi.getMySettlements(
        {
          startDate,
          endDate,
          studyTitle,
          settlementId,
          status,
        },
        {
          page,
          size,
          sort,
        },
        startDate,
        endDate,
        studyTitle,
        settlementId,
        status,
        page,
        size,
        sortString,
      );

      return data.content;
    },
  });
};
