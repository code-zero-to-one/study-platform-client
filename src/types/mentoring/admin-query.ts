import type {
  MentorOperationRecord,
  MentorScreeningRecord,
} from '@/types/mentoring/admin-domain';
import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringReview,
  MentoringSession,
} from '@/types/mentoring/management-domain';

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
