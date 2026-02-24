import type {
  MentoringPaymentStatus,
  MentoringRequestStatus,
  MentoringSessionStatus,
} from '@/types/mentoring-management';

type RequestStatusColor = 'orange' | 'green' | 'red';
type PaymentStatusColor = 'orange' | 'blue' | 'green';
type SessionStatusColor = 'green' | 'blue' | 'red';

interface StatusMeta<TColor extends string> {
  label: string;
  color: TColor;
}

export const MENTORING_REQUEST_STATUS_META: Record<
  MentoringRequestStatus,
  StatusMeta<RequestStatusColor>
> = {
  PENDING: {
    label: '대기중',
    color: 'orange',
  },
  ACCEPTED: {
    label: '수락됨',
    color: 'green',
  },
  REJECTED: {
    label: '거절됨',
    color: 'red',
  },
};

export const MENTORING_PAYMENT_STATUS_META: Record<
  MentoringPaymentStatus,
  StatusMeta<PaymentStatusColor>
> = {
  PENDING_TRANSFER: {
    label: '입금 대기',
    color: 'orange',
  },
  NOT_REQUIRED: {
    label: '결제 불필요',
    color: 'blue',
  },
  CONFIRMED: {
    label: '입금 확인',
    color: 'green',
  },
};

export const MENTORING_SESSION_STATUS_META: Record<
  MentoringSessionStatus,
  StatusMeta<SessionStatusColor>
> = {
  SCHEDULED: {
    label: '예정',
    color: 'green',
  },
  COMPLETED: {
    label: '완료',
    color: 'blue',
  },
  CANCELLED: {
    label: '취소',
    color: 'red',
  },
};
