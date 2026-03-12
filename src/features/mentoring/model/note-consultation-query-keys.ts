import type { MentorProfile } from '@/types/mentoring/domain';
import type { MentoringRequest } from '@/types/mentoring/management-domain';
import type {
  NoteConsultationListQueryKey,
  NoteConsultationListQueryKeyParams,
  NoteConsultationQuerySnapshot,
} from '@/types/mentoring/note-consultation-query';
const toCreatedMentorSignature = (createdMentors: MentorProfile[]) => {
  if (createdMentors.length === 0) {
    return 'empty';
  }

  return [...createdMentors]
    .sort((first, second) => first.id - second.id)
    .map((mentor) => {
      return [
        mentor.id,
        mentor.memberId ?? '',
        mentor.nickname,
        mentor.role,
        mentor.imageUrl ?? '',
      ].join(':');
    })
    .join('|');
};
const toMentorMemberMappingSignature = (
  mentorIdByMember: Record<number, number>,
) => {
  const entries = Object.entries(mentorIdByMember);
  if (entries.length === 0) {
    return 'empty';
  }

  return entries
    .map(([memberId, mentorId]) => `${memberId}:${mentorId}`)
    .sort((first, second) => first.localeCompare(second))
    .join('|');
};
const toNoteRequestSignature = (
  requestsByMentor: Record<number, MentoringRequest[]>,
) => {
  const mentorIds = Object.keys(requestsByMentor)
    .map(Number)
    .sort((first, second) => first - second);
  if (mentorIds.length === 0) {
    return 'empty';
  }

  return mentorIds
    .map((mentorId) => {
      const requestSignature = (requestsByMentor[mentorId] ?? [])
        .filter((request) => request.method === 'note')
        .map((request) => {
          const lastMessage =
            request.conversation[request.conversation.length - 1];

          return [
            request.id,
            request.menteeMemberId ?? '',
            request.status,
            request.paymentStatus,
            request.requestedAt,
            request.requestMessage.length,
            request.conversation.length,
            lastMessage?.id ?? '',
            lastMessage?.createdAt ?? '',
            lastMessage?.content.length ?? 0,
          ].join(':');
        })
        .join(',');

      return `${mentorId}[${requestSignature}]`;
    })
    .join('|');
};
export const createNoteConsultationQuerySnapshot = ({
  requestsByMentor,
  createdMentors,
  mentorIdByMember,
}: {
  requestsByMentor: Record<number, MentoringRequest[]>;
  createdMentors: MentorProfile[];
  mentorIdByMember: Record<number, number>;
}): NoteConsultationQuerySnapshot => {
  return {
    noteRequestSignature: toNoteRequestSignature(requestsByMentor),
    createdMentorSignature: toCreatedMentorSignature(createdMentors),
    mentorMemberMappingSignature:
      toMentorMemberMappingSignature(mentorIdByMember),
  };
};
export const noteConsultationQueryKeys = {
  all: ['mentoring'] as const,
  noteConsultations: () =>
    [...noteConsultationQueryKeys.all, 'note-consultation'] as const,
  lists: () =>
    [...noteConsultationQueryKeys.noteConsultations(), 'list'] as const,
  list: (
    params: NoteConsultationListQueryKeyParams,
  ): NoteConsultationListQueryKey => [
    ...noteConsultationQueryKeys.lists(),
    params.memberId,
    params.myMentorId,
    params.snapshot.noteRequestSignature,
    params.snapshot.createdMentorSignature,
    params.snapshot.mentorMemberMappingSignature,
    params.requestsByMentor,
    params.createdMentors,
  ],
};
export const NOTE_CONSULTATION_QUERY_KEYS = noteConsultationQueryKeys;
