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
  history: MentorOperationHistoryEntry[];
}

export interface UpsertMentorOperationParams {
  mentorId: number;
  status: MentorOperationStatus;
  reason?: string;
  changedAt?: string;
  changedByMemberId?: number;
}

export interface AdminMentorItem {
  mentor: MentorProfile;
  mentorId: number;
  memberId?: number;
  screening: MentorScreeningRecord;
  operation: MentorOperationRecord;
  requests: MentoringRequest[];
  sessions: MentoringSession[];
  reviews: MentoringReview[];
  counts: {
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    scheduledSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    reviews: number;
  };
}

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

export interface AdminMentoringOverviewQueryResult {
  mentors: AdminMentorItem[];
  metrics: AdminMentoringDashboardMetrics;
}
