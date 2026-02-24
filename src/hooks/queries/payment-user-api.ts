import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { createApiInstance } from '@/api/client/open-api-instance';
import { PaymentUserApi } from '@/api/openapi/api/payment-user-api';
import type {
  StudyPaymentPrepareRequest,
  StudyPaymentPrepareResponse,
  TossPaymentConfirmRequest,
} from '@/api/openapi/models';

interface PreparePaymentResult {
  data: StudyPaymentPrepareResponse | undefined;
  errorMessage?: string;
}

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

export const usePreparePaymentQuery = (groupStudyId: number) => {
  return useQuery<PreparePaymentResult>({
    queryKey: ['payment', groupStudyId],
    queryFn: async () => {
      try {
        const { data } = await paymentUserApi.preparePayment(groupStudyId, {});

        return { data: data.content };
      } catch (error) {
        if (isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 409) {
            return {
              data: undefined,
              errorMessage: '이미 결제가 완료되었습니다.',
            };
          }

          if (status === 404) {
            return {
              data: undefined,
              errorMessage: '회원 정보가 존재하지 않습니다.',
            };
          }
        }

        return {
          data: undefined,
          errorMessage: '결제 정보를 불러오는 중 오류가 발생했습니다.',
        };
      }
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: number) => {
      const { data } = await paymentUserApi.cancelPayment(paymentId);

      return data.content;
    },
    onSuccess: async () => {
      // 취소시 화면 즉시 갱신
      await queryClient.invalidateQueries({
        queryKey: ['myTransactions'],
      });
      alert('결제가 취소되었습니다.');
    },
    onError: () => {
      alert('결제 취소에 실패했습니다. 다시 시도해주세요.');
    },
  });
};
