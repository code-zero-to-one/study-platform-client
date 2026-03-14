import type { AdminMentorItem } from '@/types/mentoring/admin-domain';
import type {
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';

export type SessionMentorFilter = 'ALL' | number;

export type SessionRequestRow = MentoringRequest & {
  mentorMemberId?: number;
};

export type SessionScheduleRow = MentoringSession & {
  mentorMemberId?: number;
};

export interface SessionOperationsSummary {
  totalRequestCount: number;
  pendingRequestCount: number;
  closedNoteCount: number;
  scheduledSessionCount: number;
  completedSessionCount: number;
}

export interface SessionOperationsState {
  hasHydrated: boolean;
  mentors: AdminMentorItem[];
  selectedMentorId: SessionMentorFilter;
}

export interface SessionOperationsViewModel {
  requestRows: SessionRequestRow[];
  sessionRows: SessionScheduleRow[];
  summary: SessionOperationsSummary;
}

export interface SessionOperationsActions {
  selectMentorId: (mentorId: SessionMentorFilter) => void;
}
