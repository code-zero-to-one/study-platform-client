'use client';

import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { PaymentUserApi } from '@/api/openapi';
import OrderSummary from '@/components/payment/orderSummary';
import PaymentCheckoutPage from '@/components/payment/paymentActionClient';
import PriceSummary from '@/components/payment/priceSummary';

const paymentUserApi = createApiInstance(PaymentUserApi);

interface PaymentPageContentProps {
  id: string;
}

export default function PaymentPageContent({ id }: PaymentPageContentProps) {
  const { data } = useQuery({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data } = await paymentUserApi.preparePayment(Number(id), {});

      return data.content;
    },
  });

  if (!data) return null;

  return (
    <div className="bg-background-alternative min-h-dvh">
      <div className="mx-auto max-w-[840px] pt-600">
        <div className="space-y-200">
          {/* 선택한 스터디 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">선택한 스터디</p>

            <OrderSummary
              groupStudyTitle={data?.groupStudyTitle}
              amount={data.amount}
            />
          </section>

          {/* 결제 금액 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">결제 금액</p>

            <div className="px-5 pb-5">
              <PriceSummary price={data?.amount} />
            </div>
          </section>

          {/* 약관/결제수단/결제하기 */}
          <section>{<PaymentCheckoutPage study={data} />}</section>
        </div>
      </div>
    </div>
  );
}
