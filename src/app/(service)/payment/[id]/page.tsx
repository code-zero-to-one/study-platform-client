import { createApiServerInstance } from '@/api/client/open-api-instance.server';
import { PaymentUserApi } from '@/api/openapi';
import OrderSummary from '@/components/payment/orderSummary';
import PaymentCheckoutPage from '@/components/payment/paymentActionClient';
import PriceSummary from '@/components/payment/priceSummary';

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: PaymentPageProps) {
  const { id } = await params;

  const paymentUserApi = createApiServerInstance(PaymentUserApi);

  const { data } = await paymentUserApi.preparePayment(Number(id), {
    amount: 2000,
  });

  return (
    <div className="bg-background-alternative min-h-dvh">
      <div className="mx-auto max-w-[840px] pt-600">
        <div className="space-y-200">
          {/* 서버 렌더: 선택한 스터디 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">선택한 스터디</p>

            <OrderSummary
              groupStudyTitle={data?.content.groupStudyTitle}
              amount={data.content.amount}
            />
          </section>

          {/* 서버 렌더: 결제 금액 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">결제 금액</p>

            <div className="px-5 pb-5">
              <PriceSummary price={data?.content.amount} />
            </div>
          </section>

          {/* 클라 렌더: 약관/결제수단/결제하기 */}
          <section>{<PaymentCheckoutPage study={data?.content} />}</section>
        </div>
      </div>
    </div>
  );
}
