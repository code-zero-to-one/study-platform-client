'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { CoursePaymentPending } from '@/components/pages/class/payment/payment-pending';
import { CoursePaymentSuccess } from '@/components/pages/class/payment/payment-success';
import {
  useCancelCoursePayment,
  useConfirmCourseTossPayment,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';
import type { CoursePaymentConfirmResponse } from '@/types/api/course.types';
import { analyzeError } from '@/utils/error-handler';

const PaymentSuccessParamsSchema = z.object({
  paymentId: z.coerce.number().int().positive(),
  paymentKey: z.string().min(1),
  orderId: z.string().min(1),
  amount: z.coerce.number().int().positive(),
});

function SuccessContent() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const parsed = PaymentSuccessParamsSchema.safeParse({
    paymentId: searchParams.get('paymentId'),
    paymentKey: searchParams.get('paymentKey'),
    orderId: searchParams.get('orderId'),
    amount: searchParams.get('amount'),
  });

  const isParamValid = parsed.success;
  const parsedPaymentId = parsed.success ? parsed.data.paymentId : null;
  const parsedPaymentKey = parsed.success ? parsed.data.paymentKey : null;
  const parsedOrderId = parsed.success ? parsed.data.orderId : null;
  const parsedAmount = parsed.success ? parsed.data.amount : null;

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'already-confirmed'
  >('loading');
  const [confirmData, setConfirmData] =
    useState<CoursePaymentConfirmResponse | null>(null);

  const { data: course, isLoading: isCourseLoading } = useGetCourseDetail(slug);
  const courseId = course?.courseId ?? 0;
  const { mutateAsync: confirmPayment } = useConfirmCourseTossPayment();
  const { mutate: cancelPayment, isPending: isCanceling } =
    useCancelCoursePayment();
  const hasCalledRef = useRef(false);

  const handleCancel = () => {
    if (!courseId || !parsedPaymentId) {
      router.push(`/class/${slug}/home`);
      return;
    }
    cancelPayment(
      { courseId, paymentId: parsedPaymentId },
      {
        onSuccess: () => router.push(`/class/${slug}/home`),
      },
    );
  };

  useEffect(() => {
    if (isCourseLoading) return;
    if (
      !isParamValid ||
      !parsedPaymentId ||
      !parsedPaymentKey ||
      !parsedOrderId ||
      !parsedAmount ||
      !courseId
    ) {
      setStatus('error');
      return;
    }
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    let isMounted = true;

    const run = async () => {
      try {
        const result = await confirmPayment({
          courseId,
          request: {
            paymentId: parsedPaymentId,
            paymentKey: parsedPaymentKey,
            orderId: parsedOrderId,
            amount: parsedAmount,
          },
        });
        if (isMounted) {
          setConfirmData(result);
          setStatus('success');
        }
      } catch (error: unknown) {
        const errorInfo = analyzeError(error);
        if (isMounted) {
          if (errorInfo.errorCode === 'PAY202') {
            setStatus('already-confirmed');
          } else {
            setStatus('error');
          }
        }
      }
    };

    run().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [
    isCourseLoading,
    courseId,
    isParamValid,
    parsedPaymentId,
    parsedPaymentKey,
    parsedOrderId,
    parsedAmount,
    confirmPayment,
  ]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-500 w-500 animate-spin rounded-full border-4 border-background-brand-default border-t-transparent" />
      </div>
    );
  }

  if (status === 'already-confirmed') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-300">
        <p className="font-designer-20b text-gray-800">
          이미 완료된 결제입니다.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/class/${slug}/home`)}
          className="rounded-100 bg-background-brand-default px-400 py-200 font-designer-16b text-gray-0"
        >
          학습 홈으로 이동
        </button>
      </div>
    );
  }

  if (status === 'error' || !confirmData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-300">
        <p className="font-designer-20b text-gray-800">
          결제 확인에 실패했습니다.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/class/${slug}/home`)}
          className="rounded-100 bg-background-brand-default px-400 py-200 font-designer-16b text-gray-0"
        >
          학습 홈으로 이동
        </button>
      </div>
    );
  }

  if (confirmData.status === 'WAITING_FOR_DEPOSIT') {
    return (
      <CoursePaymentPending
        virtualAccount={{
          accountNumber: confirmData.virtualAccountNumber ?? '',
          dueDate: confirmData.virtualAccountDueDate ?? '',
          holderName: confirmData.virtualAccountHolderName ?? '',
          amount: confirmData.amount,
        }}
        onCancel={handleCancel}
        isCanceling={isCanceling}
      />
    );
  }

  return <CoursePaymentSuccess paymentConfirm={confirmData} slug={slug} />;
}

export default function VibeIntroPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-500 w-500 animate-spin rounded-full border-4 border-background-brand-default border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
