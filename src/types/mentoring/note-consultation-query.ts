import type {
  MentoringConversationMessage,
} from '@/types/mentoring/management-domain';
import type {
  NoteConsultationListResponse,
  SendNoteConsultationMessageParams,
} from '@/types/schemas/note-consultation-schema';

export type NoteConsultationListQueryResult = NoteConsultationListResponse;

export type SendNoteConsultationMessageMutationParams =
  SendNoteConsultationMessageParams;

export interface SendNoteConsultationMessageMutationResult {
  ok: boolean;
  messageId: string;
  requestId: string;
  lastMessageCreatedAt: string;
  updatedAt?: string;
  message?: MentoringConversationMessage;
}
