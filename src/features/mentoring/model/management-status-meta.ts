import type {
  MentoringRefundStatus,
  MentoringPaymentStatus,
  MentoringRequestStatus,
  MentoringSessionIssueType,
  MentoringSessionStatus,
} from '@/types/mentoring/management-domain';

type RequestStatusColor = 'orange' | 'green' | 'red';
type PaymentStatusColor = 'orange' | 'blue' | 'green';
type SessionStatusColor = 'green' | 'blue' | 'red';
type SessionIssueColor = 'green' | 'orange' | 'blue' | 'red' | 'gray';
type RefundStatusColor = 'green' | 'orange' | 'blue' | 'red' | 'gray';

interface StatusMeta<TColor extends string> {
  label: string;
  color: TColor;
}

export const MENTORING_REQUEST_STATUS_META: Record<
  MentoringRequestStatus,
  StatusMeta<RequestStatusColor>
> = {
  PENDING: {
    label: '신청 접수',
    color: 'orange',
  },
  ACCEPTED: {
    label: '수락 완료',
    color: 'green',
  },
  REJECTED: {
    label: '신청 거절',
    color: 'red',
  },
};

export const MENTORING_PAYMENT_STATUS_META: Record<
  MentoringPaymentStatus,
  StatusMeta<PaymentStatusColor>
> = {
  PENDING_TRANSFER: {
    label: '입금 확인 대기',
    color: 'orange',
  },
  NOT_REQUIRED: {
    label: '결제 불필요',
    color: 'blue',
  },
  CONFIRMED: {
    label: '결제 완료',
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

export const MENTORING_SESSION_ISSUE_META: Record<
  MentoringSessionIssueType,
  StatusMeta<SessionIssueColor>
> = {
  NONE: {
    label: '정상 진행',
    color: 'green',
  },
  MENTOR_CANCELLED: {
    label: '멘토 취소',
    color: 'red',
  },
  MENTEE_CANCELLED: {
    label: '멘티 취소',
    color: 'orange',
  },
  MENTOR_NO_SHOW: {
    label: '멘토 노쇼',
    color: 'red',
  },
  MENTEE_NO_SHOW: {
    label: '멘티 노쇼',
    color: 'orange',
  },
};

export const MENTORING_REFUND_STATUS_META: Record<
  MentoringRefundStatus,
  StatusMeta<RefundStatusColor>
> = {
  NOT_APPLICABLE: {
    label: '해당 없음',
    color: 'gray',
  },
  PENDING: {
    label: '환불 진행 중',
    color: 'orange',
  },
  COMPLETED: {
    label: '환불 완료',
    color: 'green',
  },
  NOT_ELIGIBLE: {
    label: '환불 불가',
    color: 'gray',
  },
};
