import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type MentoringMethodType } from '@/mocks/mentoring-mock-data';

export type MentoringRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type MentoringSessionStatus = 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
export type ConversationSender = 'MENTEE' | 'MENTOR' | 'SYSTEM';
export type MentoringPaymentMode = 'MANUAL_TRANSFER' | 'FREE_REQUEST';
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

interface StoreResponse {
  ok: boolean;
  reason?: string;
  sessionId?: string;
  reviewId?: string;
  isUpdated?: boolean;
}

interface RequestSchedulePayload {
  startsAt: string;
  endsAt: string;
  placeNote: string;
}

interface AcceptRequestPayload {
  mentorId: number;
  requestId: string;
  schedule?: RequestSchedulePayload;
  mentorNote?: string;
}

interface RejectRequestPayload {
  mentorId: number;
  requestId: string;
  reason: string;
}

interface SendMessagePayload {
  mentorId: number;
  requestId: string;
  content: string;
}

interface RescheduleSessionPayload {
  mentorId: number;
  sessionId: string;
  startsAt: string;
  endsAt: string;
  placeNote: string;
  mentorNote?: string;
}

interface CancelSessionPayload {
  mentorId: number;
  sessionId: string;
  reason: string;
}

interface CreateRequestPayload {
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
}

interface ConfirmManualPaymentPayload {
  mentorId: number;
  requestId: string;
  memo?: string;
}

interface SubmitReviewPayload {
  mentorId: number;
  requestId: string;
  menteeMemberId: number;
  menteeName: string;
  rating: number;
  recommendation: MentoringReviewRecommendation;
  content: string;
}

interface MentoringManagementState {
  memberId: number | undefined;
  requestsByMentor: Record<number, MentoringRequest[]>;
  sessionsByMentor: Record<number, MentoringSession[]>;
  reviewsByMentor: Record<number, MentoringReview[]>;
  hasHydrated: boolean;
  ensureDemoRequests: (memberId: number, mentorId: number) => void;
  createRequest: (payload: CreateRequestPayload) => string;
  acceptRequest: (payload: AcceptRequestPayload) => StoreResponse;
  rejectRequest: (payload: RejectRequestPayload) => StoreResponse;
  sendMentorMessage: (payload: SendMessagePayload) => StoreResponse;
  confirmManualPayment: (payload: ConfirmManualPaymentPayload) => StoreResponse;
  submitReview: (payload: SubmitReviewPayload) => StoreResponse;
  rescheduleSession: (payload: RescheduleSessionPayload) => StoreResponse;
  cancelSession: (payload: CancelSessionPayload) => StoreResponse;
  reset: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type PersistedState = Pick<
  MentoringManagementState,
  'memberId' | 'requestsByMentor' | 'sessionsByMentor' | 'reviewsByMentor'
>;

const REQUEST_STATUS_ORDER: Record<MentoringRequestStatus, number> = {
  PENDING: 0,
  ACCEPTED: 1,
  REJECTED: 2,
};

const SESSION_STATUS_ORDER: Record<MentoringSessionStatus, number> = {
  SCHEDULED: 0,
  COMPLETED: 1,
  CANCELLED: 2,
};

const INITIAL_STATE: Pick<
  MentoringManagementState,
  | 'memberId'
  | 'requestsByMentor'
  | 'sessionsByMentor'
  | 'reviewsByMentor'
  | 'hasHydrated'
> = {
  memberId: undefined,
  requestsByMentor: {},
  sessionsByMentor: {},
  reviewsByMentor: {},
  hasHydrated: false,
};

const createId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
};

const getInitialPaymentStatus = (
  paymentMode: MentoringPaymentMode,
): MentoringPaymentStatus => {
  if (paymentMode === 'FREE_REQUEST') {
    return 'NOT_REQUIRED';
  }

  return 'PENDING_TRANSFER';
};

const normalizeRequest = (
  request: MentoringRequest &
    Partial<{
      paymentMode: MentoringPaymentMode;
      paymentStatus: MentoringPaymentStatus;
      paymentMemo: string;
    }>,
): MentoringRequest => {
  const paymentMode = request.paymentMode ?? 'MANUAL_TRANSFER';
  const paymentStatus =
    request.paymentStatus ?? getInitialPaymentStatus(paymentMode);

  return {
    ...request,
    paymentMode,
    paymentStatus,
    paymentMemo: request.paymentMemo ?? '',
  };
};

const normalizeReview = (
  review: MentoringReview &
    Partial<{
      recommendation: MentoringReviewRecommendation;
      updatedAt: string;
    }>,
): MentoringReview => {
  return {
    ...review,
    recommendation: review.recommendation ?? 'RECOMMEND',
    updatedAt: review.updatedAt ?? review.createdAt,
  };
};

const isScheduleMethod = (method: MentoringMethodType) => {
  return method !== 'note';
};

const isValidScheduleRange = (startsAt: string, endsAt: string) => {
  return dayjs(startsAt).isBefore(dayjs(endsAt));
};

const hasOverlap = (
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) => {
  return (
    dayjs(firstStart).isBefore(dayjs(secondEnd)) &&
    dayjs(secondStart).isBefore(dayjs(firstEnd))
  );
};

export const hasSessionConflict = ({
  sessions,
  startsAt,
  endsAt,
  excludeSessionId,
}: {
  sessions: MentoringSession[];
  startsAt: string;
  endsAt: string;
  excludeSessionId?: string;
}) => {
  return sessions.some((session) => {
    if (session.status !== 'SCHEDULED') {
      return false;
    }
    if (excludeSessionId && session.id === excludeSessionId) {
      return false;
    }

    return hasOverlap(startsAt, endsAt, session.startsAt, session.endsAt);
  });
};

const sortRequests = (requests: MentoringRequest[]) => {
  return [...requests].sort((first, second) => {
    const byStatus =
      REQUEST_STATUS_ORDER[first.status] - REQUEST_STATUS_ORDER[second.status];
    if (byStatus !== 0) {
      return byStatus;
    }

    return (
      dayjs(second.requestedAt).valueOf() - dayjs(first.requestedAt).valueOf()
    );
  });
};

const sortSessions = (sessions: MentoringSession[]) => {
  return [...sessions].sort((first, second) => {
    const byStatus =
      SESSION_STATUS_ORDER[first.status] - SESSION_STATUS_ORDER[second.status];
    if (byStatus !== 0) {
      return byStatus;
    }

    return dayjs(first.startsAt).valueOf() - dayjs(second.startsAt).valueOf();
  });
};

const sortReviews = (reviews: MentoringReview[]) => {
  return [...reviews].sort((first, second) => {
    return dayjs(second.updatedAt).valueOf() - dayjs(first.updatedAt).valueOf();
  });
};

const isSessionReviewCompleted = (
  session: MentoringSession,
  now: dayjs.Dayjs,
) => {
  if (session.status === 'COMPLETED') {
    return true;
  }
  if (session.status === 'CANCELLED') {
    return false;
  }

  return dayjs(session.endsAt).isBefore(now);
};

export const getRequestReviewEligibility = ({
  request,
  session,
  now = dayjs(),
}: {
  request: MentoringRequest;
  session?: MentoringSession;
  now?: dayjs.Dayjs;
}): MentoringReviewEligibility => {
  if (request.status !== 'ACCEPTED') {
    return {
      canReview: false,
      reason: '신청이 수락된 뒤 후기를 남길 수 있습니다.',
      isCompleted: false,
    };
  }

  if (!isScheduleMethod(request.method)) {
    return {
      canReview: true,
      isCompleted: true,
    };
  }

  if (!session) {
    return {
      canReview: false,
      reason: '멘토가 상담 일정을 확정하면 후기 작성이 열립니다.',
      isCompleted: false,
    };
  }

  if (session.status === 'CANCELLED') {
    return {
      canReview: false,
      reason: '취소된 상담은 후기를 남길 수 없습니다.',
      isCompleted: false,
    };
  }

  if (isSessionReviewCompleted(session, now)) {
    return {
      canReview: true,
      isCompleted: true,
    };
  }

  return {
    canReview: false,
    reason: '상담이 종료된 뒤 후기 작성이 가능합니다.',
    isCompleted: false,
  };
};

const createMenteeMessage = (
  requestMessage: string,
): MentoringConversationMessage => {
  return {
    id: createId('msg'),
    sender: 'MENTEE',
    content: requestMessage,
    createdAt: new Date().toISOString(),
  };
};

const createDemoRequests = (mentorId: number): MentoringRequest[] => {
  const now = dayjs();

  const entries: Array<{
    method: MentoringMethodType;
    paymentMode: MentoringPaymentMode;
    paymentStatus?: MentoringPaymentStatus;
    paymentMemo?: string;
    name: string;
    role: string;
    requestedAt: string;
    preferredDate?: string;
    preferredTime?: string;
    requestMessage: string;
  }> = [
    {
      method: 'note',
      paymentMode: 'FREE_REQUEST',
      paymentMemo: '오픈 기념 무료 상담 이벤트 신청',
      name: '김소연',
      role: '취업 준비생',
      requestedAt: now.subtract(4, 'hour').toISOString(),
      requestMessage:
        '이력서에 프로젝트 성과를 어떻게 수치화하면 좋을지 피드백 부탁드립니다.',
    },
    {
      method: 'phone',
      paymentMode: 'MANUAL_TRANSFER',
      paymentMemo: '계좌이체 예정 (신청 후 1시간 내)',
      name: '박준호',
      role: '주니어 백엔드 개발자',
      requestedAt: now.subtract(3, 'hour').toISOString(),
      preferredDate: now.add(4, 'day').format('YYYY-MM-DD'),
      preferredTime: '20:00',
      requestMessage:
        '15분 안에 이직 방향을 빠르게 점검받고 싶습니다. 현재 경력기술서도 함께 검토 부탁드립니다.',
    },
    {
      method: 'online',
      paymentMode: 'MANUAL_TRANSFER',
      paymentStatus: 'CONFIRMED',
      paymentMemo: '송금 완료, 멘토 확인 대기',
      name: '이하은',
      role: '프론트엔드 개발자',
      requestedAt: now.subtract(2, 'hour').toISOString(),
      preferredDate: now.add(5, 'day').format('YYYY-MM-DD'),
      preferredTime: '21:00',
      requestMessage:
        '포트폴리오와 과제전형 코드 리뷰가 필요합니다. 화면 공유로 함께 점검하고 싶어요.',
    },
    {
      method: 'offline',
      paymentMode: 'MANUAL_TRANSFER',
      paymentMemo: '현장 결제 협의 요청',
      name: '최민석',
      role: '서비스 기획자',
      requestedAt: now.subtract(1, 'hour').toISOString(),
      preferredDate: now.add(6, 'day').format('YYYY-MM-DD'),
      preferredTime: '19:30',
      requestMessage:
        '커리어 전환 상담을 대면으로 진행하고 싶습니다. 준비해간 질문 리스트가 있습니다.',
    },
  ];

  return sortRequests(
    entries.map((entry) => ({
      id: createId('request'),
      mentorId,
      method: entry.method,
      paymentMode: entry.paymentMode,
      paymentStatus:
        entry.paymentStatus ?? getInitialPaymentStatus(entry.paymentMode),
      paymentMemo: entry.paymentMemo ?? '',
      menteeName: entry.name,
      menteeRole: entry.role,
      requestedAt: entry.requestedAt,
      preferredDate: entry.preferredDate,
      preferredTime: entry.preferredTime,
      requestMessage: entry.requestMessage,
      status: 'PENDING',
      conversation: [createMenteeMessage(entry.requestMessage)],
    })),
  );
};

const buildSystemMessage = (
  content: string,
  createdAt: string,
): MentoringConversationMessage => {
  return {
    id: createId('msg'),
    sender: 'SYSTEM',
    content,
    createdAt,
  };
};

const buildMentorMessage = (
  content: string,
  createdAt: string,
): MentoringConversationMessage => {
  return {
    id: createId('msg'),
    sender: 'MENTOR',
    content,
    createdAt,
  };
};

const addRequestConversation = (
  request: MentoringRequest,
  messages: MentoringConversationMessage[],
) => {
  return {
    ...request,
    conversation: [...request.conversation, ...messages],
  };
};

export const useMentoringManagementStore = create<MentoringManagementState>()(
  persist(
    (set): MentoringManagementState => ({
      ...INITIAL_STATE,
      ensureDemoRequests: (memberId, mentorId) => {
        set((state) => {
          const isDifferentMember =
            state.memberId !== undefined && state.memberId !== memberId;
          const baseRequests = isDifferentMember ? {} : state.requestsByMentor;
          const baseSessions = isDifferentMember ? {} : state.sessionsByMentor;
          const baseReviews = isDifferentMember ? {} : state.reviewsByMentor;
          const currentRequests = (baseRequests[mentorId] ?? []).map(
            normalizeRequest,
          );
          const seededRequests =
            currentRequests.length > 0
              ? currentRequests
              : createDemoRequests(mentorId);
          const currentSessions = baseSessions[mentorId] ?? [];
          const currentReviews = (baseReviews[mentorId] ?? []).map(
            normalizeReview,
          );

          return {
            memberId,
            requestsByMentor: {
              ...baseRequests,
              [mentorId]: sortRequests(seededRequests),
            },
            sessionsByMentor: {
              ...baseSessions,
              [mentorId]: sortSessions(currentSessions),
            },
            reviewsByMentor: {
              ...baseReviews,
              [mentorId]: sortReviews(currentReviews),
            },
          };
        });
      },
      createRequest: (payload) => {
        const now = new Date().toISOString();
        const requestId = createId('request');

        set((state) => {
          const nextRequest: MentoringRequest = {
            id: requestId,
            mentorId: payload.mentorId,
            method: payload.method,
            paymentMode: payload.paymentMode,
            paymentStatus: getInitialPaymentStatus(payload.paymentMode),
            paymentMemo: payload.paymentMemo?.trim() ?? '',
            menteeMemberId: payload.menteeMemberId,
            menteeName: payload.menteeName,
            menteeRole: payload.menteeRole,
            requestedAt: now,
            preferredDate: payload.preferredDate,
            preferredTime: payload.preferredTime,
            requestMessage: payload.requestMessage,
            status: 'PENDING',
            conversation: [createMenteeMessage(payload.requestMessage)],
          };

          const currentRequests =
            state.requestsByMentor[payload.mentorId] ?? [];

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [payload.mentorId]: sortRequests([
                nextRequest,
                ...currentRequests,
              ]),
            },
          };
        });

        return requestId;
      },
      acceptRequest: ({ mentorId, requestId, schedule, mentorNote }) => {
        let response: StoreResponse = {
          ok: false,
          reason: '신청 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const requests = state.requestsByMentor[mentorId] ?? [];
          const targetIndex = requests.findIndex(
            (request) => request.id === requestId,
          );
          if (targetIndex < 0) {
            return state;
          }

          const targetRequest = requests[targetIndex];
          if (targetRequest.status !== 'PENDING') {
            response = {
              ok: false,
              reason: '이미 처리된 신청입니다.',
            };

            return state;
          }

          const now = new Date().toISOString();
          const nextRequests = [...requests];
          const sessions = state.sessionsByMentor[mentorId] ?? [];
          const nextSessions = [...sessions];
          let nextLinkedSessionId = targetRequest.linkedSessionId;
          const messages: MentoringConversationMessage[] = [];

          if (isScheduleMethod(targetRequest.method)) {
            if (!schedule) {
              response = {
                ok: false,
                reason: '예약형 상담은 일정 확정이 필요합니다.',
              };

              return state;
            }

            if (!isValidScheduleRange(schedule.startsAt, schedule.endsAt)) {
              response = {
                ok: false,
                reason: '시작 시간보다 종료 시간이 빠를 수 없습니다.',
              };

              return state;
            }

            if (
              hasSessionConflict({
                sessions: nextSessions,
                startsAt: schedule.startsAt,
                endsAt: schedule.endsAt,
              })
            ) {
              response = {
                ok: false,
                reason: '같은 시간대에 이미 확정된 일정이 있습니다.',
              };

              return state;
            }

            nextLinkedSessionId = createId('session');
            nextSessions.push({
              id: nextLinkedSessionId,
              mentorId,
              requestId: targetRequest.id,
              menteeName: targetRequest.menteeName,
              method: targetRequest.method,
              startsAt: schedule.startsAt,
              endsAt: schedule.endsAt,
              placeNote: schedule.placeNote,
              status: 'SCHEDULED',
              createdAt: now,
              updatedAt: now,
            });

            messages.push(
              buildSystemMessage(
                `멘토가 신청을 수락하고 일정을 확정했어요. (${dayjs(
                  schedule.startsAt,
                ).format('MM/DD HH:mm')} ~ ${dayjs(schedule.endsAt).format(
                  'HH:mm',
                )})`,
                now,
              ),
            );
          } else {
            messages.push(buildSystemMessage('멘토가 신청을 수락했어요.', now));
          }

          const trimmedMentorNote = mentorNote?.trim();
          if (trimmedMentorNote) {
            messages.push(buildMentorMessage(trimmedMentorNote, now));
          }

          nextRequests[targetIndex] = addRequestConversation(
            {
              ...targetRequest,
              status: 'ACCEPTED',
              acceptedAt: now,
              decisionNote: trimmedMentorNote,
              linkedSessionId: nextLinkedSessionId,
            },
            messages,
          );

          response = {
            ok: true,
            sessionId: nextLinkedSessionId,
          };

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
            sessionsByMentor: {
              ...state.sessionsByMentor,
              [mentorId]: sortSessions(nextSessions),
            },
          };
        });

        return response;
      },
      rejectRequest: ({ mentorId, requestId, reason }) => {
        const trimmedReason = reason.trim();
        if (trimmedReason.length < 2) {
          return {
            ok: false,
            reason: '거절 사유를 2자 이상 입력해주세요.',
          };
        }

        let response: StoreResponse = {
          ok: false,
          reason: '신청 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const requests = state.requestsByMentor[mentorId] ?? [];
          const targetIndex = requests.findIndex(
            (request) => request.id === requestId,
          );
          if (targetIndex < 0) {
            return state;
          }

          const targetRequest = requests[targetIndex];
          if (targetRequest.status !== 'PENDING') {
            response = {
              ok: false,
              reason: '이미 처리된 신청입니다.',
            };

            return state;
          }

          const now = new Date().toISOString();
          const nextRequests = [...requests];
          const messages = [
            buildSystemMessage('멘토가 신청을 거절했어요.', now),
            buildMentorMessage(trimmedReason, now),
          ];

          nextRequests[targetIndex] = addRequestConversation(
            {
              ...targetRequest,
              status: 'REJECTED',
              rejectedAt: now,
              decisionNote: trimmedReason,
            },
            messages,
          );

          response = {
            ok: true,
          };

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
          };
        });

        return response;
      },
      sendMentorMessage: ({ mentorId, requestId, content }) => {
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) {
          return {
            ok: false,
            reason: '메시지를 입력해주세요.',
          };
        }

        let response: StoreResponse = {
          ok: false,
          reason: '신청 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const requests = state.requestsByMentor[mentorId] ?? [];
          const targetIndex = requests.findIndex(
            (request) => request.id === requestId,
          );
          if (targetIndex < 0) {
            return state;
          }

          const now = new Date().toISOString();
          const nextRequests = [...requests];
          const targetRequest = requests[targetIndex];
          nextRequests[targetIndex] = addRequestConversation(targetRequest, [
            buildMentorMessage(trimmedContent, now),
          ]);

          response = {
            ok: true,
          };

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
          };
        });

        return response;
      },
      confirmManualPayment: ({ mentorId, requestId, memo }) => {
        let response: StoreResponse = {
          ok: false,
          reason: '신청 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const requests = state.requestsByMentor[mentorId] ?? [];
          const targetIndex = requests.findIndex(
            (request) => request.id === requestId,
          );
          if (targetIndex < 0) {
            return state;
          }

          const targetRequest = requests[targetIndex];
          if (targetRequest.paymentMode !== 'MANUAL_TRANSFER') {
            response = {
              ok: false,
              reason: '수동결제 신청이 아닙니다.',
            };

            return state;
          }

          if (targetRequest.paymentStatus === 'CONFIRMED') {
            response = {
              ok: false,
              reason: '이미 입금 확인된 신청입니다.',
            };

            return state;
          }

          const now = new Date().toISOString();
          const nextRequests = [...requests];
          const trimmedMemo = memo?.trim();
          const messages = [
            buildSystemMessage('멘토가 입금 상태를 확인했어요.', now),
          ];

          if (trimmedMemo) {
            messages.push(buildMentorMessage(trimmedMemo, now));
          }

          nextRequests[targetIndex] = addRequestConversation(
            {
              ...targetRequest,
              paymentStatus: 'CONFIRMED',
              paymentMemo:
                trimmedMemo && trimmedMemo.length > 0
                  ? trimmedMemo
                  : targetRequest.paymentMemo,
            },
            messages,
          );

          response = { ok: true };

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
          };
        });

        return response;
      },
      submitReview: ({
        mentorId,
        requestId,
        menteeMemberId,
        menteeName,
        rating,
        recommendation,
        content,
      }) => {
        const trimmedContent = content.trim();
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return {
            ok: false,
            reason: '별점은 1점 이상 5점 이하로 선택해주세요.',
          };
        }
        if (trimmedContent.length < 10) {
          return {
            ok: false,
            reason: '후기는 10자 이상 입력해주세요.',
          };
        }

        let response: StoreResponse = {
          ok: false,
          reason: '후기를 등록할 상담 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const requests = state.requestsByMentor[mentorId] ?? [];
          const requestIndex = requests.findIndex(
            (request) => request.id === requestId,
          );
          if (requestIndex < 0) {
            return state;
          }

          const targetRequest = requests[requestIndex];
          if (
            targetRequest.menteeMemberId !== undefined &&
            targetRequest.menteeMemberId !== menteeMemberId
          ) {
            response = {
              ok: false,
              reason: '본인 신청 건에만 후기를 남길 수 있습니다.',
            };

            return state;
          }

          const sessions = state.sessionsByMentor[mentorId] ?? [];
          const linkedSession = targetRequest.linkedSessionId
            ? sessions.find(
                (session) => session.id === targetRequest.linkedSessionId,
              )
            : undefined;
          const eligibility = getRequestReviewEligibility({
            request: targetRequest,
            session: linkedSession,
          });

          if (!eligibility.canReview) {
            response = {
              ok: false,
              reason:
                eligibility.reason ??
                '아직 후기 작성이 가능한 상태가 아닙니다.',
            };

            return state;
          }

          const nowIso = new Date().toISOString();
          const reviews = state.reviewsByMentor[mentorId] ?? [];
          const existingReviewIndex = reviews.findIndex((review) => {
            return (
              review.requestId === requestId &&
              review.menteeMemberId === menteeMemberId
            );
          });
          const nextReviews = [...reviews];
          const reviewId =
            existingReviewIndex >= 0
              ? nextReviews[existingReviewIndex].id
              : createId('review');
          const createdAt =
            existingReviewIndex >= 0
              ? nextReviews[existingReviewIndex].createdAt
              : nowIso;

          const nextReview: MentoringReview = {
            id: reviewId,
            mentorId,
            requestId,
            sessionId: linkedSession?.id,
            menteeMemberId,
            menteeName: menteeName.trim() || targetRequest.menteeName,
            method: targetRequest.method,
            rating,
            recommendation,
            content: trimmedContent,
            createdAt,
            updatedAt: nowIso,
          };

          if (existingReviewIndex >= 0) {
            nextReviews[existingReviewIndex] = nextReview;
          } else {
            nextReviews.push(nextReview);
          }

          const nextRequests = [...requests];
          if (existingReviewIndex < 0) {
            nextRequests[requestIndex] = addRequestConversation(targetRequest, [
              buildSystemMessage('멘티가 멘토링 후기를 남겼어요.', nowIso),
            ]);
          }

          const nextSessions = [...sessions];
          if (
            linkedSession &&
            linkedSession.status === 'SCHEDULED' &&
            dayjs(linkedSession.endsAt).isBefore(dayjs(nowIso))
          ) {
            const sessionIndex = nextSessions.findIndex(
              (session) => session.id === linkedSession.id,
            );
            if (sessionIndex >= 0) {
              nextSessions[sessionIndex] = {
                ...linkedSession,
                status: 'COMPLETED',
                updatedAt: nowIso,
              };
            }
          }

          response = {
            ok: true,
            reviewId: nextReview.id,
            isUpdated: existingReviewIndex >= 0,
          };

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
            sessionsByMentor: {
              ...state.sessionsByMentor,
              [mentorId]: sortSessions(nextSessions),
            },
            reviewsByMentor: {
              ...state.reviewsByMentor,
              [mentorId]: sortReviews(nextReviews),
            },
          };
        });

        return response;
      },
      rescheduleSession: ({
        mentorId,
        sessionId,
        startsAt,
        endsAt,
        placeNote,
        mentorNote,
      }) => {
        if (!isValidScheduleRange(startsAt, endsAt)) {
          return {
            ok: false,
            reason: '시작 시간보다 종료 시간이 빠를 수 없습니다.',
          };
        }

        let response: StoreResponse = {
          ok: false,
          reason: '일정 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const sessions = state.sessionsByMentor[mentorId] ?? [];
          const sessionIndex = sessions.findIndex(
            (session) => session.id === sessionId,
          );
          if (sessionIndex < 0) {
            return state;
          }

          if (
            hasSessionConflict({
              sessions,
              startsAt,
              endsAt,
              excludeSessionId: sessionId,
            })
          ) {
            response = {
              ok: false,
              reason: '같은 시간대에 이미 확정된 일정이 있습니다.',
            };

            return state;
          }

          const now = new Date().toISOString();
          const nextSessions = [...sessions];
          const targetSession = sessions[sessionIndex];
          nextSessions[sessionIndex] = {
            ...targetSession,
            startsAt,
            endsAt,
            placeNote: placeNote.trim(),
            updatedAt: now,
          };

          const requests = state.requestsByMentor[mentorId] ?? [];
          const requestIndex = requests.findIndex(
            (request) => request.id === targetSession.requestId,
          );
          const nextRequests = [...requests];

          if (requestIndex >= 0) {
            const conversationMessages = [
              buildSystemMessage(
                `일정이 변경되었어요. (${dayjs(startsAt).format(
                  'MM/DD HH:mm',
                )} ~ ${dayjs(endsAt).format('HH:mm')})`,
                now,
              ),
            ];
            const trimmedMentorNote = mentorNote?.trim();
            if (trimmedMentorNote) {
              conversationMessages.push(
                buildMentorMessage(trimmedMentorNote, now),
              );
            }

            nextRequests[requestIndex] = addRequestConversation(
              nextRequests[requestIndex],
              conversationMessages,
            );
          }

          response = { ok: true };

          return {
            sessionsByMentor: {
              ...state.sessionsByMentor,
              [mentorId]: sortSessions(nextSessions),
            },
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
          };
        });

        return response;
      },
      cancelSession: ({ mentorId, sessionId, reason }) => {
        const trimmedReason = reason.trim();
        if (trimmedReason.length < 2) {
          return {
            ok: false,
            reason: '취소 사유를 2자 이상 입력해주세요.',
          };
        }

        let response: StoreResponse = {
          ok: false,
          reason: '일정 정보를 찾을 수 없습니다.',
        };

        set((state) => {
          const sessions = state.sessionsByMentor[mentorId] ?? [];
          const sessionIndex = sessions.findIndex(
            (session) => session.id === sessionId,
          );
          if (sessionIndex < 0) {
            return state;
          }

          const now = new Date().toISOString();
          const nextSessions = [...sessions];
          const targetSession = sessions[sessionIndex];
          nextSessions[sessionIndex] = {
            ...targetSession,
            status: 'CANCELLED',
            updatedAt: now,
          };

          const requests = state.requestsByMentor[mentorId] ?? [];
          const requestIndex = requests.findIndex(
            (request) => request.id === targetSession.requestId,
          );
          const nextRequests = [...requests];

          if (requestIndex >= 0) {
            nextRequests[requestIndex] = addRequestConversation(
              nextRequests[requestIndex],
              [
                buildSystemMessage('확정된 일정이 취소되었어요.', now),
                buildMentorMessage(trimmedReason, now),
              ],
            );
          }

          response = { ok: true };

          return {
            sessionsByMentor: {
              ...state.sessionsByMentor,
              [mentorId]: sortSessions(nextSessions),
            },
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(nextRequests),
            },
          };
        });

        return response;
      },
      reset: () => {
        set({
          ...INITIAL_STATE,
          hasHydrated: true,
        });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'mentoring-management-storage',
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState) {
          return persistedState;
        }

        const typedState = persistedState as PersistedState;
        const normalizedRequestsByMentor = Object.fromEntries(
          Object.entries(typedState.requestsByMentor ?? {}).map(
            ([mentorId, requests]) => {
              return [
                Number(mentorId),
                sortRequests((requests ?? []).map(normalizeRequest)),
              ];
            },
          ),
        ) as Record<number, MentoringRequest[]>;
        const normalizedSessionsByMentor = Object.fromEntries(
          Object.entries(typedState.sessionsByMentor ?? {}).map(
            ([mentorId, sessions]) => {
              return [Number(mentorId), sortSessions(sessions ?? [])];
            },
          ),
        ) as Record<number, MentoringSession[]>;
        const normalizedReviewsByMentor = Object.fromEntries(
          Object.entries(typedState.reviewsByMentor ?? {}).map(
            ([mentorId, reviews]) => {
              return [
                Number(mentorId),
                sortReviews((reviews ?? []).map(normalizeReview)),
              ];
            },
          ),
        ) as Record<number, MentoringReview[]>;

        return {
          memberId: typedState.memberId,
          requestsByMentor: normalizedRequestsByMentor,
          sessionsByMentor: normalizedSessionsByMentor,
          reviewsByMentor: normalizedReviewsByMentor,
        };
      },
      partialize: (state): PersistedState => ({
        memberId: state.memberId,
        requestsByMentor: state.requestsByMentor,
        sessionsByMentor: state.sessionsByMentor,
        reviewsByMentor: state.reviewsByMentor,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
