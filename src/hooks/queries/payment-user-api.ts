import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { PaymentUserApi } from '@/api/openapi/api/payment-user-api';

const paymentUserApi = createApiInstance(PaymentUserApi);

export const useGetPaymentList = (page: number) => {
  return useQuery({
    queryKey: ['paymentList', page],
    queryFn: async () => {
      const { data } = await paymentUserApi.getMyPayments({
        page,
        size: 8,
      });

      return data.content;
    },
  });
};
