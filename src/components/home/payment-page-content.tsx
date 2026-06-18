'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import OrderSummary from '@/components/group-study/summary/order-summary';
import PriceSummary from '@/components/group-study/summary/price-summary';
import PaymentCheckoutPage from '@/components/payment/paymentActionClient';
import { usePrepareCoursePaymentQuery } from '@/hooks/queries/course/course-queries';
import { usePreparePaymentQuery } from '@/hooks/queries/payment/payment-user-queries';
import { useToastStore } from '@/stores/use-toast-store';
import type { CoursePlanCode } from '@/types/api/course.types';

interface PaymentPageContentProps {
  id: string;
}

export default function PaymentPageContent({ id }: PaymentPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useToastStore((state) => state.showToast);
  const paymentType = searchParams.get('type');
  const planCode =
    (searchParams.get('planCode') as CoursePlanCode | null) ?? 'ALL_IN_ONE';
  const isCoursePayment = paymentType === 'course';
  const { data: result } = usePreparePaymentQuery(Number(id), !isCoursePayment);
  const { data: coursePaymentData, isError: isCoursePaymentError } =
    usePrepareCoursePaymentQuery({
      courseId: Number(id),
      planCode,
      enabled: isCoursePayment,
    });

  useEffect(() => {
    if (result?.errorMessage) {
      showToast(result.errorMessage, 'error');
      router.back();
    }
  }, [result, router, showToast]);

  useEffect(() => {
    if (!isCoursePaymentError) return;

    showToast('코스 결제 정보를 불러오는 중 오류가 발생했습니다.', 'error');
    router.back();
  }, [isCoursePaymentError, router, showToast]);

  if (isCoursePayment) {
    const data = coursePaymentData;

    if (!data) return null;

    return (
      <div className="bg-background-alternative min-h-dvh">
        <div className="mx-auto max-w-[840px] py-600">
          <div className="space-y-200">
            <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
              <p className="font-designer-18b mb-300">선택한 코스</p>
              <OrderSummary
                groupStudyTitle={data.orderName}
                amount={data.amount}
                description={`${data.planCode} 플랜`}
                thumbnailUrl="/class/detail/result-showcase.png"
              />
            </section>

            <section className="rounded-150 border-border-default bg-fill-neutral-subtle-default border px-500 py-400">
              <p className="font-designer-18b mb-300">결제 금액</p>

              <div className="px-5 pb-5">
                <PriceSummary price={data.amount} />
              </div>
            </section>

            <section>
              <PaymentCheckoutPage study={{ ...data, paymentType: 'course' }} />
            </section>
          </div>
        </div>
      </div>
    );
  }

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
          <section>
            {<PaymentCheckoutPage study={{ ...data, paymentType: 'group' }} />}
          </section>
        </div>
      </div>
    </div>
  );
}
