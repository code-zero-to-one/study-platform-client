'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { VirtualAccountInfo } from '@/api/openapi/models';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useGetMyCoursePayments } from '@/hooks/queries/course/course-api';
import type { MyCoursePaymentListItemResponse } from '@/types/api/course.types';

const ClassCancelPaymentModal = dynamic(
  () => import('@/components/payment/modals/class-cancel-payment-modal'),
  { ssr: false },
);

const VirtualAccountInfoModal = dynamic(
  () => import('@/components/payment/modals/virtual-account-info-modal'),
  { ssr: false },
);

type Tab = 'purchases' | 'refunds' | 'coupons';
type PeriodMonths = 1 | 3 | 6 | 12;

const STATUS_CONFIG: Record<
  MyCoursePaymentListItemResponse['status'],
  { label: string; className: string }
> = {
  REQUESTED: {
    label: '결제 요청',
    className: 'bg-blue-50 text-blue-600',
  },
  PENDING: {
    label: '결제 중',
    className: 'bg-blue-50 text-blue-600',
  },
  WAITING_FOR_DEPOSIT: {
    label: '입금 대기',
    className: 'bg-yellow-50 text-yellow-600',
  },
  SUCCESS: {
    label: '결제 완료',
    className: 'bg-green-50 text-green-600',
  },
  FAILED: {
    label: '결제 실패',
    className: 'bg-red-50 text-red-600',
  },
  CANCELED: {
    label: '취소 완료',
    className: 'bg-gray-100 text-gray-500',
  },
};

function filterByPeriod(
  payments: MyCoursePaymentListItemResponse[],
  months: PeriodMonths,
): MyCoursePaymentListItemResponse[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return payments.filter((p) => {
    const dateStr = p.paidAt ?? p.createdAt;
    return new Date(dateStr) >= cutoff;
  });
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR') + '원';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function ClassPaymentManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('purchases');
  const [periodMonths, setPeriodMonths] = useState<PeriodMonths>(3);

  const [cancelModal, setCancelModal] = useState<{
    courseId: number;
    paymentId: number;
    paymentMethod: 'CARD' | 'VIRTUAL_ACCOUNT';
  } | null>(null);
  const [vaModal, setVaModal] = useState<VirtualAccountInfo | null>(null);

  const { data: allPayments = [], isLoading } = useGetMyCoursePayments();
  const { data: canceledPayments = [], isLoading: canceledLoading } =
    useGetMyCoursePayments({ status: 'CANCELED' });

  const rawList = activeTab === 'refunds' ? canceledPayments : allPayments;
  const filtered = filterByPeriod(rawList, periodMonths);

  return (
    <div className="flex flex-col gap-300">
      <div className="font-designer-20b text-text-default">결제 관리</div>

      {/* 결제 유형 탭 */}
      <div className="border-border-subtle flex border-b">
        <button
          type="button"
          className="font-designer-14m text-text-subtlest px-200 pb-200"
          onClick={() => router.push('/payment-management')}
        >
          스터디 결제
        </button>
        <button
          type="button"
          className="font-designer-14m text-text-default border-border-brand border-b-2 px-200 pb-200"
        >
          클래스 결제
        </button>
      </div>

      {/* 내역 탭 */}
      <div className="flex gap-0">
        {(
          [
            { id: 'purchases', label: '구매내역' },
            { id: 'refunds', label: '환불내역' },
            { id: 'coupons', label: '쿠폰' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            disabled={id === 'coupons'}
            onClick={() => id !== 'coupons' && setActiveTab(id)}
            className={cn(
              'font-designer-14m border-b-2 px-300 pb-150',
              activeTab === id
                ? 'text-text-default border-gray-800'
                : 'text-text-subtlest border-transparent',
              id === 'coupons' && 'cursor-not-allowed opacity-40',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 기간 필터 */}
      <div className="flex gap-100">
        {([1, 3, 6, 12] as PeriodMonths[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPeriodMonths(m)}
            className={cn(
              'font-designer-14m rounded-full border px-300 py-100',
              periodMonths === m
                ? 'border-gray-800 text-gray-800'
                : 'border-gray-300 text-gray-500',
            )}
          >
            {m}개월
          </button>
        ))}
      </div>

      {/* 카드 목록 */}
      {isLoading || canceledLoading ? (
        <div className="flex items-center justify-center py-600">
          <p className="font-designer-14r text-gray-500">로딩 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-600">
          <p className="font-designer-14r text-gray-500">
            결제 내역이 없습니다.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-300">
          {filtered.map((payment) => (
            <PaymentCard
              key={payment.paymentId}
              payment={payment}
              onCancel={() =>
                setCancelModal({
                  courseId: payment.courseId,
                  paymentId: payment.paymentId,
                  paymentMethod: payment.paymentMethod,
                })
              }
              onViewVirtualAccount={() => {
                if (!payment.virtualAccountNumber) return;
                setVaModal({
                  bankName: '-',
                  accountNumber: payment.virtualAccountNumber,
                  customerName: undefined,
                  dueDate: payment.virtualAccountDueDate ?? undefined,
                });
              }}
            />
          ))}
        </div>
      )}

      {cancelModal && (
        <ClassCancelPaymentModal
          courseId={cancelModal.courseId}
          paymentId={cancelModal.paymentId}
          paymentMethod={cancelModal.paymentMethod}
          open
          onOpenChange={(open) => !open && setCancelModal(null)}
        />
      )}

      {vaModal && (
        <VirtualAccountInfoModal
          virtualAccountInfo={vaModal}
          open
          onOpenChange={(open) => !open && setVaModal(null)}
        />
      )}
    </div>
  );
}

function PaymentCard({
  payment,
  onCancel,
  onViewVirtualAccount,
}: {
  payment: MyCoursePaymentListItemResponse;
  onCancel: () => void;
  onViewVirtualAccount: () => void;
}) {
  const status = STATUS_CONFIG[payment.status];
  const dateStr = formatDate(payment.paidAt ?? payment.createdAt);

  return (
    <div className="border-border-subtle rounded-200 flex gap-300 border p-300">
      {/* 썸네일 */}
      <div className="h-1000 w-1000 flex-shrink-0 rounded-150 bg-gradient-to-br from-rose-500 to-rose-300" />

      {/* 내용 */}
      <div className="flex flex-1 flex-col gap-100">
        <div className="flex items-center gap-100">
          <span
            className={cn(
              'font-designer-12m rounded-50 px-100 py-50',
              status.className,
            )}
          >
            {status.label}
          </span>
          <span className="font-designer-12r text-gray-400">{dateStr}</span>
        </div>

        <p className="font-designer-16m text-gray-800">{payment.courseTitle}</p>
        <p className="font-designer-14r text-gray-500">{payment.planName}</p>
        <p className="font-designer-16b text-gray-800">
          {formatAmount(payment.amount)}
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-shrink-0 flex-col items-end justify-end gap-100">
        {payment.tossReceiptUrl &&
          (payment.status === 'SUCCESS' || payment.status === 'CANCELED') && (
            <a
              href={payment.tossReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-designer-14m text-text-brand hover:text-text-brand-pressed"
            >
              영수증 보기
            </a>
          )}

        {payment.status === 'WAITING_FOR_DEPOSIT' && (
          <button
            type="button"
            className="font-designer-14m text-text-brand hover:text-text-brand-pressed"
            onClick={onViewVirtualAccount}
          >
            입금계좌 확인하기
          </button>
        )}

        {payment.cancellable && (
          <button
            type="button"
            className="font-designer-14m text-text-subtle hover:text-text-default"
            onClick={onCancel}
          >
            취소 요청
          </button>
        )}
      </div>
    </div>
  );
}
