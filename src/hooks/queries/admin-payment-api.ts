import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { AdminPaymentApi } from '@/api/openapi';
import type { PaymentSearchConditionTypeEnum } from '@/api/openapi/models';

const adminPaymentApi = createApiInstance(AdminPaymentApi);

interface TransactionsForAdminParams {
  startDate?: string;
  endDate?: string;
  studyTitle?: string;
  paymentCode?: string;
  type?: PaymentSearchConditionTypeEnum;
  page?: number;
  size?: number;
}

export const useGetTransactionsForAdmin = ({
  type,
  startDate,
  endDate,
  studyTitle,
  paymentCode,
  page = 0,
  size = 20,
}: TransactionsForAdminParams) => {
  return useQuery({
    queryKey: [
      'transactionsForAdmin',
      type,
      startDate,
      endDate,
      studyTitle,
      paymentCode,
      page,
      size,
    ],
    queryFn: async () => {
      const { data } = await adminPaymentApi.getTransactionsForAdmin(
        {
          type,
          startDate,
          endDate,
          studyTitle,
          paymentCode,
        },
        {
          page,
          size,
        },
        startDate,
        endDate,
        studyTitle,
        paymentCode,
        type,
        page,
        size,
      );

      return data.content;
    },
  });
};

export const useForceCancelPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paymentId,
      reason,
    }: {
      paymentId: number;
      reason?: string;
    }) => {
      const { data } = await adminPaymentApi.forceCancelPayment(
        paymentId,
        reason,
      );

      return data.content;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['transactionsForAdmin'],
      });
    },
  });
};
