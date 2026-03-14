import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringSession,
} from '@/types/mentoring/management-domain';

export type MentorScreeningStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface MentorScreeningRecord {
  status: MentorScreeningStatus;
  note?: string;
  startedAt?: string;
  startedByMemberId?: number;
  reviewedAt?: string;
  reviewedByMemberId?: number;
}

export interface MentorScreeningHistoryEntry {
  id: string;
  fromStatus: MentorScreeningStatus | 'INITIAL';
  toStatus: MentorScreeningStatus;
  note?: string;
  changedAt: string;
  changedByMemberId?: number;
}

export interface UpsertMentorScreeningParams {
  mentorId: number;
  status: MentorScreeningStatus;
  note?: string;
  startedAt?: string;
  startedByMemberId?: number;
  reviewedAt?: string;
  reviewedByMemberId?: number;
}

export type MentorOperationStatus = 'OPEN' | 'REQUESTS_PAUSED' | 'SUSPENDED';

export interface MentorOperationHistoryEntry {
  id: string;
  fromStatus: MentorOperationStatus | 'INITIAL';
  toStatus: MentorOperationStatus;
  reason?: string;
  changedAt: string;
  changedByMemberId?: number;
}

export interface MentorOperationRecord {
  status: MentorOperationStatus;
  reason?: string;
  changedAt?: string;
  changedByMemberId?: number;
  history?: MentorOperationHistoryEntry[];
}

export interface UpsertMentorOperationParams {
  mentorId: number;
  status: MentorOperationStatus;
  reason?: string;
  changedAt?: string;
  changedByMemberId?: number;
}

export interface LifecyclePage<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AdminMentorCounts {
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  closedRequests: number;
  scheduledSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  reviews: number;
}

export interface AdminMentorListItem {
  mentor: MentorProfile;
  mentorId: number;
  memberId?: number;
  screening: MentorScreeningRecord;
  operation: MentorOperationRecord;
  counts: AdminMentorCounts;
}

export interface AdminMentorDetail extends AdminMentorListItem {
  requestsPage: LifecyclePage<MentoringRequest>;
  sessionsPage: LifecyclePage<MentoringSession>;
  reviewsPage: LifecyclePage<MentoringReview>;
  screeningHistory: MentorScreeningHistoryEntry[];
  operationHistory: MentorOperationHistoryEntry[];
}

export type AdminMentorItem = AdminMentorListItem;

export interface AdminMentoringDashboardMetrics {
  registeredMentorCount: number;
  pendingScreeningCount: number;
  inReviewScreeningCount: number;
  approvedMentorCount: number;
  rejectedMentorCount: number;
  pendingRequestCount: number;
  scheduledSessionCount: number;
  completedReviewCount: number;
}
