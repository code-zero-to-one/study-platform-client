import type { MentoringMethodType } from '@/types/mentoring/domain';
import type {
  MentoringPaymentMethod,
  MentoringPaymentMode,
  MentoringReviewRecommendation,
  MentoringSessionIssueType,
} from '@/types/mentoring/management-domain';
import type { MentoringRequestContentBlock } from '@/types/mentoring/request-content';

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
  issueType?: Extract<
    MentoringSessionIssueType,
    'MENTOR_CANCELLED' | 'MENTEE_CANCELLED'
  >;
}

export interface MarkMentoringSessionOutcomeParams {
  mentorId: number;
  sessionId: string;
  outcome: 'COMPLETED' | 'MENTEE_NO_SHOW' | 'MENTOR_NO_SHOW';
  note?: string;
}

export interface CreateMentoringRequestParams {
  mentorId: number;
  method: MentoringMethodType;
  mentorDisplayTitle?: string;
  mentorNickname?: string;
  methodLabel?: string;
  durationLabel?: string;
  paymentAmount?: number;
  paymentMode: MentoringPaymentMode;
  paymentMethod: MentoringPaymentMethod;
  paymentMemo?: string;
  menteeMemberId?: number;
  menteeName: string;
  menteeRole: string;
  preferredDate?: string;
  preferredTime?: string;
  requestTitle?: string;
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
