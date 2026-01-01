'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Button from '@/components/ui/button';

// 토스페이먼츠 에러 코드별 사용자 친화적 메시지
const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
  PAY_PROCESS_ABORTED: '결제가 중단되었습니다.',
  REJECT_CARD_COMPANY: '카드사에서 결제를 거절했습니다.',
  INVALID_CARD_EXPIRATION: '카드 유효기간이 만료되었습니다.',
  INVALID_STOPPED_CARD: '정지된 카드입니다.',
  INVALID_CARD_LOST: '분실 신고된 카드입니다.',
  INVALID_CARD_NUMBER: '카드 번호가 올바르지 않습니다.',
  EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과했습니다.',
  EXCEED_MAX_PAYMENT_AMOUNT: '결제 금액 한도를 초과했습니다.',
  NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT:
    '할부가 지원되지 않는 카드입니다.',
  INVALID_CARD_INSTALLMENT_PLAN: '할부 개월 수가 올바르지 않습니다.',
  NOT_ALLOWED_POINT_USE: '포인트 사용이 불가한 카드입니다.',
  INVALID_API_KEY: '결제 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  INVALID_ORDER_ID: '주문 정보가 올바르지 않습니다.',
  INVALID_AMOUNT: '결제 금액이 올바르지 않습니다.',
};

function getErrorMessage(code: string | null, message: string | null): string {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (message) {
    return message;
  }

  return '결제 중 오류가 발생했습니다. 다시 시도해주세요.';
}

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const errorMessage = getErrorMessage(code, message);

  return (
    <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
      <div className="rounded-150 border-border-default bg-fill-neutral-subtle-default mx-auto max-w-md border p-600 text-center">
        <div className="bg-fill-danger-subtle-default mx-auto mb-400 flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-3xl">✕</span>
        </div>
        <h1 className="font-designer-24b mb-200">결제에 실패했습니다</h1>
        <p className="text-text-subtle mb-400">{errorMessage}</p>

        {(code || orderId) && (
          <div className="bg-background-default rounded-100 mb-400 p-300 text-left text-sm">
            {orderId && (
              <div className="flex justify-between py-100">
                <span className="text-text-subtle">주문번호</span>
                <span className="font-designer-14m">{orderId}</span>
              </div>
            )}
            {code && (
              <div className="flex justify-between py-100">
                <span className="text-text-subtle">에러코드</span>
                <span className="font-designer-14m text-text-danger">
                  {code}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-200">
          <Button
            type="button"
            color="primary"
            size="large"
            className="w-full"
            onClick={() => router.back()}
          >
            다시 시도하기
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

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background-alternative flex min-h-dvh items-center justify-center">
          <div className="text-center">
            <div className="border-border-default mx-auto mb-400 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="font-designer-16m text-text-subtle">로딩 중...</p>
          </div>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
