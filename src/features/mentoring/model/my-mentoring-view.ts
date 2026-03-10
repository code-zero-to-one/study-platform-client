import dayjs from 'dayjs';
import { formatWon } from '@/features/mentoring/model/mentor-profile-utils';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';
import type {
  MentoringPaymentMethod,
  MentoringRequest,
  MentoringSession,
} from '@/types/mentoring/management-domain';
import type {
  MyMentoringItem,
  MyMentoringMethod,
  MyMentoringStatus,
} from '@/types/mentoring/my-mentoring';

const REQUEST_PREVIEW_MAX_LENGTH = 80;

const MY_MENTORING_METHOD_MAP: Partial<
  Record<MentoringMethodType, MyMentoringMethod>
> = {
  simple: 'CALL',
  deep: 'ONLINE',
  offline: 'OFFLINE',
};

const PAYMENT_METHOD_LABEL_MAP: Record<MentoringPaymentMethod, string> = {
  CARD: '카드 결제',
  VIRTUAL_ACCOUNT: '가상계좌',
  MANUAL_TRANSFER: '수동 계좌이체',
};

const toRequestPreview = (requestMessage: string) => {
  const normalized = requestMessage.replace(/\s+/g, ' ').trim();
  if (normalized.length <= REQUEST_PREVIEW_MAX_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, REQUEST_PREVIEW_MAX_LENGTH).trimEnd()}...`;
};

const toPendingWindow = (request: MentoringRequest) => {
  if (!request.preferredDate) {
    return undefined;
  }

  if (!request.preferredTime) {
    return dayjs(request.preferredDate).format('YYYY.MM.DD');
  }

  return `${dayjs(request.preferredDate).format('YYYY.MM.DD')} ${request.preferredTime}`;
};

const toMentoringTime = (session: MentoringSession) => {
  return `${dayjs(session.startsAt).format('YYYY.MM.DD HH:mm')} - ${dayjs(session.endsAt).format('HH:mm')}`;
};

const toPaymentMethodLabel = (request: MentoringRequest) => {
  const paymentMethod =
    request.paymentMethod ??
    (request.paymentMode === 'MANUAL_TRANSFER' ? 'MANUAL_TRANSFER' : 'CARD');

  return PAYMENT_METHOD_LABEL_MAP[paymentMethod];
};

const toPaymentStatusMeta = (request: MentoringRequest) => {
  if (request.paymentStatus === 'CONFIRMED') {
    return {
      label: '결제 완료',
      color: 'green' as const,
    };
  }

  return {
    label:
      request.paymentStatus === 'PENDING_TRANSFER'
        ? '입금 확인 대기'
        : '결제 대기',
    color: 'orange' as const,
  };
};

const toPaymentAmountLabel = (
  request: MentoringRequest,
  mentorMap: Map<number, MentorProfile>,
) => {
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
  if (request.status === 'REJECTED') {
    return undefined;
  }

  if (request.status === 'PENDING') {
    return 'REQUESTED';
  }

  if (session?.status === 'CANCELLED') {
    return undefined;
  }

  if (session && dayjs(session.endsAt).isBefore(dayjs())) {
    return undefined;
  }

  return session ? 'CONFIRMED' : 'PENDING';
};

const toMentorName = (
  mentorId: number,
  mentorMap: Map<number, MentorProfile>,
) => {
  const mentor = mentorMap.get(mentorId);

  return mentor?.nickname ?? `멘토 #${mentorId}`;
};

const toMyMentoringItem = ({
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

  return {
    id: request.id,
    title: toRequestPreview(request.requestMessage),
    mentorName: toMentorName(request.mentorId, mentorMap),
    method,
    status,
    mentoringTime: session ? toMentoringTime(session) : undefined,
    requestedAt: dayjs(request.requestedAt).format('YYYY.MM.DD'),
    pendingWindow: session ? undefined : toPendingWindow(request),
    description: request.requestMessage,
    paymentMethodLabel: toPaymentMethodLabel(request),
    paymentAmountLabel: toPaymentAmountLabel(request, mentorMap),
    paymentStatusLabel: paymentMeta.label,
    paymentStatusTone: paymentMeta.color,
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

          return toMyMentoringItem({
            request,
            session,
            mentorMap,
          });
        })
        .filter((item): item is MyMentoringItem => item !== undefined);
    })
    .sort((first, second) => {
      if (first.status !== second.status) {
        return first.status === 'CONFIRMED' ? -1 : 1;
      }

      return (
        dayjs(second.requestedAt).valueOf() - dayjs(first.requestedAt).valueOf()
      );
    });
};
