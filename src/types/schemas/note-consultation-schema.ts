import { z } from 'zod';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';
import { mentorMethodTypeSchema } from '@/types/schemas/mentor-directory-schema';

const noteConsultationRequestStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CLOSED',
]);
const noteConsultationPaymentModeSchema = z.enum([
  'TOSS_PAYMENTS',
  'MANUAL_TRANSFER',
  'FREE_REQUEST',
]);
const noteConsultationPaymentStatusSchema = z.enum([
  'PENDING_TRANSFER',
  'NOT_REQUIRED',
  'CONFIRMED',
]);
const noteConsultationConversationSenderSchema = z.enum([
  'MENTEE',
  'MENTOR',
  'SYSTEM',
]);
const noteConsultationAttachedFileSchema = z.object({
  fileKey: z.string().optional(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string().optional(),
  publicUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});
export const noteConsultationChannelSchema = z.enum(['sent', 'received']);
export const noteConsultationConversationMessageSchema = z.object({
  id: z.string(),
  sender: noteConsultationConversationSenderSchema,
  content: z.string(),
  contentFormat: z.enum(['PLAIN_TEXT', 'HTML']).optional(),
  messageContents: z.array(z.custom<MentoringRequestContentBlock>()).optional(),
  attachedFiles: z.array(noteConsultationAttachedFileSchema).optional(),
  attachedFileNames: z.array(z.string()).optional(),
  referenceLinks: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export const noteConsultationRequestSchema = z.object({
  id: z.string(),
  mentorId: z.number(),
  method: mentorMethodTypeSchema,
  paymentMode: noteConsultationPaymentModeSchema,
  paymentStatus: noteConsultationPaymentStatusSchema,
  paymentMemo: z.string().optional(),
  menteeMemberId: z.number().optional(),
  menteeName: z.string(),
  menteeRole: z.string(),
  requestedAt: z.string(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  requestTitle: z.string().optional(),
  requestMessage: z.string(),
  // request contents는 구조가 확장 중이라 경계에서 타입만 유지합니다.
  requestContents: z.array(z.custom<MentoringRequestContentBlock>()).optional(),
  attachedFiles: z.array(noteConsultationAttachedFileSchema).optional(),
  attachedFileNames: z.array(z.string()).optional(),
  referenceLinks: z.array(z.string()).optional(),
  status: noteConsultationRequestStatusSchema,
  displayStatus: z
    .enum([
      'REQUESTED',
      'PENDING',
      'NOTE_WAITING',
      'CONFIRMED',
      'COMPLETED',
      'REJECTED',
      'CANCELLED',
      'NO_SHOW',
    ])
    .optional(),
  decisionNote: z.string().optional(),
  closeNote: z.string().optional(),
  acceptedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  closedAt: z.string().optional(),
  linkedSessionId: z.string().optional(),
  conversation: z.array(noteConsultationConversationMessageSchema),
});

export const noteConsultationListItemSchema = z.object({
  id: z.string(),
  request: noteConsultationRequestSchema,
  displayName: z.string(),
  displayRole: z.string(),
  channel: noteConsultationChannelSchema,
  counterpartMemberId: z.number().optional(),
  counterpartProfileImageUrl: z.string().optional(),
  lastMessageContent: z.string(),
  lastMessageCreatedAt: z.string(),
  mentorReplyCount: z.number().int().nonnegative(),
});
export const noteConsultationListResponseSchema = z.object({
  sentItems: z.array(noteConsultationListItemSchema),
  receivedItems: z.array(noteConsultationListItemSchema),
});
export const sendNoteConsultationMessageParamsSchema = z.object({
  mentorId: z.number(),
  requestId: z.string().trim().min(1),
  messageId: z.string().trim().min(1).optional(),
  content: z.string().trim().min(1, '메시지 내용을 입력해주세요.'),
  messageContents: z.array(z.custom<MentoringRequestContentBlock>()).optional(),
  attachmentFileKeys: z.array(z.string()).optional(),
  attachedFileNames: z.array(z.string()).optional(),
  referenceLinks: z.array(z.string()).optional(),
});
export type NoteConsultationChannel = z.infer<
  typeof noteConsultationChannelSchema
>;
export type NoteConsultationListItem = z.infer<
  typeof noteConsultationListItemSchema
>;
export type NoteConsultationListResponse = z.infer<
  typeof noteConsultationListResponseSchema
>;
export type SendNoteConsultationMessageParams = z.infer<
  typeof sendNoteConsultationMessageParamsSchema
>;
