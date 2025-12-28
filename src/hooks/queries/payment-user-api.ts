import { useMutation, useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { PaymentUserApi } from '@/api/openapi/api/payment-user-api';
import type {
  StudyPaymentPrepareRequest,
  TossPaymentConfirmRequest,
} from '@/api/openapi/models';

const paymentUserApi = createApiInstance(PaymentUserApi);

interface TransactionParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  studyTitle?: string;
  paymentCode?: string;
}

interface TransactionsByGroupStudyParams {
  groupStudyId: number;
  page?: number;
  size?: number;
}

export const useGetMyTransactions = ({
  page = 0,
  size = 10,
  startDate,
  endDate,
  studyTitle,
  paymentCode,
}: TransactionParams = {}) => {
  return useQuery({
    queryKey: [
      'myTransactions',
      page,
      size,
      startDate,
      endDate,
      studyTitle,
      paymentCode,
    ],
    queryFn: async () => {
      const { data } = await paymentUserApi.getMyTransactions(
        {
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
        page,
        size,
      );

      return data.content;
    },
  });
};

export const useGetMyTransactionsByGroupStudy = ({
  groupStudyId,
  page = 0,
  size = 20,
}: TransactionsByGroupStudyParams) => {
  return useQuery({
    queryKey: ['myTransactionsByGroupStudy', groupStudyId, page, size],
    queryFn: async () => {
      const { data } = await paymentUserApi.getMyTransactionsByGroupStudy(
        groupStudyId,
        {
          page,
          size,
        },
        page,
        size,
      );

      return data.content;
    },
  });
};

export const usePreparePayment = () => {
  return useMutation({
    mutationFn: async ({
      groupStudyId,
      request,
    }: {
      groupStudyId: number;
      request: StudyPaymentPrepareRequest;
    }) => {
      const { data } = await paymentUserApi.preparePayment(
        groupStudyId,
        request,
      );

      return data.content;
    },
  });
};

export const useConfirmTossPayment = () => {
  return useMutation({
    mutationFn: async (request: TossPaymentConfirmRequest) => {
      const { data } = await paymentUserApi.confirmTossPayment(request);

      return data.content;
    },
  });
};

export const useCancelPayment = () => {
  return useMutation({
    mutationFn: async (paymentId: number) => {
      const { data } = await paymentUserApi.cancelPayment(paymentId);

      return data.content;
    },
    onSuccess: async () => {
      alert('결제가 취소되었습니다.');
    },
    onError: () => {
      alert('결제 취소에 실패했습니다. 다시 시도해주세요.');
    },
  });
};
