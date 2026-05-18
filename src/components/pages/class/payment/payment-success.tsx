'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const DotLottieReact = dynamic(
  () =>
    import('@lottiefiles/dotlottie-react').then((m) => ({
      default: m.DotLottieReact,
    })),
  { ssr: false },
);
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { CoursePaymentConfirmResponse } from '@/types/api/course.types';

interface CoursePaymentSuccessProps {
  paymentConfirm: CoursePaymentConfirmResponse;
  slug: string;
}

export function CoursePaymentSuccess({
  paymentConfirm,
  slug,
}: CoursePaymentSuccessProps) {
  const PAYMENT_METHOD_LABELS = {
    CARD: '신용카드',
    VIRTUAL_ACCOUNT: '무통장 입금',
  } as const;
  const paymentMethodLabel =
    PAYMENT_METHOD_LABELS[paymentConfirm.paymentMethod] ?? '기타';

  return (
    <div className="mx-auto flex w-full max-w-9175 flex-col items-center px-600 pb-1000 pt-800">
      <DotLottieReact
        src="/class/payments.json"
        autoplay
        className="h-1875 w-1875"
      />

      <h1 className="mt-400 font-designer-28b text-gray-800">
        결제가 완료되었습니다
      </h1>

      {/* Info table */}
      <div className="mt-600 w-full max-w-5950 overflow-hidden rounded-200 border border-gray-300">
        <div className="border-b border-gray-300 bg-gray-100 px-400 py-300">
          <p className="font-designer-16b text-gray-800">주문 정보</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-200 bg-background-default">
          <InfoRow label="결제 상태" value="결제 완료" />
          <InfoRow
            label="결제일시"
            value={new Date(paymentConfirm.paidAt).toLocaleString('ko-KR')}
          />
        </div>

        <div className="border-b border-t border-gray-300 bg-gray-100 px-400 py-300">
          <p className="font-designer-16b text-gray-800">결제 정보</p>
        </div>
        <div className="flex flex-col divide-y divide-gray-200 bg-background-default">
          <InfoRow
            label="상품 금액"
            value={`${paymentConfirm.amount.toLocaleString()}원`}
          />
          <InfoRow label="결제 수단" value={paymentMethodLabel} />
          <InfoRow
            label="총 결제 금액"
            value={`${paymentConfirm.amount.toLocaleString()}원`}
            bold
          />
        </div>
      </div>

      {/* Receipt link */}
      {paymentConfirm.tossReceiptUrl && (
        <a
          href={paymentConfirm.tossReceiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-300 font-designer-14r text-text-brand underline"
        >
          영수증 보기
        </a>
      )}

      {/* CTAs */}
      <div className="mt-600 flex w-full max-w-7925 gap-200">
        <Link
          href="/my-page?tab=class"
          className="flex h-750 flex-1 items-center justify-center rounded-100 bg-background-brand-default font-designer-16b text-gray-0"
        >
          마이클래스
        </Link>
        <Link
          href={`/class/${slug}/home`}
          className="flex h-750 flex-1 items-center justify-center rounded-100 border border-background-brand-default font-designer-16b text-text-brand"
        >
          내 학습 여정 맵으로 가기
        </Link>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-400 py-250">
      <span className="font-designer-14m text-gray-500">{label}</span>
      <span
        className={cn(
          bold ? 'font-designer-16b' : 'font-designer-14r',
          'text-gray-800',
        )}
      >
        {value}
      </span>
    </div>
  );
}
