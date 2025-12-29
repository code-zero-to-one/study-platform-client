import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { AdminSettlementApi } from '@/api/openapi';
import type {
  SettlementSearchConditionStatusEnum,
  StudySettlementCreateRequest,
} from '@/api/openapi/models';

const adminSettlementApi = createApiInstance(AdminSettlementApi);

interface SettlementsForAdminParams {
  startDate?: string;
  endDate?: string;
  studyTitle?: string;
  settlementCode?: string;
  status?: SettlementSearchConditionStatusEnum;
  page?: number;
  size?: number;
  sort?: string;
}

export const useGetSettlementsForAdmin = ({
  startDate,
  endDate,
  studyTitle,
  settlementCode,
  status,
  page = 0,
  size = 20,
  sort,
}: SettlementsForAdminParams) => {
  return useQuery({
    queryKey: [
      'settlementsForAdmin',
      startDate,
      endDate,
      studyTitle,
      settlementCode,
      status,
      page,
      size,
      sort,
    ],
    queryFn: async () => {
      const { data } = await adminSettlementApi.getSettlementsForAdmin(
        {
          startDate,
          endDate,
          studyTitle,
          settlementCode,
          status,
        },
        {
          page,
          size,
        },
        startDate,
        endDate,
        studyTitle,
        settlementCode,
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
      const { data } =
        await adminSettlementApi.completeSettlement(settlementId);

      return data.content;
    },
    onSuccess: async () => {
      alert('정산 확정 처리가 완료되었습니다.');
      await queryClient.invalidateQueries({
        queryKey: ['settlementsForAdmin'],
      });
    },
    onError: () => {
      alert('정산 확정 처리에 실패했습니다. 다시 시도해주세요.');
    },
  });
};

export const useApproveSettlement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settlementId: number) => {
      const { data } = await adminSettlementApi.approveSettlement(settlementId);

      return data.content;
    },
    onSuccess: async () => {
      alert('정산 승인 처리가 완료되었습니다.');
      await queryClient.invalidateQueries({
        queryKey: ['settlementsForAdmin'],
      });
    },
    onError: () => {
      alert('정산 승인 처리에 실패했습니다. 다시 시도해주세요.');
    },
  });
};
