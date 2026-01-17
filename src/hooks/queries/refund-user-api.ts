import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { RefundUserApi } from '@/api/openapi';
import type { StudyRefundCreateRequest } from '@/api/openapi/models';

const refundUserApi = createApiInstance(RefundUserApi);

interface MyRefundsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const useGetMyRefunds = ({
  page = 0,
  size = 10,
  sort,
}: MyRefundsParams = {}) => {
  return useQuery({
    queryKey: ['myRefunds', page, size, sort],
    queryFn: async () => {
      const { data } = await refundUserApi.getMyRefunds(
        {
          page,
          size,
        },
        page,
        size,
        sort,
      );

      return data.content;
    },
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      request,
    }: {
      paymentId: number;
      request: StudyRefundCreateRequest;
    }) => {
      const { data } = await refundUserApi.requestRefund(paymentId, request);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['myTransactions'],
      });
      alert('환불 요청이 접수되었습니다.');
    },
    onError: () => {
      alert('환불 요청에 실패했습니다. 다시 시도해주세요.');
    },
  });
};

export const useCancelRefundRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refundId: number) => {
      const { data } = await refundUserApi.cancelRefundRequest(refundId);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['myTransactions'],
      });
      alert('환불 요청이 취소되었습니다.');
    },
    onError: () => {
      alert('환불 요청 취소에 실패했습니다. 다시 시도해주세요.');
    },
  });
};
