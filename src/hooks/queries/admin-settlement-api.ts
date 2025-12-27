import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { AdminSettlementApi } from '@/api/openapi';
import type {
  SettlementSearchCondition,
  Pageable,
  StudySettlementCreateRequest,
} from '@/api/openapi/models';

const adminSettlementApi = createApiInstance(AdminSettlementApi);

interface SettlementsForAdminParams {
  condition: SettlementSearchCondition;
  pageable: Pageable;
  startDate?: string;
  endDate?: string;
  studyTitle?: string;
  settlementId?: number;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const useGetSettlementsForAdmin = ({
  condition,
  pageable,
  startDate,
  endDate,
  studyTitle,
  settlementId,
  status,
  page = 0,
  size = 20,
  sort,
}: SettlementsForAdminParams) => {
  return useQuery({
    queryKey: [
      'settlementsForAdmin',
      condition,
      pageable,
      startDate,
      endDate,
      studyTitle,
      settlementId,
      status,
      page,
      size,
      sort,
    ],
    queryFn: async () => {
      const { data } = await adminSettlementApi.getSettlementsForAdmin(
        condition,
        pageable,
        startDate,
        endDate,
        studyTitle,
        settlementId,
        status,
        page,
        size,
        sort,
      );

      return data.content;
    },
  });
};

export const useCreateSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: StudySettlementCreateRequest) => {
      const { data } = await adminSettlementApi.createSettlement(request);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['settlementsForAdmin'],
      });
    },
  });
};

export const useCompleteSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settlementId: number) => {
      const { data } = await adminSettlementApi.completeSettlement(
        settlementId,
      );

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['settlementsForAdmin'],
      });
    },
  });
};
