'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { VibeIntroPaymentSuccess } from '@/components/pages/class/vibe-intro/payment/payment-success';
import {
  useConfirmCourseTossPayment,
  useGetCourseDetail,
} from '@/hooks/queries/course/course-api';
import type { CoursePaymentConfirmResponse } from '@/types/api/course.types';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = Number(searchParams.get('paymentId'));
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [confirmData, setConfirmData] =
    useState<CoursePaymentConfirmResponse | null>(null);

  const { data: course } = useGetCourseDetail('vibe-intro');
  const courseId = course?.courseId ?? 0;
  const { mutateAsync: confirmPayment } = useConfirmCourseTossPayment();

  useEffect(() => {
    if (!paymentKey || !orderId || !amount || !courseId) return;

    let isMounted = true;

    const run = async () => {
      try {
        const result = await confirmPayment({
          courseId,
          request: {
            paymentId,
            paymentKey,
            orderId,
            amount: Number(amount),
          },
        });

        if (isMounted) {
          setConfirmData(result);
          setStatus('success');
        }
      } catch {
        if (isMounted) setStatus('error');
      }
    };

    run().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [paymentKey, orderId, amount, courseId, paymentId, confirmPayment]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-500 w-500 animate-spin rounded-full border-4 border-background-brand-default border-t-transparent" />
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
          onClick={() => router.push('/class/vibe-intro/home')}
          className="rounded-100 bg-background-brand-default px-400 py-200 font-designer-16b text-gray-0"
        >
          학습 홈으로 이동
        </button>
      </div>
    );
  }

  return <VibeIntroPaymentSuccess paymentConfirm={confirmData} />;
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
