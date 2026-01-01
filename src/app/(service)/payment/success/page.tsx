'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import { useConfirmTossPayment } from '@/hooks/queries/payment-user-api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );

  const { mutateAsync, isPending, isError } = useConfirmTossPayment();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentId = Number(searchParams.get('paymentId'));
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      setErrorMessage('결제 검증에 필요한 정보가 없습니다.');

      return;
    }

    let isMounted = true;

    const verifyPaymentWithBackend = async () => {
      try {
        setStatus('loading');

        await mutateAsync({
          paymentId,
          paymentKey,
          orderId,
          amount: Number(amount),
        });

        if (isMounted) {
          setStatus('success');
        }
      } catch (error) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('결제 검증에 실패했습니다.');
        }
      }
    };

    verifyPaymentWithBackend().catch((error) => {
      console.error('Error in verifyPaymentWithBackend:', error);
    });

    return () => {
      isMounted = false;
    };
  }, [paymentKey, orderId, amount, mutateAsync]);

  if (status === 'loading') {
    return (
      <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
        <div className="text-center">
          <div className="border-border-default mx-auto mb-400 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="font-designer-16m text-text-subtle">
            결제를 처리하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
        <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default mx-auto max-w-md border p-600 text-center">
          <h1 className="font-designer-24b mb-200">결제 승인 실패</h1>
          <p className="text-text-subtle mb-400">{errorMessage}</p>
          <Button
            type="button"
            color="primary"
            size="medium"
            className="w-full"
            onClick={() => router.back()}
          >
            다시 시도하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
      <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default mx-auto max-w-md border p-600 text-center">
        <div className="bg-fill-success-subtle-default mx-auto mb-400 flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="font-designer-24b mb-200">결제가 완료되었습니다</h1>
        <p className="text-text-subtle mb-200">
          스터디 참여가 정상적으로 처리되었습니다.
        </p>

        <div className="bg-background-default rounded-100 mb-400 p-300 text-left">
          <div className="flex justify-between py-100">
            <span className="text-text-subtle">주문번호</span>
            <span className="font-designer-14b">{orderId}</span>
          </div>
          <div className="flex justify-between py-100">
            <span className="text-text-subtle">결제금액</span>
            <span className="font-designer-14b">
              {Number(amount).toLocaleString()}원
            </span>
          </div>
        </div>

        <div className="space-y-200">
          <Button
            type="button"
            color="primary"
            size="large"
            className="w-full"
            onClick={() => router.push('/my-study')}
          >
            내 스터디로 이동
          </Button>
          <Button
            type="button"
            color="secondary"
            size="large"
            className="w-full"
            onClick={() => router.push('/')}
          >
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
          <div className="text-center">
            <div className="border-border-default mx-auto mb-400 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="font-designer-16m text-text-subtle">
              결제를 처리하고 있습니다...
            </p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
