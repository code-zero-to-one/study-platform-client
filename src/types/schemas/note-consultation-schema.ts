import { z } from 'zod';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';
import { mentorMethodTypeSchema } from '@/types/schemas/mentor-directory-schema';

const noteConsultationRequestStatusSchema = z.enum([
  'PENDING',
  'ACCEPTED',
  'REJECTED',
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
export const noteConsultationChannelSchema = z.enum(['sent', 'received']);
export const noteConsultationConversationMessageSchema = z.object({
  id: z.string(),
  sender: noteConsultationConversationSenderSchema,
  content: z.string(),
  createdAt: z.string(),
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
  attachedFileNames: z.array(z.string()).optional(),
  referenceLinks: z.array(z.string()).optional(),
  status: noteConsultationRequestStatusSchema,
  decisionNote: z.string().optional(),
  acceptedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
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
export const noteConsultationCreatedMentorSchema = z.object({
  id: z.number(),
  memberId: z.number().optional(),
  nickname: z.string(),
  role: z.string(),
  imageUrl: z.string().optional(),
});
export const noteConsultationQuerySourceSchema = z.object({
  memberId: z.number().optional(),
  myMentorId: z.number().optional(),
  createdMentors: z.array(noteConsultationCreatedMentorSchema),
  requestsByMentor: z.record(
    z.string().regex(/^\d+$/),
    z.array(noteConsultationRequestSchema),
  ),
});
export const sendNoteConsultationMessageParamsSchema = z.object({
  mentorId: z.number(),
  requestId: z.string().trim().min(1),
  content: z.string().trim().min(1, '메시지 내용을 입력해주세요.'),
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
export type NoteConsultationQuerySourceInput = z.input<
  typeof noteConsultationQuerySourceSchema
>;
export type NoteConsultationQuerySource = z.infer<
  typeof noteConsultationQuerySourceSchema
>;
export type SendNoteConsultationMessageParams = z.infer<
  typeof sendNoteConsultationMessageParamsSchema
>;
