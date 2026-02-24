import type { MentoringRequest } from '@/types/mentoring/management-domain';

export type NoteConsultationChannel = 'sent' | 'received';

export interface NoteConsultationListItem {
  id: string;
  request: MentoringRequest;
  displayName: string;
  displayRole: string;
  channel: NoteConsultationChannel;
  lastMessageContent: string;
  lastMessageCreatedAt: string;
  mentorReplyCount: number;
}
