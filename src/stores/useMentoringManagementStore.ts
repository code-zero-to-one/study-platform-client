import dayjs from 'dayjs';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type MentoringMethodType } from '@/types/mentoring/domain';
import type {
  AcceptMentoringRequestParams,
  CancelMentoringSessionParams,
  ConfirmManualMentoringPaymentParams,
  CreateMentoringRequestParams,
  MarkMentoringSessionOutcomeParams,
  RejectMentoringRequestParams,
  RescheduleMentoringSessionParams,
  SeedMentoringScenarioParams,
  SendMentoringMessageParams,
  SubmitMentoringReviewParams,
} from '@/types/mentoring/management-api';
import type {
  MentoringConversationMessage,
  MentoringPaymentMethod,
  MentoringPaymentMode,
  MentoringPaymentStatus,
  MentoringRefundStatus,
  MentoringRequest,
  MentoringRequestStatus,
  MentoringReview,
  MentoringReviewEligibility,
  MentoringReviewRecommendation,
  MentoringSession,
  MentoringSessionIssueType,
  MentoringSessionStatus,
  MentoringStoreActionResponse,
} from '@/types/mentoring/management-domain';
interface MentoringManagementState {
  memberId: number | undefined;
  requestsByMentor: Record<number, MentoringRequest[]>;
  sessionsByMentor: Record<number, MentoringSession[]>;
  reviewsByMentor: Record<number, MentoringReview[]>;
  hasHydrated: boolean;
  ensureDemoRequests: (memberId: number, mentorId: number) => void;
  ensureNoteDemoData: (
    memberId: number,
    options?: { menteeName?: string; menteeRole?: string },
  ) => void;
  createRequest: (payload: CreateMentoringRequestParams) => string;
  acceptRequest: (
    payload: AcceptMentoringRequestParams,
  ) => MentoringStoreActionResponse;
  rejectRequest: (
    payload: RejectMentoringRequestParams,
  ) => MentoringStoreActionResponse;
  sendMentorMessage: (
    payload: SendMentoringMessageParams,
  ) => MentoringStoreActionResponse;
  confirmManualPayment: (
    payload: ConfirmManualMentoringPaymentParams,
  ) => MentoringStoreActionResponse;
  submitReview: (
    payload: SubmitMentoringReviewParams,
  ) => MentoringStoreActionResponse;
  rescheduleSession: (
    payload: RescheduleMentoringSessionParams,
  ) => MentoringStoreActionResponse;
  cancelSession: (
    payload: CancelMentoringSessionParams,
  ) => MentoringStoreActionResponse;
  markSessionOutcome: (
    payload: MarkMentoringSessionOutcomeParams,
  ) => MentoringStoreActionResponse;
  seedMockScenario: (payload: SeedMentoringScenarioParams) => void;
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
  if (paymentMode === 'MANUAL_TRANSFER') {
    return 'PENDING_TRANSFER';
  } // TOSS_PAYMENTS: 결제 완료 후 신청이 생성되므로 즉시 CONFIRMED return 'CONFIRMED';
};
const getDefaultPaymentMethod = (
  paymentMode: MentoringPaymentMode,
): MentoringPaymentMethod => {
  if (paymentMode === 'MANUAL_TRANSFER') {
    return 'MANUAL_TRANSFER';
  }

  return 'CARD';
};
const normalizeRequest = (
  request: MentoringRequest &
    Partial<{
      paymentMethod: MentoringPaymentMethod;
      paymentMode: MentoringPaymentMode;
      paymentStatus: MentoringPaymentStatus;
      paymentMemo: string;
    }>,
): MentoringRequest => {
  const paymentMode = request.paymentMode ?? 'TOSS_PAYMENTS';
  const paymentMethod =
    request.paymentMethod ?? getDefaultPaymentMethod(paymentMode);
  const paymentStatus =
    request.paymentStatus ?? getInitialPaymentStatus(paymentMode);

  return {
    ...request,
    paymentMode,
    paymentMethod,
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
const normalizeSession = (
  session: MentoringSession &
    Partial<{
      issueType: MentoringSessionIssueType;
      operationNote: string;
      refundStatus: MentoringRefundStatus;
      refundNote: string;
    }>,
): MentoringSession => {
  return {
    ...session,
    issueType: session.issueType ?? 'NONE',
    operationNote: session.operationNote?.trim() || undefined,
    refundStatus: session.refundStatus ?? 'NOT_APPLICABLE',
    refundNote: session.refundNote?.trim() || undefined,
  };
};
const isScheduleMethod = (method: MentoringMethodType) => {
  return method !== 'note';
};
const getRefundInfoForIssue = ({
  issueType,
  startsAt,
  now,
}: {
  issueType: MentoringSessionIssueType;
  startsAt: string;
  now: string;
}): { refundStatus: MentoringRefundStatus; refundNote?: string } => {
  if (issueType === 'MENTOR_CANCELLED' || issueType === 'MENTOR_NO_SHOW') {
    return {
      refundStatus: 'PENDING' as const,
      refundNote: '멘토 사정으로 전액 환불이 진행될 예정입니다.',
    };
  }
  if (issueType === 'MENTEE_NO_SHOW') {
    return {
      refundStatus: 'NOT_ELIGIBLE' as const,
      refundNote: '정해진 시간에 미입장으로 확인되어 환불 대상이 아닙니다.',
    };
  }
  if (issueType === 'MENTEE_CANCELLED') {
    const hoursUntilStart = dayjs(startsAt).diff(dayjs(now), 'hour', true);
    if (hoursUntilStart >= 120) {
      return {
        refundStatus: 'PENDING' as const,
        refundNote:
          '상담 시작 120시간 전 취소로 전액 환불이 진행될 예정입니다.',
      };
    }
    if (hoursUntilStart >= 24) {
      return {
        refundStatus: 'PENDING' as const,
        refundNote: '상담 시작 24시간 전 취소로 부분 환불이 진행될 예정입니다.',
      };
    }

    return {
      refundStatus: 'NOT_ELIGIBLE' as const,
      refundNote: '상담 시작 24시간 내 취소로 환불 대상이 아닙니다.',
    };
  }

  return { refundStatus: 'NOT_APPLICABLE' as const, refundNote: undefined };
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
  if (
    session.issueType === 'MENTEE_NO_SHOW' ||
    session.issueType === 'MENTOR_NO_SHOW'
  ) {
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
    return { canReview: true, isCompleted: true };
  }
  if (!session) {
    return {
      canReview: false,
      reason: '멘토가 상담 일정을 확정하면 후기 작성이 열립니다.',
      isCompleted: false,
    };
  }
  if (
    session.issueType === 'MENTEE_NO_SHOW' ||
    session.issueType === 'MENTOR_NO_SHOW'
  ) {
    return {
      canReview: false,
      reason: '노쇼 처리된 상담은 후기를 남길 수 없습니다.',
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
    return { canReview: true, isCompleted: true };
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
      paymentMode: 'MANUAL_TRANSFER',
      paymentMemo: '계좌이체 예정 (신청 후 30분 내)',
      name: '김소연',
      role: '취업 준비생',
      requestedAt: now.subtract(4, 'hour').toISOString(),
      requestMessage:
        '이력서에 프로젝트 성과를 어떻게 수치화하면 좋을지 피드백 부탁드립니다.',
    },
    {
      method: 'simple',
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
      method: 'deep',
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
const createDemoPendingScheduleRequests = (
  mentorId: number,
): MentoringRequest[] => {
  const now = dayjs();
  const entries: Array<{
    method: MentoringMethodType;
    paymentMode: MentoringPaymentMode;
    paymentStatus?: MentoringPaymentStatus;
    name: string;
    role: string;
    preferredDate: string;
    preferredTime: string;
    requestMessage: string;
  }> = [
    {
      method: 'simple',
      paymentMode: 'MANUAL_TRANSFER',
      name: '정다은',
      role: '디자이너 → 개발자 전환 준비',
      preferredDate: now.add(3, 'day').format('YYYY-MM-DD'),
      preferredTime: '19:00',
      requestMessage:
        '개발로 전직 준비 중인데, 어떤 순서로 공부하면 좋을지 방향 상담을 받고 싶어요.',
    },
    {
      method: 'deep',
      paymentMode: 'MANUAL_TRANSFER',
      paymentStatus: 'CONFIRMED',
      name: '오승민',
      role: '시니어 백엔드 개발자',
      preferredDate: now.add(7, 'day').format('YYYY-MM-DD'),
      preferredTime: '21:00',
      requestMessage:
        '현재 아키텍처 리뷰와 이직 시 협상 전략에 대해 조언 부탁드립니다.',
    },
    {
      method: 'offline',
      paymentMode: 'MANUAL_TRANSFER',
      name: '한지수',
      role: '취업 준비생',
      preferredDate: now.add(10, 'day').format('YYYY-MM-DD'),
      preferredTime: '15:00',
      requestMessage:
        '포트폴리오 최종 점검과 면접 준비를 대면으로 함께하고 싶습니다.',
    },
  ];

  return entries.map((entry) => ({
    id: createId('request'),
    mentorId,
    method: entry.method,
    paymentMode: entry.paymentMode,
    paymentStatus:
      entry.paymentStatus ?? getInitialPaymentStatus(entry.paymentMode),
    paymentMemo: '',
    menteeName: entry.name,
    menteeRole: entry.role,
    requestedAt: now.subtract(30, 'minute').toISOString(),
    preferredDate: entry.preferredDate,
    preferredTime: entry.preferredTime,
    requestMessage: entry.requestMessage,
    status: 'PENDING',
    conversation: [createMenteeMessage(entry.requestMessage)],
  }));
};
const buildSystemMessage = (
  content: string,
  createdAt: string,
): MentoringConversationMessage => {
  return { id: createId('msg'), sender: 'SYSTEM', content, createdAt };
};
const buildMentorMessage = (
  content: string,
  createdAt: string,
): MentoringConversationMessage => {
  return { id: createId('msg'), sender: 'MENTOR', content, createdAt };
};
const addRequestConversation = (
  request: MentoringRequest,
  messages: MentoringConversationMessage[],
) => {
  return { ...request, conversation: [...request.conversation, ...messages] };
};
const toIso = (value: dayjs.ConfigType) => dayjs(value).toISOString();
const toDate = (value: dayjs.ConfigType) => dayjs(value).format('YYYY-MM-DD');
const toTime = (value: dayjs.ConfigType) => dayjs(value).format('HH:mm');
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
          const baseSeeded =
            currentRequests.length > 0
              ? currentRequests
              : createDemoRequests(mentorId);
          const hasPendingWithSchedule = baseSeeded.some(
            (r) => r.status === 'PENDING' && !!r.preferredDate,
          );
          const seededRequests = hasPendingWithSchedule
            ? baseSeeded
            : [...baseSeeded, ...createDemoPendingScheduleRequests(mentorId)];
          const currentSessions = (baseSessions[mentorId] ?? []).map(
            normalizeSession,
          );
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
      ensureNoteDemoData: (memberId, options) => {
        set((state) => {
          const now = dayjs();
          const menteeName = options?.menteeName?.trim() || '서윤';
          const menteeRole = options?.menteeRole?.trim() || 'ZERO-ONE 멘티';
          const bookedSessionStart = now
            .add(2, 'day')
            .hour(20)
            .minute(0)
            .second(0)
            .millisecond(0);
          const bookedSessionEnd = bookedSessionStart.add(60, 'minute');
          const completedSessionStart = now
            .subtract(3, 'day')
            .hour(19)
            .minute(0)
            .second(0)
            .millisecond(0);
          const completedSessionEnd = completedSessionStart.add(60, 'minute');
          const noShowSessionStart = now
            .subtract(1, 'day')
            .hour(21)
            .minute(0)
            .second(0)
            .millisecond(0);
          const noShowSessionEnd = noShowSessionStart.add(60, 'minute');
          const demoBookedSessionId = 'reservation-demo-session-booked';
          const demoCompletedSessionId = 'reservation-demo-session-completed';
          const demoNoShowSessionId = 'reservation-demo-session-no-show';
          const demoNoteRequests: MentoringRequest[] = [
            {
              id: 'note-demo-fixed-1',
              mentorId: 101,
              method: 'note',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'CONFIRMED',
              paymentMemo: '03/09 21:30 서윤 · 카카오뱅크',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(2, 'day').toISOString(),
              requestMessage:
                '백엔드 포트폴리오 문장 정리가 막혀서 쪽지상담 신청드립니다.\n\nQ. 멘토링 목적이 무엇인가요?\n상반기 신입/주니어 백엔드 공채 지원 전에 포트폴리오와 이력서 문장을 한 번 정리하고 싶습니다.\n\nQ. 질문하고 싶은 내용을 작성해주세요.\n1. 프로젝트 설명을 문제 정의 - 구현 - 성과 순으로 다시 쓰려는데, 지금은 기술 나열 위주라 읽기 어렵습니다.\n2. 사용자 수나 매출 같은 숫자가 없을 때도 설득력 있게 적을 수 있는 표현이 있을까요?\n3. Spring Boot, JPA, Redis 경험 중 어떤 키워드를 더 앞에 두는 게 좋을지 궁금합니다.\n\nQ. 멘토에게 전하고 싶은 말\n가능하시면 우선순위가 높은 수정 포인트부터 짚어주시면 바로 반영해보겠습니다.',
              status: 'ACCEPTED',
              acceptedAt: now.subtract(1, 'day').toISOString(),
              conversation: [
                {
                  id: 'note-demo-fixed-1-msg-1',
                  sender: 'MENTOR',
                  content:
                    '포트폴리오 방향은 잘 잡혀 있고, 지금은 문장 순서만 정리해도 훨씬 좋아질 것 같습니다.\n\n우선 각 프로젝트를 "왜 만들었는지 - 내가 맡은 역할 - 어떤 방식으로 해결했는지 - 결과" 순서로 4문장 안쪽에 정리해보세요. 숫자가 없으면 "배포 자동화 시간을 줄였다", "문의 대응 속도를 높였다"처럼 팀 효율이나 운영 안정성 기준으로 써도 충분합니다.\n\n기술 키워드는 JD에 자주 나오는 것부터 앞에 두는 게 좋습니다. 지금 상황이면 Spring Boot와 JPA를 먼저 두고, Redis는 캐시/성능 개선 경험이 있을 때 보조 키워드로 붙이는 편을 추천합니다.\n\n원하시면 다음 메시지로 프로젝트 한 개 문장만 보내주세요. 실제 제출용 톤으로 바로 다듬어드릴게요.',
                  createdAt: now.subtract(20, 'hour').toISOString(),
                },
              ],
            },
            {
              id: 'note-demo-fixed-2',
              mentorId: 101,
              method: 'note',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'PENDING_TRANSFER',
              paymentMemo: '오늘 22:00 이체 예정 · 서윤 · 토스뱅크',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(1, 'hour').toISOString(),
              requestMessage:
                '프론트엔드 2년차 이직 준비 우선순위 상담을 받고 싶습니다.\n\nQ. 멘토링 목적이 무엇인가요?\n상반기 안에 한 단계 큰 회사로 이직하고 싶은데, 준비 범위를 넓게 잡아두기만 해서 진도가 안 나가고 있습니다.\n\nQ. 질문하고 싶은 내용을 작성해주세요.\n1. 지금 시점에는 코딩 테스트, 포트폴리오, 기술 면접 중 어디에 시간을 가장 많이 써야 할까요?\n2. React/Next.js 경험은 있는데 CS가 약한 편이라 기술 면접 대비를 언제부터 섞어야 할지 고민입니다.\n3. 3개월 기준으로 준비 일정을 짠다면 주차별로 어떤 흐름이 현실적일지 조언 부탁드립니다.\n\nQ. 멘토에게 전하고 싶은 말\n막연한 조언보다, 실제로 실행 가능한 순서로 정리해주시면 큰 도움이 될 것 같습니다.',
              status: 'PENDING',
              conversation: [],
            },
            {
              id: 'note-demo-fixed-3',
              mentorId: 101,
              method: 'note',
              paymentMode: 'FREE_REQUEST',
              paymentStatus: 'NOT_REQUIRED',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(5, 'day').toISOString(),
              requestMessage:
                '백엔드에서 프론트엔드까지 확장하고 싶은데 학습 범위가 감이 안 잡혀 문의드렸습니다.\n\nQ. 멘토링 목적이 무엇인가요?\n현재는 백엔드 중심으로 일하고 있고, 사이드 프로젝트에서 프론트엔드까지 맡을 수 있을 정도의 역량을 만들고 싶습니다.\n\nQ. 질문하고 싶은 내용을 작성해주세요.\n1. 프론트엔드를 처음 다시 공부한다면 HTML/CSS부터 탄탄히 보는 게 맞는지, 아니면 React 위주로 먼저 가도 되는지 궁금합니다.\n2. 실무에서 협업 가능한 수준까지 가려면 어느 정도 깊이가 필요할까요?\n3. 백엔드 개발자가 프론트 경험을 쌓을 때 포트폴리오로 남기기 좋은 프로젝트 예시가 있으면 알고 싶습니다.\n\nQ. 멘토에게 전하고 싶은 말\n최근 신청이 많으셨을 것 같아 짧게라도 방향만 잡아주셔도 감사하겠습니다.',
              status: 'REJECTED',
              decisionNote: '현재 신규 신청을 받고 있지 않습니다.',
              rejectedAt: now.subtract(4, 'day').toISOString(),
              conversation: [],
            },
            {
              id: 'note-demo-fixed-4',
              mentorId: 101,
              method: 'note',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'CONFIRMED',
              paymentMemo: '03/11 09:20 이체 확인 완료',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(8, 'hour').toISOString(),
              requestMessage:
                '포트폴리오 첫 문단(한 줄 소개) 톤을 어떻게 잡아야 할지 확인받고 싶습니다.',
              status: 'ACCEPTED',
              acceptedAt: now.subtract(7, 'hour').toISOString(),
              conversation: [
                {
                  id: 'note-demo-fixed-4-msg-1',
                  sender: 'MENTEE',
                  content:
                    '포트폴리오 첫 문단(한 줄 소개) 톤을 어떻게 잡아야 할지 확인받고 싶습니다.',
                  createdAt: now.subtract(8, 'hour').toISOString(),
                },
                {
                  id: 'note-demo-fixed-4-msg-2',
                  sender: 'SYSTEM',
                  content: '멘토가 신청을 수락했어요.',
                  createdAt: now.subtract(7, 'hour').toISOString(),
                },
              ],
            },
          ];
          const demoReservationRequests: MentoringRequest[] = [
            {
              id: 'reservation-demo-fixed-1',
              mentorId: 101,
              method: 'simple',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'PENDING_TRANSFER',
              paymentMemo: '오늘 23:00 이체 예정',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(3, 'hour').toISOString(),
              preferredDate: now.add(5, 'day').format('YYYY-MM-DD'),
              preferredTime: '20:00',
              requestMessage:
                '간편상담으로 이직 준비 우선순위를 빠르게 점검하고 싶습니다.',
              status: 'PENDING',
              conversation: [
                {
                  id: 'reservation-demo-fixed-1-msg-1',
                  sender: 'MENTEE',
                  content:
                    '간편상담으로 이직 준비 우선순위를 빠르게 점검하고 싶습니다.',
                  createdAt: now.subtract(3, 'hour').toISOString(),
                },
              ],
            },
            {
              id: 'reservation-demo-fixed-2',
              mentorId: 101,
              method: 'deep',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'CONFIRMED',
              paymentMemo: '03/11 18:10 입금 확인 완료',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(2, 'day').toISOString(),
              preferredDate: bookedSessionStart.format('YYYY-MM-DD'),
              preferredTime: bookedSessionStart.format('HH:mm'),
              requestMessage:
                '코드 리뷰와 기술면접 답변 정리를 60분 심층상담으로 받고 싶습니다.',
              status: 'ACCEPTED',
              acceptedAt: now.subtract(1, 'day').toISOString(),
              decisionNote: '사전 질문 정리 후 Google Meet으로 진행합니다.',
              linkedSessionId: demoBookedSessionId,
              conversation: [
                {
                  id: 'reservation-demo-fixed-2-msg-1',
                  sender: 'MENTEE',
                  content:
                    '코드 리뷰와 기술면접 답변 정리를 60분 심층상담으로 받고 싶습니다.',
                  createdAt: now.subtract(2, 'day').toISOString(),
                },
                {
                  id: 'reservation-demo-fixed-2-msg-2',
                  sender: 'SYSTEM',
                  content:
                    '멘토가 신청을 수락하고 일정을 확정했어요. (03/14 20:00 ~ 21:00)',
                  createdAt: now.subtract(1, 'day').toISOString(),
                },
              ],
            },
            {
              id: 'reservation-demo-fixed-3',
              mentorId: 101,
              method: 'offline',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'CONFIRMED',
              paymentMemo: '03/08 15:00 결제 완료',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(6, 'day').toISOString(),
              preferredDate: completedSessionStart.format('YYYY-MM-DD'),
              preferredTime: completedSessionStart.format('HH:mm'),
              requestMessage:
                '대면상담으로 포트폴리오 전체 스토리라인을 점검받고 싶습니다.',
              status: 'ACCEPTED',
              acceptedAt: now.subtract(5, 'day').toISOString(),
              linkedSessionId: demoCompletedSessionId,
              conversation: [
                {
                  id: 'reservation-demo-fixed-3-msg-1',
                  sender: 'MENTEE',
                  content:
                    '대면상담으로 포트폴리오 전체 스토리라인을 점검받고 싶습니다.',
                  createdAt: now.subtract(6, 'day').toISOString(),
                },
                {
                  id: 'reservation-demo-fixed-3-msg-2',
                  sender: 'SYSTEM',
                  content: '멘토가 상담 완료로 처리했어요.',
                  createdAt: now.subtract(3, 'day').toISOString(),
                },
              ],
            },
            {
              id: 'reservation-demo-fixed-4',
              mentorId: 101,
              method: 'deep',
              paymentMode: 'MANUAL_TRANSFER',
              paymentStatus: 'CONFIRMED',
              paymentMemo: '03/10 19:20 입금 확인 완료',
              menteeMemberId: memberId,
              menteeName,
              menteeRole,
              requestedAt: now.subtract(4, 'day').toISOString(),
              preferredDate: noShowSessionStart.format('YYYY-MM-DD'),
              preferredTime: noShowSessionStart.format('HH:mm'),
              requestMessage:
                '이력서/면접 대비 질문 리스트를 함께 점검받고 싶습니다.',
              status: 'ACCEPTED',
              acceptedAt: now.subtract(3, 'day').toISOString(),
              linkedSessionId: demoNoShowSessionId,
              decisionNote:
                '질문 리스트 기준으로 우선순위부터 정리해서 진행합니다.',
              conversation: [
                {
                  id: 'reservation-demo-fixed-4-msg-1',
                  sender: 'MENTEE',
                  content:
                    '이력서/면접 대비 질문 리스트를 함께 점검받고 싶습니다.',
                  createdAt: now.subtract(4, 'day').toISOString(),
                },
                {
                  id: 'reservation-demo-fixed-4-msg-2',
                  sender: 'SYSTEM',
                  content: '이번 상담이 멘티 미입장으로 기록되었어요.',
                  createdAt: now.subtract(1, 'day').toISOString(),
                },
              ],
            },
          ];
          const demoReservationSessions: MentoringSession[] = [
            {
              id: demoBookedSessionId,
              mentorId: 101,
              requestId: 'reservation-demo-fixed-2',
              menteeName,
              method: 'deep',
              startsAt: toIso(bookedSessionStart),
              endsAt: toIso(bookedSessionEnd),
              placeNote: 'Google Meet (링크 사전 전달)',
              status: 'SCHEDULED',
              createdAt: now.subtract(1, 'day').toISOString(),
              updatedAt: now.subtract(1, 'day').toISOString(),
            },
            {
              id: demoCompletedSessionId,
              mentorId: 101,
              requestId: 'reservation-demo-fixed-3',
              menteeName,
              method: 'offline',
              startsAt: toIso(completedSessionStart),
              endsAt: toIso(completedSessionEnd),
              placeNote: '강남역 인근 카페',
              status: 'COMPLETED',
              createdAt: now.subtract(5, 'day').toISOString(),
              updatedAt: now.subtract(3, 'day').toISOString(),
            },
            {
              id: demoNoShowSessionId,
              mentorId: 101,
              requestId: 'reservation-demo-fixed-4',
              menteeName,
              method: 'deep',
              startsAt: toIso(noShowSessionStart),
              endsAt: toIso(noShowSessionEnd),
              placeNote: 'Discord 음성 채널',
              status: 'CANCELLED',
              issueType: 'MENTEE_NO_SHOW',
              operationNote:
                '정해진 시간에 입장하지 않아 노쇼 처리되었습니다.',
              refundStatus: 'NOT_ELIGIBLE',
              refundNote:
                '정해진 시간에 미입장으로 확인되어 환불 대상이 아닙니다.',
              createdAt: now.subtract(3, 'day').toISOString(),
              updatedAt: now.subtract(1, 'day').toISOString(),
            },
          ];
          const currentMentor101Requests = state.requestsByMentor[101] ?? [];
          const nonDemoRequests = currentMentor101Requests.filter((request) => {
            return (
              !request.id.startsWith('note-demo-fixed-') &&
              !request.id.startsWith('reservation-demo-fixed-')
            );
          });
          const currentMentor101Sessions = state.sessionsByMentor[101] ?? [];
          const nonDemoSessions = currentMentor101Sessions.filter((session) => {
            return !session.id.startsWith('reservation-demo-session-');
          });
          const demoRequests = [
            ...demoReservationRequests,
            ...demoNoteRequests,
          ];
          const mergedRequests = sortRequests([...nonDemoRequests, ...demoRequests]);
          const mergedSessions = sortSessions([
            ...nonDemoSessions,
            ...demoReservationSessions,
          ]);

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              101: mergedRequests,
            },
            sessionsByMentor: {
              ...state.sessionsByMentor,
              101: mergedSessions,
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
            mentorDisplayTitle: payload.mentorDisplayTitle,
            mentorNickname: payload.mentorNickname,
            methodLabel: payload.methodLabel,
            durationLabel: payload.durationLabel,
            paymentAmount: payload.paymentAmount,
            paymentMode: payload.paymentMode,
            paymentMethod: payload.paymentMethod,
            paymentStatus: getInitialPaymentStatus(payload.paymentMode),
            paymentMemo: payload.paymentMemo?.trim() ?? '',
            menteeMemberId: payload.menteeMemberId,
            menteeName: payload.menteeName,
            menteeRole: payload.menteeRole,
            requestedAt: now,
            preferredDate: payload.preferredDate,
            preferredTime: payload.preferredTime,
            requestTitle: payload.requestTitle?.trim() || undefined,
            requestMessage: payload.requestMessage,
            requestContents: payload.requestContents,
            attachedFileNames: payload.attachedFileNames,
            referenceLinks: payload.referenceLinks,
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
        let response: MentoringStoreActionResponse = {
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
            response = { ok: false, reason: '이미 처리된 신청입니다.' };

            return state;
          }
          if (
            targetRequest.paymentMode === 'MANUAL_TRANSFER' &&
            targetRequest.paymentStatus !== 'CONFIRMED'
          ) {
            response = {
              ok: false,
              reason: '입금 확인 완료 후에만 수락할 수 있습니다.',
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
              issueType: 'NONE',
              refundStatus: 'NOT_APPLICABLE',
              createdAt: now,
              updatedAt: now,
            });
            messages.push(
              buildSystemMessage(
                `멘토가 신청을 수락하고 일정을 확정했어요. (${dayjs(schedule.startsAt).format('MM/DD HH:mm')} ~ ${dayjs(schedule.endsAt).format('HH:mm')})`,
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
          response = { ok: true, sessionId: nextLinkedSessionId };

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
          return { ok: false, reason: '거절 사유를 2자 이상 입력해주세요.' };
        }
        let response: MentoringStoreActionResponse = {
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
            response = { ok: false, reason: '이미 처리된 신청입니다.' };

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
      sendMentorMessage: ({ mentorId, requestId, content }) => {
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) {
          return { ok: false, reason: '메시지를 입력해주세요.' };
        }
        let response: MentoringStoreActionResponse = {
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
      confirmManualPayment: ({ mentorId, requestId, memo }) => {
        let response: MentoringStoreActionResponse = {
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
          if (targetRequest.paymentStatus === 'CONFIRMED') {
            response = { ok: false, reason: '이미 입금 확인된 신청입니다.' };

            return state;
          }
          if (targetRequest.status !== 'PENDING') {
            response = {
              ok: false,
              reason: '대기중 신청에서만 입금 확인 처리가 가능합니다.',
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
          return { ok: false, reason: '후기는 10자 이상 입력해주세요.' };
        }
        let response: MentoringStoreActionResponse = {
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
        let response: MentoringStoreActionResponse = {
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
            issueType: 'NONE',
            refundStatus: 'NOT_APPLICABLE',
            refundNote: undefined,
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
                `일정이 변경되었어요. (${dayjs(startsAt).format('MM/DD HH:mm')} ~ ${dayjs(endsAt).format('HH:mm')})`,
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
      cancelSession: ({
        mentorId,
        sessionId,
        reason,
        issueType = 'MENTOR_CANCELLED',
      }) => {
        const trimmedReason = reason.trim();
        if (trimmedReason.length < 2) {
          return { ok: false, reason: '취소 사유를 2자 이상 입력해주세요.' };
        }
        let response: MentoringStoreActionResponse = {
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
          const refundInfo = getRefundInfoForIssue({
            issueType,
            startsAt: targetSession.startsAt,
            now,
          });
          nextSessions[sessionIndex] = {
            ...targetSession,
            status: 'CANCELLED',
            issueType,
            operationNote: trimmedReason,
            refundStatus: refundInfo.refundStatus,
            refundNote: refundInfo.refundNote,
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
      markSessionOutcome: ({ mentorId, sessionId, outcome, note }) => {
        const trimmedNote = note?.trim();
        let response: MentoringStoreActionResponse = {
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
          const targetSession = sessions[sessionIndex];
          if (targetSession.status !== 'SCHEDULED') {
            response = {
              ok: false,
              reason: '진행 중인 일정에서만 처리할 수 있습니다.',
            };

            return state;
          }
          const now = new Date().toISOString();
          if (dayjs(now).isBefore(dayjs(targetSession.startsAt))) {
            response = {
              ok: false,
              reason: '상담 시작 전에는 완료/노쇼 처리할 수 없습니다.',
            };

            return state;
          }
          const outcomeMeta =
            outcome === 'COMPLETED'
              ? {
                  status: 'COMPLETED' as const,
                  issueType: 'NONE' as const,
                  systemMessage: '멘토가 상담 완료로 처리했어요.',
                  defaultNote: '상담이 정상 종료되었습니다.',
                }
              : outcome === 'MENTOR_NO_SHOW'
                ? {
                    status: 'CANCELLED' as const,
                    issueType: 'MENTOR_NO_SHOW' as const,
                    systemMessage: '이번 상담이 멘토 미입장으로 기록되었어요.',
                    defaultNote: '멘토 미입장으로 상담이 진행되지 않았습니다.',
                  }
                : {
                    status: 'CANCELLED' as const,
                    issueType: 'MENTEE_NO_SHOW' as const,
                    systemMessage: '이번 상담이 멘티 미입장으로 기록되었어요.',
                    defaultNote:
                      '정해진 시간에 멘티가 입장하지 않아 노쇼 처리되었습니다.',
                  };
          const finalNote = trimmedNote || outcomeMeta.defaultNote;
          const refundInfo = getRefundInfoForIssue({
            issueType: outcomeMeta.issueType,
            startsAt: targetSession.startsAt,
            now,
          });
          const nextSessions = [...sessions];
          nextSessions[sessionIndex] = {
            ...targetSession,
            status: outcomeMeta.status,
            issueType: outcomeMeta.issueType,
            operationNote: finalNote,
            refundStatus: refundInfo.refundStatus,
            refundNote: refundInfo.refundNote,
            updatedAt: now,
          };
          const requests = state.requestsByMentor[mentorId] ?? [];
          const requestIndex = requests.findIndex(
            (request) => request.id === targetSession.requestId,
          );
          const nextRequests = [...requests];
          if (requestIndex >= 0) {
            const conversationMessages = [
              buildSystemMessage(outcomeMeta.systemMessage, now),
            ];
            if (finalNote) {
              conversationMessages.push(buildMentorMessage(finalNote, now));
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
      seedMockScenario: ({ mentorId, baseMenteeMemberId }) => {
        set((state) => {
          const now = dayjs();
          const menteeBaseId = baseMenteeMemberId ?? 1000;
          const completedSessionStart = now
            .subtract(3, 'day')
            .hour(20)
            .minute(0)
            .second(0)
            .millisecond(0);
          const completedSessionEnd = completedSessionStart.add(60, 'minute');
          const upcomingSessionStart = now
            .add(2, 'day')
            .hour(21)
            .minute(0)
            .second(0)
            .millisecond(0);
          const upcomingSessionEnd = upcomingSessionStart.add(60, 'minute');
          const cancelledSessionStart = now
            .add(5, 'day')
            .hour(20)
            .minute(30)
            .second(0)
            .millisecond(0);
          const cancelledSessionEnd = cancelledSessionStart.add(15, 'minute');
          const noShowSessionStart = now
            .subtract(1, 'day')
            .hour(20)
            .minute(0)
            .second(0)
            .millisecond(0);
          const noShowSessionEnd = noShowSessionStart.add(60, 'minute');
          const upcomingSessionId = createId('session');
          const completedSessionId = createId('session');
          const cancelledSessionId = createId('session');
          const noShowSessionId = createId('session');
          const pendingNoteRequestedAt = toIso(now.subtract(1, 'day'));
          const rejectedRequestedAt = toIso(now.subtract(4, 'day'));
          const rejectedAt = toIso(now.subtract(3, 'day').hour(19));
          const acceptedUpcomingRequestedAt = toIso(now.subtract(2, 'day'));
          const acceptedUpcomingAt = toIso(now.subtract(1, 'day').hour(18));
          const acceptedCompletedRequestedAt = toIso(now.subtract(10, 'day'));
          const acceptedCompletedAt = toIso(now.subtract(9, 'day').hour(11));
          const cancelledRequestedAt = toIso(now.subtract(7, 'day'));
          const acceptedCancelledAt = toIso(now.subtract(6, 'day').hour(20));
          const cancelledAt = toIso(now.subtract(5, 'day').hour(13));
          const acceptedNoteRequestedAt = toIso(now.subtract(8, 'day'));
          const acceptedNoteAt = toIso(now.subtract(8, 'day').hour(22));
          const firstReviewAt = toIso(now.subtract(2, 'day').hour(9));
          const secondReviewAt = toIso(now.subtract(7, 'day').hour(17));
          const noShowRequestedAt = toIso(now.subtract(3, 'day'));
          const noShowAcceptedAt = toIso(now.subtract(2, 'day').hour(14));
          const noShowHandledAt = toIso(now.subtract(1, 'day').hour(22));
          const pendingRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'note',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'PENDING_TRANSFER',
            paymentMemo: '02/26 21:30 카카오뱅크 송금 예정',
            menteeMemberId: menteeBaseId + 1,
            menteeName: '이지은',
            menteeRole: '주니어 프론트엔드 개발자',
            requestedAt: pendingNoteRequestedAt,
            requestMessage:
              '현 프로젝트 경험을 이력서에 어떻게 구조화하면 좋을지 피드백 받고 싶습니다.',
            status: 'PENDING',
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '현 프로젝트 경험을 이력서에 어떻게 구조화하면 좋을지 피드백 받고 싶습니다.',
                createdAt: pendingNoteRequestedAt,
              },
            ],
          };
          const rejectedRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'simple',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'PENDING_TRANSFER',
            paymentMemo: '계좌이체 예정',
            menteeMemberId: menteeBaseId + 2,
            menteeName: '박준호',
            menteeRole: '주니어 백엔드 개발자',
            requestedAt: rejectedRequestedAt,
            preferredDate: toDate(now.add(3, 'day')),
            preferredTime: toTime(now.add(3, 'day').hour(20)),
            requestMessage:
              '15분 간편상담으로 이직 우선순위를 빠르게 점검받고 싶습니다.',
            status: 'REJECTED',
            rejectedAt,
            decisionNote:
              '현재 요청 시간대에 상담이 불가합니다. 가능한 시간대로 다시 신청해주세요.',
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '15분 간편상담으로 이직 우선순위를 빠르게 점검받고 싶습니다.',
                createdAt: rejectedRequestedAt,
              },
              buildSystemMessage('멘토가 신청을 거절했어요.', rejectedAt),
              buildMentorMessage(
                '현재 요청 시간대에 상담이 불가합니다. 가능한 시간대로 다시 신청해주세요.',
                rejectedAt,
              ),
            ],
          };
          const acceptedUpcomingRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'deep',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'CONFIRMED',
            paymentMemo: '입금 확인 완료 (카카오뱅크)',
            menteeMemberId: menteeBaseId + 3,
            menteeName: '최수민',
            menteeRole: '프로덕트 디자이너',
            requestedAt: acceptedUpcomingRequestedAt,
            preferredDate: toDate(upcomingSessionStart),
            preferredTime: toTime(upcomingSessionStart),
            requestMessage:
              '포트폴리오 케이스 스터디 흐름과 발표 스크립트 점검을 받고 싶어요.',
            status: 'ACCEPTED',
            acceptedAt: acceptedUpcomingAt,
            decisionNote: '사전 질문 정리 후 화면 공유로 진행하겠습니다.',
            linkedSessionId: upcomingSessionId,
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '포트폴리오 케이스 스터디 흐름과 발표 스크립트 점검을 받고 싶어요.',
                createdAt: acceptedUpcomingRequestedAt,
              },
              buildSystemMessage(
                `멘토가 신청을 수락하고 일정을 확정했어요. (${dayjs(upcomingSessionStart).format('MM/DD HH:mm')} ~ ${dayjs(upcomingSessionEnd).format('HH:mm')})`,
                acceptedUpcomingAt,
              ),
              buildMentorMessage(
                '사전 질문 정리 후 화면 공유로 진행하겠습니다.',
                acceptedUpcomingAt,
              ),
              buildSystemMessage(
                '멘토가 입금 상태를 확인했어요.',
                toIso(now.subtract(1, 'day').hour(19)),
              ),
            ],
          };
          const acceptedCompletedRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'offline',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'CONFIRMED',
            paymentMemo: '현장 미팅 전일 입금 완료',
            menteeMemberId: menteeBaseId + 4,
            menteeName: '김다연',
            menteeRole: '주니어 PM',
            requestedAt: acceptedCompletedRequestedAt,
            preferredDate: toDate(completedSessionStart),
            preferredTime: toTime(completedSessionStart),
            requestMessage:
              '서비스 기획 포트폴리오의 문제정의/성과지표 구조를 리뷰받고 싶습니다.',
            status: 'ACCEPTED',
            acceptedAt: acceptedCompletedAt,
            decisionNote: '강남역 인근에서 대면으로 진행하겠습니다.',
            linkedSessionId: completedSessionId,
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '서비스 기획 포트폴리오의 문제정의/성과지표 구조를 리뷰받고 싶습니다.',
                createdAt: acceptedCompletedRequestedAt,
              },
              buildSystemMessage(
                `멘토가 신청을 수락하고 일정을 확정했어요. (${dayjs(completedSessionStart).format('MM/DD HH:mm')} ~ ${dayjs(completedSessionEnd).format('HH:mm')})`,
                acceptedCompletedAt,
              ),
              buildMentorMessage(
                '강남역 인근에서 대면으로 진행하겠습니다.',
                acceptedCompletedAt,
              ),
              buildSystemMessage(
                '멘티가 멘토링 후기를 남겼어요.',
                firstReviewAt,
              ),
            ],
          };
          const acceptedCancelledRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'simple',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'CONFIRMED',
            paymentMemo: '입금 확인 완료',
            menteeMemberId: menteeBaseId + 5,
            menteeName: '오민규',
            menteeRole: '안드로이드 개발자',
            requestedAt: cancelledRequestedAt,
            preferredDate: toDate(cancelledSessionStart),
            preferredTime: toTime(cancelledSessionStart),
            requestMessage:
              '이직 시점과 기술스택 선택 관련 단기 상담을 요청드립니다.',
            status: 'ACCEPTED',
            acceptedAt: acceptedCancelledAt,
            decisionNote: '요청 주제 기준으로 핵심만 빠르게 정리해드릴게요.',
            linkedSessionId: cancelledSessionId,
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '이직 시점과 기술스택 선택 관련 단기 상담을 요청드립니다.',
                createdAt: cancelledRequestedAt,
              },
              buildSystemMessage(
                `멘토가 신청을 수락하고 일정을 확정했어요. (${dayjs(cancelledSessionStart).format('MM/DD HH:mm')} ~ ${dayjs(cancelledSessionEnd).format('HH:mm')})`,
                acceptedCancelledAt,
              ),
              buildMentorMessage(
                '요청 주제 기준으로 핵심만 빠르게 정리해드릴게요.',
                acceptedCancelledAt,
              ),
              buildSystemMessage('확정된 일정이 취소되었어요.', cancelledAt),
              buildMentorMessage(
                '멘토 사정으로 일정 조정이 필요하여 이번 건은 취소 처리했습니다.',
                cancelledAt,
              ),
            ],
          };
          const acceptedNoteRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'note',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'CONFIRMED',
            paymentMemo: '입금 확인 완료',
            menteeMemberId: menteeBaseId + 6,
            menteeName: '정하린',
            menteeRole: '취업 준비생',
            requestedAt: acceptedNoteRequestedAt,
            requestMessage:
              '주니어 백엔드 포지션 지원서에 어떤 프로젝트를 우선 배치하면 좋을까요?',
            status: 'ACCEPTED',
            acceptedAt: acceptedNoteAt,
            decisionNote:
              '작성하신 이력서를 기준으로 수정 우선순위와 문장 템플릿을 전달드렸습니다.',
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '주니어 백엔드 포지션 지원서에 어떤 프로젝트를 우선 배치하면 좋을까요?',
                createdAt: acceptedNoteRequestedAt,
              },
              buildSystemMessage('멘토가 신청을 수락했어요.', acceptedNoteAt),
              buildMentorMessage(
                '작성하신 이력서를 기준으로 수정 우선순위와 문장 템플릿을 전달드렸습니다.',
                acceptedNoteAt,
              ),
              buildSystemMessage(
                '멘티가 멘토링 후기를 남겼어요.',
                secondReviewAt,
              ),
            ],
          };
          const acceptedNoShowRequest: MentoringRequest = {
            id: createId('request'),
            mentorId,
            method: 'deep',
            paymentMode: 'MANUAL_TRANSFER',
            paymentStatus: 'CONFIRMED',
            paymentMemo: '입금 확인 완료',
            menteeMemberId: menteeBaseId + 7,
            menteeName: '한예진',
            menteeRole: '주니어 iOS 개발자',
            requestedAt: noShowRequestedAt,
            preferredDate: toDate(noShowSessionStart),
            preferredTime: toTime(noShowSessionStart),
            requestMessage:
              '기술 면접 대비 답변 구조와 경력기술서 표현을 함께 점검받고 싶습니다.',
            status: 'ACCEPTED',
            acceptedAt: noShowAcceptedAt,
            decisionNote:
              '면접 질문 리스트 중심으로 1시간 동안 같이 점검하겠습니다.',
            linkedSessionId: noShowSessionId,
            conversation: [
              {
                id: createId('msg'),
                sender: 'MENTEE',
                content:
                  '기술 면접 대비 답변 구조와 경력기술서 표현을 함께 점검받고 싶습니다.',
                createdAt: noShowRequestedAt,
              },
              buildSystemMessage(
                `멘토가 신청을 수락하고 일정을 확정했어요. (${dayjs(noShowSessionStart).format('MM/DD HH:mm')} ~ ${dayjs(noShowSessionEnd).format('HH:mm')})`,
                noShowAcceptedAt,
              ),
              buildMentorMessage(
                '면접 질문 리스트 중심으로 1시간 동안 같이 점검하겠습니다.',
                noShowAcceptedAt,
              ),
              buildSystemMessage(
                '이번 상담이 멘티 미입장으로 기록되었어요.',
                noShowHandledAt,
              ),
              buildMentorMessage(
                '정해진 시간에 입장하지 않아 노쇼로 처리했습니다.',
                noShowHandledAt,
              ),
            ],
          };
          const requests = [
            pendingRequest,
            rejectedRequest,
            acceptedUpcomingRequest,
            acceptedCompletedRequest,
            acceptedCancelledRequest,
            acceptedNoteRequest,
            acceptedNoShowRequest,
          ];
          const sessions: MentoringSession[] = [
            {
              id: upcomingSessionId,
              mentorId,
              requestId: acceptedUpcomingRequest.id,
              menteeName: acceptedUpcomingRequest.menteeName,
              method: acceptedUpcomingRequest.method,
              startsAt: toIso(upcomingSessionStart),
              endsAt: toIso(upcomingSessionEnd),
              placeNote: 'Google Meet (링크 사전 전달)',
              status: 'SCHEDULED',
              createdAt: acceptedUpcomingAt,
              updatedAt: acceptedUpcomingAt,
            },
            {
              id: completedSessionId,
              mentorId,
              requestId: acceptedCompletedRequest.id,
              menteeName: acceptedCompletedRequest.menteeName,
              method: acceptedCompletedRequest.method,
              startsAt: toIso(completedSessionStart),
              endsAt: toIso(completedSessionEnd),
              placeNote: '강남역 인근 카페 미팅',
              status: 'COMPLETED',
              createdAt: acceptedCompletedAt,
              updatedAt: firstReviewAt,
            },
            {
              id: cancelledSessionId,
              mentorId,
              requestId: acceptedCancelledRequest.id,
              menteeName: acceptedCancelledRequest.menteeName,
              method: acceptedCancelledRequest.method,
              startsAt: toIso(cancelledSessionStart),
              endsAt: toIso(cancelledSessionEnd),
              placeNote: '온라인 링크 전달 예정 (간편상담)',
              status: 'CANCELLED',
              issueType: 'MENTOR_CANCELLED',
              operationNote:
                '멘토 사정으로 일정 조정이 필요하여 이번 건은 취소 처리했습니다.',
              refundStatus: 'PENDING',
              refundNote: '멘토 사정으로 전액 환불이 진행될 예정입니다.',
              createdAt: acceptedCancelledAt,
              updatedAt: cancelledAt,
            },
            {
              id: noShowSessionId,
              mentorId,
              requestId: acceptedNoShowRequest.id,
              menteeName: acceptedNoShowRequest.menteeName,
              method: acceptedNoShowRequest.method,
              startsAt: toIso(noShowSessionStart),
              endsAt: toIso(noShowSessionEnd),
              placeNote: 'Discord 음성 채널',
              status: 'CANCELLED',
              issueType: 'MENTEE_NO_SHOW',
              operationNote: '정해진 시간에 입장하지 않아 노쇼로 처리했습니다.',
              refundStatus: 'NOT_ELIGIBLE',
              refundNote:
                '정해진 시간에 미입장으로 확인되어 환불 대상이 아닙니다.',
              createdAt: noShowAcceptedAt,
              updatedAt: noShowHandledAt,
            },
          ];
          const reviews: MentoringReview[] = [
            {
              id: createId('review'),
              mentorId,
              requestId: acceptedCompletedRequest.id,
              sessionId: completedSessionId,
              menteeMemberId: acceptedCompletedRequest.menteeMemberId ?? 0,
              menteeName: acceptedCompletedRequest.menteeName,
              method: acceptedCompletedRequest.method,
              rating: 5,
              recommendation: 'RECOMMEND',
              content:
                '포트폴리오의 문제정의와 성과 수치화 포인트를 구체적으로 잡아주셔서 바로 수정에 반영했습니다.',
              createdAt: firstReviewAt,
              updatedAt: firstReviewAt,
            },
            {
              id: createId('review'),
              mentorId,
              requestId: acceptedNoteRequest.id,
              menteeMemberId: acceptedNoteRequest.menteeMemberId ?? 0,
              menteeName: acceptedNoteRequest.menteeName,
              method: acceptedNoteRequest.method,
              rating: 5,
              recommendation: 'RECOMMEND',
              content:
                '이력서 문장 템플릿을 직무 중심으로 바꿔주셔서 지원서 완성도가 크게 올라갔습니다.',
              createdAt: secondReviewAt,
              updatedAt: secondReviewAt,
            },
          ];

          return {
            requestsByMentor: {
              ...state.requestsByMentor,
              [mentorId]: sortRequests(requests),
            },
            sessionsByMentor: {
              ...state.sessionsByMentor,
              [mentorId]: sortSessions(sessions.map(normalizeSession)),
            },
            reviewsByMentor: {
              ...state.reviewsByMentor,
              [mentorId]: sortReviews(reviews),
            },
          };
        });
      },
      reset: () => {
        set({ ...INITIAL_STATE, hasHydrated: true });
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'mentoring-management-storage',
      version: 4,
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
              return [
                Number(mentorId),
                sortSessions((sessions ?? []).map(normalizeSession)),
              ];
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
