import type { MentorProfile } from '@/types/mentoring/domain';
import type {
  MentoringRequest,
  MentoringStoreActionResponse,
} from '@/types/mentoring/management-domain';
import type {
  NoteConsultationListResponse,
  SendNoteConsultationMessageParams,
} from '@/types/schemas/note-consultation-schema';

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

export type NoteConsultationListQueryResult = NoteConsultationListResponse;

export interface NoteConsultationListQuerySource {
  memberId?: number;
  myMentorId?: number;
  requestsByMentor: Record<number, MentoringRequest[]>;
  createdMentors: MentorProfile[];
}

export type SendNoteConsultationMessageMutationParams =
  SendNoteConsultationMessageParams;

export type SendNoteConsultationMessageMutationResult =
  MentoringStoreActionResponse;
