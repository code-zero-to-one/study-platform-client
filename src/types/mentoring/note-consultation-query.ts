import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringStoreActionResponse,
} from '@/types/mentoring/management-domain';
import type { NoteConsultationListItem } from '@/types/mentoring/note-consultation-view';

export interface NoteConsultationQuerySnapshot {
  noteRequestSignature: string;
  createdMentorSignature: string;
  mentorMemberMappingSignature: string;
}

export interface NoteConsultationListQueryKeyParams {
  memberId?: number;
  myMentorId?: number;
  snapshot: NoteConsultationQuerySnapshot;
  requestsByMentor: Record<number, MentoringRequest[]>;
  createdMentors: MentorProfile[];
}

export type NoteConsultationListQueryKey = readonly [
  'mentoring',
  'note-consultation',
  'list',
  number | undefined,
  number | undefined,
  string,
  string,
  string,
  Record<number, MentoringRequest[]>,
  MentorProfile[],
];

export interface NoteConsultationListQueryResult {
  sentItems: NoteConsultationListItem[];
  receivedItems: NoteConsultationListItem[];
}

export interface NoteConsultationListQuerySource {
  memberId?: number;
  myMentorId?: number;
  requestsByMentor: Record<number, MentoringRequest[]>;
  createdMentors: MentorProfile[];
}

export interface SendNoteConsultationMessageMutationParams {
  mentorId: number;
  requestId: string;
  content: string;
}

export type SendNoteConsultationMessageMutationResult =
  MentoringStoreActionResponse;
