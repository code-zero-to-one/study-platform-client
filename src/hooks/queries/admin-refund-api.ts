import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { AdminRefundApi } from '@/api/openapi';
import type {
  StudyRefundApproveRequest,
  StudyRefundRejectRequest,
} from '@/api/openapi/models';

const adminRefundApi = createApiInstance(AdminRefundApi);

interface RefundsForAdminParams {
  memberId?: number;
  status?: string;
  page?: number;
  size?: number;
}

export const useGetRefundsForAdmin = ({
  memberId,
  status,
  page = 0,
  size = 20,
}: RefundsForAdminParams = {}) => {
  return useQuery({
    queryKey: ['refundsForAdmin', memberId, status, page, size],
    queryFn: async () => {
      const { data } = await adminRefundApi.getRefundsForAdmin(
        {
          page,
          size,
        },
        memberId,
        status,
        page,
        size,
      );

      return data.content;
    },
  });
};

export const useApproveRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      refundId,
      request,
    }: {
      refundId: number;
      request: StudyRefundApproveRequest;
    }) => {
      const { data } = await adminRefundApi.approveRefund(refundId, request);

      return data.content;
    },
    onSuccess: async () => {
      alert('환불 승인이 완료되었습니다.');
      await queryClient.invalidateQueries({
        queryKey: ['transactionsForAdmin'],
      });
    },
    onError: () => {
      alert('환불 승인에 실패했습니다. 다시 시도해주세요.');
    },
  });
};

export const useCompleteRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refundId: number) => {
      const { data } = await adminRefundApi.completeRefund(refundId);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactionsForAdmin'],
      });
    },
  });
};

export const useRejectRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      refundId,
      request,
    }: {
      refundId: number;
      request: StudyRefundRejectRequest;
    }) => {
      const { data } = await adminRefundApi.rejectRefund(refundId, request);

      return data.content;
    },
    onSuccess: async () => {
      alert('환불 반려가 완료되었습니다.');
      await queryClient.invalidateQueries({
        queryKey: ['transactionsForAdmin'],
      });
    },
    onError: () => {
      alert('환불 반려에 실패했습니다. 다시 시도해주세요.');
    },
  });
};

export const useRetryRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (refundId: number) => {
      const { data } = await adminRefundApi.retryRefund(refundId);

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactionsForAdmin'],
      });
    },
  });
};
