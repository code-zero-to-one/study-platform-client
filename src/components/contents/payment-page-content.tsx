'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PaymentCheckoutPage from '@/components/payment/paymentActionClient';
import OrderSummary from '@/components/summary/order-summary';
import PriceSummary from '@/components/summary/price-summary';
import { usePreparePaymentQuery } from '@/hooks/queries/payment/payment-user-api';
import { useToastStore } from '@/stores/use-toast-store';

interface PaymentPageContentProps {
  id: string;
}

export default function PaymentPageContent({ id }: PaymentPageContentProps) {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { data: result } = usePreparePaymentQuery(Number(id));

  useEffect(() => {
    if (result?.errorMessage) {
      showToast(result.errorMessage, 'error');
      router.back();
    }
  }, [result, router, showToast]);

  if (!result?.data) return null;

  const data = result.data;

  return (
    <div className="bg-background-alternative min-h-dvh">
      <div className="mx-auto max-w-[840px] py-600">
        <div className="space-y-200">
          {/* 선택한 스터디 */}
          <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
            <p className="font-designer-18b mb-300">선택한 스터디</p>

            <OrderSummary
              groupStudyTitle={data?.groupStudyTitle}
              amount={data.amount}
              description={data.groupStudyDescription}
              thumbnailUrl={
                data?.groupStudyImage.resizedImages[0].resizedImageUrl
              }
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
