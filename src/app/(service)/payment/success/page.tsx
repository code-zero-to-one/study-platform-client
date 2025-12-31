'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';

interface PaymentConfirmResponse {
  success: boolean;
  message?: string;
  data?: {
    orderId: string;
    amount: number;
    paymentKey: string;
  };
}

// TODO: 백엔드 API 호출 함수 - 실제 API 엔드포인트로 교체 필요
async function confirmPayment(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<PaymentConfirmResponse> {
  // TODO: 실제 백엔드 API로 교체
  // const response = await fetch('/api/payment/confirm', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ paymentKey, orderId, amount }),
  // });
  // return response.json();

  // 임시 성공 응답
  console.log('결제 승인 요청:', { paymentKey, orderId, amount });

  return {
    success: true,
    data: {
      orderId,
      amount,
      paymentKey,
    },
  };
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    async function confirm() {
      if (!paymentKey || !orderId || !amount) {
        setStatus('error');
        setErrorMessage('결제 정보가 올바르지 않습니다.');

        return;
      }

      try {
        const result = await confirmPayment(
          paymentKey,
          orderId,
          Number(amount),
        );

        if (result.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(result.message || '결제 승인에 실패했습니다.');
        }
      } catch {
        setStatus('error');
        setErrorMessage('결제 승인 중 오류가 발생했습니다.');
      }
    }

    confirm().catch(() => {});
  }, [paymentKey, orderId, amount]);

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
          <div className="bg-fill-danger-subtle-default mx-auto mb-400 flex h-16 w-16 items-center justify-center rounded-full">
            <span className="text-3xl">✕</span>
          </div>
          <h1 className="font-designer-24b mb-200">결제 승인 실패</h1>
          <p className="text-text-subtle mb-400">{errorMessage}</p>
          <Button
            type="button"
            color="primary"
            size="large"
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
