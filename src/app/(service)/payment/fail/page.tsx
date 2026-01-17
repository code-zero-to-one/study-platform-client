'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Button from '@/components/ui/button';

// 토스페이먼츠 에러 코드별 사용자 친화적 메시지
const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  PAY_PROCESS_CANCELED: {
    title: '결제취소',
    message: '결제를 취소하였습니다.',
  },
  PAY_PROCESS_ABORTED: {
    title: '결제취소',
    message: '결제가 중단되었습니다.',
  },
  REJECT_CARD_COMPANY: {
    title: '결제실패',
    message: '카드사에서 결제를 거절했습니다.',
  },
  INVALID_CARD_EXPIRATION: {
    title: '결제실패',
    message: '카드 유효기간이 만료되었습니다.',
  },
  INVALID_STOPPED_CARD: {
    title: '결제실패',
    message: '정지된 카드입니다.',
  },
  INVALID_CARD_LOST: {
    title: '결제실패',
    message: '분실 신고된 카드입니다.',
  },
  INVALID_CARD_NUMBER: {
    title: '결제실패',
    message: '카드 번호가 올바르지 않습니다.',
  },
  EXCEED_MAX_DAILY_PAYMENT_COUNT: {
    title: '결제실패',
    message: '일일 결제 한도를 초과했습니다.',
  },
  EXCEED_MAX_PAYMENT_AMOUNT: {
    title: '결제실패',
    message: '결제 금액 한도를 초과했습니다.',
  },
  NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT: {
    title: '결제실패',
    message: '할부가 지원되지 않는 카드입니다.',
  },
  INVALID_CARD_INSTALLMENT_PLAN: {
    title: '결제실패',
    message: '할부 개월 수가 올바르지 않습니다.',
  },
  NOT_ALLOWED_POINT_USE: {
    title: '결제실패',
    message: '포인트 사용이 불가한 카드입니다.',
  },
  INVALID_API_KEY: {
    title: '결제오류',
    message: '결제 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  },
  INVALID_ORDER_ID: {
    title: '결제오류',
    message: '주문 정보가 올바르지 않습니다.',
  },
  INVALID_AMOUNT: {
    title: '결제오류',
    message: '결제 금액이 올바르지 않습니다.',
  },
  // 가상계좌 관련 에러
  INVALID_BANK: {
    title: '결제실패',
    message: '지원하지 않는 은행입니다.',
  },
  NOT_AVAILABLE_BANK: {
    title: '결제실패',
    message: '현재 이용할 수 없는 은행입니다. 다른 은행을 선택해주세요.',
  },
  INVALID_ACCOUNT_NUMBER: {
    title: '결제실패',
    message: '계좌번호가 올바르지 않습니다.',
  },
  VIRTUAL_ACCOUNT_EXPIRATION: {
    title: '입금기한 만료',
    message: '가상계좌 입금 기한이 만료되었습니다.',
  },
  DEPOSIT_AMOUNT_MISMATCH: {
    title: '입금 오류',
    message: '입금 금액이 결제 금액과 일치하지 않습니다.',
  },
  ALREADY_REFUNDED: {
    title: '환불 완료',
    message: '이미 환불이 완료된 결제입니다.',
  },
  FORBIDDEN_CASH_RECEIPT: {
    title: '결제실패',
    message: '현금영수증 발급이 불가능합니다.',
  },
};

function getErrorInfo(
  code?: string,
  message?: string,
): { title: string; message: string } {
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  if (message) {
    return { title: '결제실패', message };
  }

  return { title: '결제실패', message: '결제 중 오류가 발생했습니다.' };
}

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const groupStudyId = searchParams.get('groupStudyId');

  const errorInfo = getErrorInfo(code, message);

  const handleRetry = () => {
    router.back();
  };

  const handleConfirm = () => {
    if (groupStudyId) {
      router.push(`/group-study/${groupStudyId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="bg-background-dimmer fixed inset-0 z-50 flex items-center justify-center">
      <div className="rounded-150 bg-fill-neutral-subtle-default shadow-2 w-[400px] overflow-hidden">
        <div className="border-border-default border-b px-600 py-200">
          <h2 className="font-designer-20b text-center">{errorInfo.title}</h2>
        </div>

        <div className="px-600 py-500">
          <p className="text-text-subtle text-center">{errorInfo.message}</p>
        </div>

        <div className="flex">
          <Button
            type="button"
            color="primary"
            size="large"
            className="flex-1 rounded-none"
            onClick={handleRetry}
          >
            다시 결제하기
          </Button>
          <Button
            type="button"
            color="secondary"
            size="large"
            className="flex-1 rounded-none"
            onClick={handleConfirm}
          >
            확인
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-150 bg-fill-neutral-subtle-default w-[400px] p-600">
            <div className="border-border-default mx-auto mb-400 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        </div>
      }
    >
      <PaymentFailContent />
    </Suspense>
  );
}
