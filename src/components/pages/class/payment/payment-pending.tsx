'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useToastStore } from '@/stores/use-toast-store';

const DotLottieReact = dynamic(
  () =>
    import('@lottiefiles/dotlottie-react').then((m) => ({
      default: m.DotLottieReact,
    })),
  { ssr: false },
);

interface VirtualAccountInfo {
  bankName?: string;
  accountNumber: string;
  dueDate: string;
  holderName: string;
  amount: number;
}

interface CoursePaymentPendingProps {
  virtualAccount: VirtualAccountInfo;
  onCancel?: () => void;
  isCanceling?: boolean;
}

export function CoursePaymentPending({
  virtualAccount,
  onCancel,
  isCanceling = false,
}: CoursePaymentPendingProps) {
  const showToast = useToastStore((s) => s.showToast);

  const handleCopyAccount = async () => {
    try {
      await navigator.clipboard.writeText(virtualAccount.accountNumber);
      showToast('계좌번호가 복사되었습니다.');
    } catch {
      showToast('복사에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-9175 flex-col items-center px-600 pb-1000 pt-800">
      <DotLottieReact
        src="/class/payments.json"
        autoplay
        className="h-1875 w-1875"
      />

      <h1 className="mt-400 font-designer-28b text-gray-800">
        입금 대기 중입니다.
      </h1>
      <p className="mt-150 font-designer-16r text-gray-500">
        아래 계좌로 입금해주시면 수강이 시작됩니다.
      </p>

      {/* Virtual account table */}
      <div className="mt-600 w-full max-w-5950 overflow-hidden rounded-200 border border-gray-300">
        <div className="border-b border-gray-300 bg-gray-100 px-400 py-300">
          <p className="font-designer-16b text-gray-800">은행 정보</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-200 bg-background-default">
          {virtualAccount.bankName ? (
            <div className="flex items-center justify-between px-400 py-250">
              <span className="font-designer-14m text-gray-500">은행</span>
              <span className="font-designer-14r text-gray-800">
                {virtualAccount.bankName}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between px-400 py-250">
            <span className="font-designer-14m text-gray-500">계좌 번호</span>
            <div className="flex items-center gap-150">
              <span className="font-designer-14r text-gray-800">
                {virtualAccount.accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="font-designer-14b text-text-brand"
              >
                복사
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-400 py-250">
            <span className="font-designer-14m text-gray-500">입금 기한</span>
            <span className="font-designer-14r text-gray-800">
              {new Date(virtualAccount.dueDate).toLocaleString('ko-KR')}
            </span>
          </div>
          <div className="flex items-center justify-between px-400 py-250">
            <span className="font-designer-14m text-gray-500">예금주</span>
            <span className="font-designer-14r text-gray-800">
              {virtualAccount.holderName}
            </span>
          </div>
        </div>

        <div className="border-b border-t border-gray-300 bg-gray-100 px-400 py-300">
          <p className="font-designer-16b text-gray-800">결제 정보</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-200 bg-background-default">
          <div className="flex items-center justify-between px-400 py-250">
            <span className="font-designer-14m text-gray-500">결제 수단</span>
            <span className="font-designer-14r text-gray-800">무통장 입금</span>
          </div>
          <div className="flex items-center justify-between px-400 py-250">
            <span className="font-designer-14m text-gray-500">
              총 결제 금액
            </span>
            <span className="font-designer-16b text-gray-800">
              {virtualAccount.amount.toLocaleString()}원
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/class-payment-management"
        className="mt-600 flex h-750 w-full max-w-5950 items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-gray-0"
      >
        결제 관리로 가기
      </Link>

      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={isCanceling}
          className="mt-200 flex h-750 w-full max-w-5950 items-center justify-center rounded-100 border border-gray-300 font-designer-16b text-gray-600 disabled:opacity-50"
        >
          {isCanceling ? '취소 처리 중...' : '결제 취소'}
        </button>
      ) : null}
    </div>
  );
}
