import type { MentorProfile } from '@/types/mentoring-domain';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringSession,
} from '@/types/mentoring-management';

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

export interface AdminMentoringOverviewSnapshot {
  createdMentorSignature: string;
  mentorMemberMappingSignature: string;
  requestSignature: string;
  sessionSignature: string;
  reviewSignature: string;
  screeningSignature: string;
  operationSignature: string;
}

export interface AdminMentoringOverviewQueryKeyParams {
  snapshot: AdminMentoringOverviewSnapshot;
  createdMentors: MentorProfile[];
  mentorIdByMember: Record<number, number>;
  requestsByMentor: Record<number, MentoringRequest[]>;
  sessionsByMentor: Record<number, MentoringSession[]>;
  reviewsByMentor: Record<number, MentoringReview[]>;
  screeningByMentor: Record<number, MentorScreeningRecord>;
  operationByMentor: Record<number, MentorOperationRecord>;
}

export type AdminMentoringOverviewQueryKey = readonly [
  'mentoring',
  'admin',
  'overview',
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  MentorProfile[],
  Record<number, number>,
  Record<number, MentoringRequest[]>,
  Record<number, MentoringSession[]>,
  Record<number, MentoringReview[]>,
  Record<number, MentorScreeningRecord>,
  Record<number, MentorOperationRecord>,
];

export interface AdminMentoringOverviewQueryResult {
  mentors: AdminMentorItem[];
  metrics: AdminMentoringDashboardMetrics;
}
