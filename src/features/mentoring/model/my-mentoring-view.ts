import dayjs from 'dayjs';
import { getMentoringSessionGuide } from '@/features/mentoring/model/mentoring-channel-guide';
import {
  MENTORING_REFUND_STATUS_META,
  MENTORING_SESSION_ISSUE_META,
} from '@/features/mentoring/model/management-status-meta';
import { formatWon } from '@/features/mentoring/model/mentor-profile-utils';
import { getMyMentoringPrimaryActionMeta } from '@/features/mentoring/model/my-mentoring-display-meta';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type {
  ConversationSender,
  MentoringPaymentMethod,
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import type {
  MyMentoringItem,
  MyMentoringMethod,
  MyNoteConsultationItem,
  MyNoteConsultationSummary,
  MyMentoringStatus,
} from '@/types/mentoring/my-mentoring';
const REQUEST_PREVIEW_MAX_LENGTH = 80;
const MY_MENTORING_METHOD_MAP: Partial<
  Record<MentoringMethodType, MyMentoringMethod>
> = { simple: 'CALL', deep: 'ONLINE', offline: 'OFFLINE' };
const PAYMENT_METHOD_LABEL_MAP: Record<MentoringPaymentMethod, string> = {
  CARD: '카드 결제',
  VIRTUAL_ACCOUNT: '가상계좌',
  MANUAL_TRANSFER: '수동 계좌이체',
};
const STATUS_ORDER: Record<MyMentoringStatus, number> = {
  REQUESTED: 0,
  PENDING: 1,
  CONFIRMED: 2,
  COMPLETED: 3,
  NO_SHOW: 4,
  CANCELLED: 5,
  REJECTED: 6,
};
const toRequestPreview = (requestMessage: string) => {
  const normalized = requestMessage.replace(/\s+/g, ' ').trim();
  if (normalized.length <= REQUEST_PREVIEW_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, REQUEST_PREVIEW_MAX_LENGTH).trimEnd()}...`;
};
const toDateLabel = (value: string) => {
  return dayjs(value).format('YYYY.MM.DD');
};
const toPendingWindow = (request: MentoringRequest) => {
  if (!request.preferredDate) {
    return undefined;
  }
  if (!request.preferredTime) {
    return toDateLabel(request.preferredDate);
  }

  return `${toDateLabel(request.preferredDate)} ${request.preferredTime}`;
};
const toMentoringTime = (session: MentoringSession) => {
  return `${dayjs(session.startsAt).format('YYYY.MM.DD HH:mm')} - ${dayjs(session.endsAt).format('HH:mm')}`;
};
const toSessionGuide = (session?: MentoringSession) => {
  if (!session) {
    return undefined;
  }

  return getMentoringSessionGuide({
    method: session.method,
    placeNote: session.placeNote,
  });
};
const toPaymentMethodLabel = (request: MentoringRequest) => {
  const paymentMethod =
    request.paymentMethod ??
    (request.paymentMode === 'MANUAL_TRANSFER' ? 'MANUAL_TRANSFER' : 'CARD');

  return PAYMENT_METHOD_LABEL_MAP[paymentMethod];
};

const isNoteClosed = (request: MentoringRequest) => {
  return (
    request.status === 'CLOSED' || request.displayStatus === 'COMPLETED'
  );
};
const hasMentorFirstReply = (request: MentoringRequest) => {
  return request.conversation.some((message) => message.sender === 'MENTOR');
};
const getLastConversationSender = (request: MentoringRequest) => {
  return [...request.conversation]
    .filter((message) => message.sender !== 'SYSTEM')
    .at(-1)?.sender;
};
const toLastConversationValue = (request: MentoringRequest) => {
  return [...request.conversation]
    .filter((message) => message.sender !== 'SYSTEM')
    .at(-1)?.createdAt;
};
const toConversationSortValue = (request: MentoringRequest) => {
  return dayjs(
    toLastConversationValue(request) ?? request.requestedAt,
  ).valueOf();
};
const toPaymentStatusMeta = (request: MentoringRequest) => {
  if (request.paymentStatus === 'CONFIRMED') {
    return { label: '결제 완료', color: 'green' as const };
  }
  if (request.paymentStatus === 'NOT_REQUIRED') {
    return { label: '결제 없음', color: 'gray' as const };
  }

  return {
    label:
      request.paymentStatus === 'PENDING_TRANSFER'
        ? '입금 확인 대기'
        : '결제 대기',
    color: 'orange' as const,
  };
};
const toNoteStatusMeta = (request: MentoringRequest) => {
  if (request.status === 'REJECTED') {
    return { label: '신청 거절', color: 'red' as const };
  }
  if (isNoteClosed(request)) {
    return { label: '상담 종료', color: 'blue' as const };
  }
  if (request.status !== 'ACCEPTED') {
    return { label: '멘토 확인 대기', color: 'orange' as const };
  }
  if (!hasMentorFirstReply(request)) {
    return { label: '첫 답변 대기', color: 'blue' as const };
  }

  return { label: '답변 확인 필요', color: 'blue' as const };
};
const toPaymentAmountLabel = (
  request: MentoringRequest,
  mentorMap: Map<number, MentorProfile>,
) => {
  if (typeof request.paymentAmount === 'number') {
    return formatWon(request.paymentAmount);
  }
  const mentor = mentorMap.get(request.mentorId);
  const amount = mentor?.methods[request.method]?.price;

  return typeof amount === 'number' ? formatWon(amount) : '-';
};
const toMyMentoringStatus = ({
  request,
  session,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
}): MyMentoringStatus | undefined => {
  if (request.displayStatus === 'REQUESTED') {
    return 'REQUESTED';
  }
  if (request.displayStatus === 'PENDING' || request.displayStatus === 'NOTE_WAITING') {
    return 'PENDING';
  }
  if (request.displayStatus === 'CONFIRMED') {
    return 'CONFIRMED';
  }
  if (request.displayStatus === 'COMPLETED') {
    return 'COMPLETED';
  }
  if (request.displayStatus === 'REJECTED') {
    return 'REJECTED';
  }
  if (request.displayStatus === 'CANCELLED') {
    return 'CANCELLED';
  }
  if (request.displayStatus === 'NO_SHOW') {
    return 'NO_SHOW';
  }
  if (request.status === 'REJECTED') {
    return 'REJECTED';
  }
  if (request.status === 'CLOSED') {
    return 'COMPLETED';
  }
  if (
    session?.issueType === 'MENTEE_NO_SHOW' ||
    session?.issueType === 'MENTOR_NO_SHOW'
  ) {
    return 'NO_SHOW';
  }
  if (session?.status === 'CANCELLED') {
    return 'CANCELLED';
  }
  if (
    session &&
    (session.status === 'COMPLETED' || dayjs(session.endsAt).isBefore(dayjs()))
  ) {
    return 'COMPLETED';
  }
  if (request.status === 'PENDING') {
    return 'REQUESTED';
  }

  return session ? 'CONFIRMED' : 'PENDING';
};
const toMentorName = (
  request: MentoringRequest,
  mentorMap: Map<number, MentorProfile>,
) => {
  if (request.mentorNickname?.trim()) {
    return request.mentorNickname.trim();
  }
  const mentor = mentorMap.get(request.mentorId);

  return mentor?.nickname ?? `멘토 #${request.mentorId}`;
};
const getLastMessageBySender = (
  request: MentoringRequest,
  sender: ConversationSender,
) => {
  return [...request.conversation]
    .reverse()
    .find((message) => message.sender === sender);
};
const toLastConversationPreview = (request: MentoringRequest) => {
  const lastMessage = [...request.conversation]
    .filter((message) => message.sender !== 'SYSTEM')
    .at(-1);
  if (lastMessage?.content?.trim()) {
    const prefix = lastMessage.sender === 'MENTOR' ? '멘토 답변' : '내 질문';

    return `${prefix}: ${toRequestPreview(lastMessage.content)}`;
  }

  return toRequestPreview(request.requestMessage);
};
const toStatusReason = ({
  request,
  session,
  status,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
  status: MyMentoringStatus;
}) => {
  if (status === 'REJECTED') {
    return (
      request.decisionNote?.trim() ||
      getLastMessageBySender(request, 'MENTOR')?.content ||
      '멘토가 이번 신청을 진행하기 어렵다고 안내했습니다.'
    );
  }
  if (status === 'CANCELLED') {
    return (
      session?.operationNote?.trim() ||
      getLastMessageBySender(request, 'MENTOR')?.content ||
      '확정된 일정이 취소되었습니다.'
    );
  }
  if (status === 'NO_SHOW') {
    if (session?.operationNote?.trim()) {
      return session.operationNote.trim();
    }
    if (session?.issueType === 'MENTOR_NO_SHOW') {
      return '멘토 미입장으로 상담이 진행되지 않았습니다.';
    }

    return '정해진 시간에 미입장으로 노쇼 처리되었습니다.';
  }
  if (status === 'COMPLETED') {
    if (session?.operationNote?.trim()) {
      return session.operationNote.trim();
    }
    if (session?.status === 'COMPLETED') {
      return '상담이 완료된 내역입니다.';
    }

    return '상담 시간이 종료된 내역입니다.';
  }

  return undefined;
};
const toHistoryDateLabel = ({
  request,
  session,
  status,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
  status: MyMentoringStatus;
}) => {
  if (status === 'REJECTED') {
    return `거절일 ${toDateLabel(request.rejectedAt ?? request.requestedAt)}`;
  }
  if (status === 'CANCELLED' && session) {
    return `취소일 ${toDateLabel(session.updatedAt)}`;
  }
  if (status === 'NO_SHOW' && session) {
    return `처리일 ${toDateLabel(session.updatedAt)}`;
  }
  if (status === 'COMPLETED' && session) {
    return `종료일 ${toDateLabel(session.endsAt)}`;
  }

  return undefined;
};
const toSortValue = ({
  request,
  session,
  status,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
  status: MyMentoringStatus;
}) => {
  if (status === 'CONFIRMED' && session) {
    return dayjs(session.startsAt).valueOf();
  }
  if (status === 'COMPLETED' && session) {
    return dayjs(session.endsAt).valueOf();
  }
  if (status === 'CANCELLED' && session) {
    return dayjs(session.updatedAt).valueOf();
  }
  if (status === 'NO_SHOW' && session) {
    return dayjs(session.updatedAt).valueOf();
  }
  if (status === 'REJECTED' && request.rejectedAt) {
    return dayjs(request.rejectedAt).valueOf();
  }
  if (request.acceptedAt) {
    return dayjs(request.acceptedAt).valueOf();
  }

  return dayjs(request.requestedAt).valueOf();
};
const toIssueMeta = ({
  session,
  status,
}: {
  session?: MentoringSession;
  status: MyMentoringStatus;
}) => {
  if (!session?.issueType || session.issueType === 'NONE') {
    return undefined;
  }
  if (status !== 'CANCELLED' && status !== 'NO_SHOW') {
    return undefined;
  }

  return MENTORING_SESSION_ISSUE_META[session.issueType];
};
const toRefundMeta = (session?: MentoringSession) => {
  const refundStatus = session?.refundStatus;
  if (!refundStatus || refundStatus === 'NOT_APPLICABLE') {
    return undefined;
  }

  return MENTORING_REFUND_STATUS_META[refundStatus];
};
const toDetailHref = (requestId: string) => {
  return `/my-mentoring/${requestId}`;
};
export const buildMyMentoringItem = ({
  request,
  session,
  mentorMap,
}: {
  request: MentoringRequest;
  session?: MentoringSession;
  mentorMap: Map<number, MentorProfile>;
}): MyMentoringItem | undefined => {
  const method = MY_MENTORING_METHOD_MAP[request.method];
  const status = toMyMentoringStatus({ request, session });
  if (!method || !status) {
    return undefined;
  }
  const paymentMeta = toPaymentStatusMeta(request);
  const issueMeta = toIssueMeta({ session, status });
  const refundMeta = toRefundMeta(session);
  const nextActionMeta = getMyMentoringPrimaryActionMeta({
    status,
    refundStatus: session?.refundStatus,
    mentorId: request.mentorId,
    method,
  });

  return {
    id: request.id,
    mentorId: request.mentorId,
    title: toRequestPreview(request.requestMessage),
    mentorName: toMentorName(request, mentorMap),
    mentorImageUrl: mentorMap.get(request.mentorId)?.imageUrl,
    method,
    status,
    detailHref: toDetailHref(request.id),
    requestedAtValue: request.requestedAt,
    sortValue: toSortValue({ request, session, status }),
    mentoringTime: session ? toMentoringTime(session) : undefined,
    preferredWindow: toPendingWindow(request),
    requestedAt: toDateLabel(request.requestedAt),
    pendingWindow: session ? undefined : toPendingWindow(request),
    sessionGuide: toSessionGuide(session),
    description: request.requestMessage,
    statusReason: toStatusReason({ request, session, status }),
    historyDateLabel: toHistoryDateLabel({ request, session, status }),
    paymentMethodLabel: toPaymentMethodLabel(request),
    paymentAmountLabel: toPaymentAmountLabel(request, mentorMap),
    paymentStatusLabel: paymentMeta.label,
    paymentStatusTone: paymentMeta.color,
    issueType: session?.issueType,
    issueStatusLabel: issueMeta?.label,
    issueStatusTone: issueMeta?.color,
    refundStatus: session?.refundStatus,
    refundStatusLabel: refundMeta?.label,
    refundStatusTone: refundMeta?.color,
    refundNote: session?.refundNote,
    nextActionLabel: nextActionMeta.label,
    nextActionHref: nextActionMeta.href,
  };
};
export const createMentorMap = (mentors: MentorProfile[]) => {
  return new Map<number, MentorProfile>(
    mentors.map((mentor) => [mentor.id, mentor]),
  );
};
export const buildMyMentoringItems = ({
  memberId,
  requestsByMentor,
  sessionsByMentor,
  mentorMap,
}: {
  memberId?: number;
  requestsByMentor: Record<number, MentoringRequest[]>;
  sessionsByMentor: Record<number, MentoringSession[]>;
  mentorMap: Map<number, MentorProfile>;
}): MyMentoringItem[] => {
  if (!memberId) {
    return [];
  }

  return Object.entries(requestsByMentor)
    .flatMap(([mentorIdKey, requests]) => {
      const mentorId = Number(mentorIdKey);
      const sessions = sessionsByMentor[mentorId] ?? [];

      return requests
        .filter((request) => request.menteeMemberId === memberId)
        .map((request) => {
          const session = request.linkedSessionId
            ? sessions.find((item) => item.id === request.linkedSessionId)
            : undefined;

          return buildMyMentoringItem({ request, session, mentorMap });
        })
        .filter((item): item is MyMentoringItem => item !== undefined);
    })
    .sort((first, second) => {
      if (first.status !== second.status) {
        return STATUS_ORDER[first.status] - STATUS_ORDER[second.status];
      }
      if (first.status === 'CONFIRMED') {
        return first.sortValue - second.sortValue;
      }

      return second.sortValue - first.sortValue;
    });
};
export const buildMyNoteConsultationSummary = ({
  memberId,
  requestsByMentor,
}: {
  memberId?: number;
  requestsByMentor: Record<number, MentoringRequest[]>;
}): MyNoteConsultationSummary | undefined => {
  if (!memberId) {
    return undefined;
  }
  const noteRequests = Object.values(requestsByMentor)
    .flat()
    .filter((request) => {
      return request.method === 'note' && request.menteeMemberId === memberId;
    });
  if (noteRequests.length === 0) {
    return undefined;
  }
  const waitingRequests = noteRequests
    .filter((request) => {
      if (request.status === 'REJECTED') {
        return false;
      }
      if (isNoteClosed(request)) {
        return false;
      }
      if (request.status !== 'ACCEPTED') {
        return true;
      }
      if (!hasMentorFirstReply(request)) {
        return true;
      }
      return false;
    })
    .sort((first, second) => {
      return (
        dayjs(toLastConversationValue(second) ?? second.requestedAt).valueOf() -
        dayjs(toLastConversationValue(first) ?? first.requestedAt).valueOf()
      );
    });
  const actionableRequests = noteRequests
    .filter((request) => {
      return (
        request.status === 'ACCEPTED' &&
        !isNoteClosed(request) &&
        hasMentorFirstReply(request)
      );
    })
    .sort((first, second) => {
      return (
        dayjs(toLastConversationValue(second) ?? second.requestedAt).valueOf() -
        dayjs(toLastConversationValue(first) ?? first.requestedAt).valueOf()
      );
    });

  return {
    totalCount: noteRequests.length,
    waitingCount: waitingRequests.length,
    actionableCount: actionableRequests.length,
    waitingHref: waitingRequests[0]
      ? `/note-consultation?channel=sent&requestId=${waitingRequests[0].id}`
      : undefined,
    actionableHref: actionableRequests[0]
      ? `/note-consultation?channel=sent&requestId=${actionableRequests[0].id}`
      : undefined,
  };
};
export const buildMyNoteConsultationItems = ({
  memberId,
  requestsByMentor,
  mentorMap,
}: {
  memberId?: number;
  requestsByMentor: Record<number, MentoringRequest[]>;
  mentorMap: Map<number, MentorProfile>;
}): MyNoteConsultationItem[] => {
  if (!memberId) {
    return [];
  }

  return Object.values(requestsByMentor)
    .flat()
    .filter((request) => {
      return request.method === 'note' && request.menteeMemberId === memberId;
    })
    .map((request) => {
      const mentor = mentorMap.get(request.mentorId);
      const statusMeta = toNoteStatusMeta(request);
      const paymentMeta = toPaymentStatusMeta(request);

      return {
        id: request.id,
        mentorName: toMentorName(request, mentorMap),
        roleLabel: mentor?.role?.trim() || '멘토',
        requestedAt: dayjs(request.requestedAt).format('YYYY.MM.DD HH:mm'),
        lastMessage: toLastConversationPreview(request),
        statusLabel: statusMeta.label,
        statusTone: statusMeta.color,
        paymentStatusLabel: paymentMeta.label,
        paymentStatusTone: paymentMeta.color,
        href: `/note-consultation?channel=sent&requestId=${request.id}`,
        sortValue: toConversationSortValue(request),
      };
    })
    .sort((first, second) => {
      return second.sortValue - first.sortValue;
    })
    .map(({ sortValue: _sortValue, ...item }) => item);
};
