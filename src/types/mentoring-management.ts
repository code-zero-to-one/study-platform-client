import type { MentoringMethodType } from '@/types/mentoring-domain';
import type { MentoringRequestContentBlock } from '@/types/mentoring-request-content';

export type MentoringRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type MentoringSessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export type ConversationSender = 'MENTEE' | 'MENTOR' | 'SYSTEM';
export type MentoringPaymentMode =
  | 'TOSS_PAYMENTS'
  | 'MANUAL_TRANSFER'
  | 'FREE_REQUEST';
export type MentoringPaymentStatus =
  | 'PENDING_TRANSFER'
  | 'NOT_REQUIRED'
  | 'CONFIRMED';
export type MentoringReviewRecommendation = 'RECOMMEND' | 'NOT_RECOMMEND';

export interface MentoringConversationMessage {
  id: string;
  sender: ConversationSender;
  content: string;
  createdAt: string;
}

export interface MentoringRequest {
  id: string;
  mentorId: number;
  method: MentoringMethodType;
  paymentMode: MentoringPaymentMode;
  paymentStatus: MentoringPaymentStatus;
  paymentMemo?: string;
  menteeMemberId?: number;
  menteeName: string;
  menteeRole: string;
  requestedAt: string;
  preferredDate?: string;
  preferredTime?: string;
  requestMessage: string;
  requestContents?: MentoringRequestContentBlock[];
  attachedFileNames?: string[];
  referenceLinks?: string[];
  status: MentoringRequestStatus;
  decisionNote?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  linkedSessionId?: string;
  conversation: MentoringConversationMessage[];
}

export interface MentoringSession {
  id: string;
  mentorId: number;
  requestId: string;
  menteeName: string;
  method: MentoringMethodType;
  startsAt: string;
  endsAt: string;
  placeNote: string;
  status: MentoringSessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MentoringReview {
  id: string;
  mentorId: number;
  requestId: string;
  sessionId?: string;
  menteeMemberId: number;
  menteeName: string;
  method: MentoringMethodType;
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentoringReviewEligibility {
  canReview: boolean;
  reason?: string;
  isCompleted: boolean;
}

export interface MentoringStoreActionResponse {
  ok: boolean;
  reason?: string;
  sessionId?: string;
  reviewId?: string;
  isUpdated?: boolean;
}

export interface MentoringRequestScheduleParams {
  startsAt: string;
  endsAt: string;
  placeNote: string;
}

export interface AcceptMentoringRequestParams {
  mentorId: number;
  requestId: string;
  schedule?: MentoringRequestScheduleParams;
  mentorNote?: string;
}

export interface RejectMentoringRequestParams {
  mentorId: number;
  requestId: string;
  reason: string;
}

export interface SendMentoringMessageParams {
  mentorId: number;
  requestId: string;
  content: string;
}

export interface RescheduleMentoringSessionParams {
  mentorId: number;
  sessionId: string;
  startsAt: string;
  endsAt: string;
  placeNote: string;
  mentorNote?: string;
}

export interface CancelMentoringSessionParams {
  mentorId: number;
  sessionId: string;
  reason: string;
}

export interface CreateMentoringRequestParams {
  mentorId: number;
  method: MentoringMethodType;
  paymentMode: MentoringPaymentMode;
  paymentMemo?: string;
  menteeMemberId?: number;
  menteeName: string;
  menteeRole: string;
  preferredDate?: string;
  preferredTime?: string;
  requestMessage: string;
  requestContents?: MentoringRequestContentBlock[];
  attachedFileNames?: string[];
  referenceLinks?: string[];
}

export interface ConfirmManualMentoringPaymentParams {
  mentorId: number;
  requestId: string;
  memo?: string;
}

export interface SubmitMentoringReviewParams {
  mentorId: number;
  requestId: string;
  menteeMemberId: number;
  menteeName: string;
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
}

export interface SeedMentoringScenarioParams {
  mentorId: number;
  baseMenteeMemberId?: number;
}
