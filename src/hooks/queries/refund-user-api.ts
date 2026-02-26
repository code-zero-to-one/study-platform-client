import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { RefundUserApi } from '@/api/openapi';
import type { StudyRefundCreateRequest } from '@/api/openapi/models';
import { extractErrorCode } from '@/utils/error';

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

// 환불 에러 코드별 메시지 매핑
const getRefundErrorMessage = (
  errorCode?: string,
  defaultMessage?: string,
): string => {
  if (!errorCode) {
    return defaultMessage || '환불 요청에 실패했습니다. 다시 시도해주세요.';
  }

  const errorMessages: Record<string, string> = {
    PAY307: '[PAY307] 현재 환불이 허용되지 않습니다. 관리자에게 문의해주세요.',
    PAY302:
      '[PAY302] 이미 진행 중이거나 완료된 환불이 있습니다. 관리자에게 문의해주세요.',
    PAY303: '[PAY303] 이미 취소된 환불 요청입니다. 관리자에게 문의해주세요.',
    PAY309:
      '[PAY309] 정산이 이미 진행되어 환불이 불가합니다. 관리자에게 문의해주세요.',
    PAY301: '[PAY301] 환불 정보를 찾을 수 없습니다. 관리자에게 문의해주세요.',
    PAY304: '[PAY304] 환불 금액이 유효하지 않습니다. 관리자에게 문의해주세요.',
    PAY305:
      '[PAY305] 환불 금액이 결제 금액을 초과합니다. 관리자에게 문의해주세요.',
    PAY306: '[PAY306] 해당 환불의 소유자가 아닙니다. 관리자에게 문의해주세요.',
    PAY308: '[PAY308] 환불 상태가 유효하지 않습니다. 관리자에게 문의해주세요.',
  };

  return (
    errorMessages[errorCode] ||
    defaultMessage ||
    '환불 요청에 실패했습니다. 다시 시도해주세요.'
  );
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
    onError: (error) => {
      const { errorCode, message } = extractErrorCode(error);
      const errorMessage = getRefundErrorMessage(errorCode, message);
      alert(errorMessage);
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
