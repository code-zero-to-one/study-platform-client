'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useReducer } from 'react';
import type { VirtualAccountInfo } from '@/api/openapi/models';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import {
  useGetMyCoursePaymentDetail,
  useGetMyCoursePayments,
} from '@/hooks/queries/course/course-queries';
import type { MyCoursePaymentListItemResponse } from '@/types/api/course.types';

const ClassCancelPaymentModal = dynamic(
  () => import('@/components/payment/modals/class-cancel-payment-modal'),
  { ssr: false },
);

const ClassRefundRequestModal = dynamic(
  () => import('@/components/payment/modals/class-refund-request-modal'),
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
  {
    label: string;
    color: 'blue' | 'orange' | 'green' | 'red' | 'gray';
  }
> = {
  REQUESTED: { label: '결제 요청', color: 'blue' },
  PENDING: { label: '결제 중', color: 'blue' },
  WAITING_FOR_DEPOSIT: { label: '입금 대기', color: 'orange' },
  SUCCESS: { label: '결제 완료', color: 'green' },
  FAILED: { label: '결제 실패', color: 'red' },
  CANCELED: { label: '취소 완료', color: 'gray' },
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

interface CancelModalState {
  courseId: number;
  paymentId: number;
  paymentMethod: 'CARD' | 'VIRTUAL_ACCOUNT';
}

interface ClassPaymentState {
  activeTab: Tab;
  periodMonths: PeriodMonths;
  cancelModal: CancelModalState | null;
  refundModal: { paymentId: number } | null;
  selectedVaPaymentId: number | null;
}

type ClassPaymentAction =
  | { type: 'setActiveTab'; tab: Tab }
  | { type: 'setPeriodMonths'; months: PeriodMonths }
  | { type: 'setCancelModal'; modal: CancelModalState | null }
  | { type: 'setRefundModal'; modal: { paymentId: number } | null }
  | { type: 'setSelectedVaPaymentId'; paymentId: number | null };

const INITIAL_CLASS_PAYMENT: ClassPaymentState = {
  activeTab: 'purchases',
  periodMonths: 3,
  cancelModal: null,
  refundModal: null,
  selectedVaPaymentId: null,
};

function classPaymentReducer(
  state: ClassPaymentState,
  action: ClassPaymentAction,
): ClassPaymentState {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTab: action.tab };
    case 'setPeriodMonths':
      return { ...state, periodMonths: action.months };
    case 'setCancelModal':
      return { ...state, cancelModal: action.modal };
    case 'setRefundModal':
      return { ...state, refundModal: action.modal };
    case 'setSelectedVaPaymentId':
      return { ...state, selectedVaPaymentId: action.paymentId };
    default:
      return state;
  }
}

export default function ClassPaymentManagementPage() {
  const router = useRouter();
  const [state, dispatch] = useReducer(
    classPaymentReducer,
    INITIAL_CLASS_PAYMENT,
  );
  const {
    activeTab,
    periodMonths,
    cancelModal,
    refundModal,
    selectedVaPaymentId,
  } = state;

  const { data: allPayments = [], isLoading } = useGetMyCoursePayments();
  const { data: canceledPayments = [], isLoading: canceledLoading } =
    useGetMyCoursePayments({ status: 'CANCELED' });
  const { data: vaDetail } = useGetMyCoursePaymentDetail(
    selectedVaPaymentId ?? 0,
    { enabled: !!selectedVaPaymentId },
  );

  // vaModal은 선택된 결제 + 상세 응답에서 렌더 중 파생 — effect/state 불필요.
  // 닫을 때 selectedVaPaymentId를 null로 두면 파생값도 null이 되어 모달이 닫힌다.
  const vaModal: VirtualAccountInfo | null =
    selectedVaPaymentId && vaDetail
      ? {
          bankName: vaDetail.virtualBankName ?? '-',
          accountNumber: vaDetail.virtualAccountNumber ?? '-',
          customerName: vaDetail.virtualAccountHolderName ?? undefined,
          dueDate: vaDetail.virtualAccountDueDate ?? undefined,
        }
      : null;

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
            onClick={() =>
              id !== 'coupons' && dispatch({ type: 'setActiveTab', tab: id })
            }
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
            onClick={() => dispatch({ type: 'setPeriodMonths', months: m })}
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
                dispatch({
                  type: 'setCancelModal',
                  modal: {
                    courseId: payment.courseId,
                    paymentId: payment.paymentId,
                    paymentMethod: payment.paymentMethod,
                  },
                })
              }
              onRequestRefund={() =>
                dispatch({
                  type: 'setRefundModal',
                  modal: { paymentId: payment.paymentId },
                })
              }
              onViewVirtualAccount={(paymentId) =>
                dispatch({ type: 'setSelectedVaPaymentId', paymentId })
              }
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
          onOpenChange={(open) =>
            !open && dispatch({ type: 'setCancelModal', modal: null })
          }
        />
      )}

      {refundModal && (
        <ClassRefundRequestModal
          paymentId={refundModal.paymentId}
          open
          onOpenChange={(open) =>
            !open && dispatch({ type: 'setRefundModal', modal: null })
          }
        />
      )}

      {vaModal && (
        <VirtualAccountInfoModal
          virtualAccountInfo={vaModal}
          open
          onOpenChange={(open) => {
            if (!open) {
              dispatch({ type: 'setSelectedVaPaymentId', paymentId: null });
            }
          }}
        />
      )}
    </div>
  );
}

function PaymentCard({
  payment,
  onCancel,
  onRequestRefund,
  onViewVirtualAccount,
}: {
  payment: MyCoursePaymentListItemResponse;
  onCancel: () => void;
  onRequestRefund: () => void;
  onViewVirtualAccount: (paymentId: number) => void;
}) {
  const status = STATUS_CONFIG[payment.status];
  const dateStr = formatDate(payment.paidAt ?? payment.createdAt);

  return (
    <div className="border-border-subtle rounded-200 flex gap-300 border p-300">
      {/* 썸네일 */}
      <div className="size-1000 flex-shrink-0 rounded-150 bg-gradient-to-br from-rose-500 to-rose-300" />

      {/* 내용 */}
      <div className="flex flex-1 flex-col gap-100">
        <div className="flex items-center gap-100">
          <Badge color={status.color}>{status.label}</Badge>
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
            onClick={() => onViewVirtualAccount(payment.paymentId)}
          >
            입금계좌 확인하기
          </button>
        )}

        {payment.canRequestRefund && (
          <button
            type="button"
            className="font-designer-14m text-text-subtle hover:text-text-default"
            onClick={onRequestRefund}
          >
            환불 요청
          </button>
        )}

        {(payment.canCancelPayment ?? payment.cancellable) &&
          !payment.canRequestRefund && (
            <button
              type="button"
              className="font-designer-14m text-text-subtle hover:text-text-default"
              onClick={onCancel}
            >
              결제취소
            </button>
          )}
      </div>
    </div>
  );
}
