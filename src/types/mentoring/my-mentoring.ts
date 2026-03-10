import type {
  MentoringRefundStatus,
  MentoringSessionIssueType,
} from '@/types/mentoring/management-domain';

export type MyMentoringMethod = 'ONLINE' | 'OFFLINE' | 'CALL';
export type MyMentoringStatus =
  | 'REQUESTED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'REJECTED';

export interface MyMentoringItem {
  id: string;
  mentorId: number;
  title: string;
  mentorName: string;
  method: MyMentoringMethod;
  status: MyMentoringStatus;
  detailHref: string;
  nextActionLabel: string;
  nextActionHref: string;
  requestedAtValue: string;
  sortValue: number;
  mentoringTime?: string;
  preferredWindow?: string;
  requestedAt: string;
  pendingWindow?: string;
  sessionGuide?: string;
  description: string;
  statusReason?: string;
  historyDateLabel?: string;
  paymentMethodLabel: string;
  paymentAmountLabel: string;
  paymentStatusLabel: string;
  paymentStatusTone: 'green' | 'orange' | 'blue' | 'gray';
  issueType?: MentoringSessionIssueType;
  issueStatusLabel?: string;
  issueStatusTone?: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  refundStatus?: MentoringRefundStatus;
  refundStatusLabel?: string;
  refundStatusTone?: 'green' | 'orange' | 'blue' | 'red' | 'gray';
  refundNote?: string;
}

export interface MyNoteConsultationSummary {
  totalCount: number;
  waitingCount: number;
  actionableCount: number;
  waitingHref?: string;
  actionableHref?: string;
}

export interface MyNoteConsultationItem {
  id: string;
  mentorName: string;
  roleLabel: string;
  requestedAt: string;
  lastMessage: string;
  statusLabel: string;
  statusTone: 'green' | 'orange' | 'blue' | 'red';
  paymentStatusLabel: string;
  paymentStatusTone: 'green' | 'orange' | 'blue' | 'gray';
  href: string;
}
