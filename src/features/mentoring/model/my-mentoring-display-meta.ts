import type {
  MyMentoringItem,
  MyMentoringMethod,
  MyMentoringStatus,
} from '@/types/mentoring/my-mentoring';

type MyMentoringBadgeColor = 'green' | 'orange' | 'blue' | 'red';

export const MENTORING_NOTE_LABEL = '쪽지상담';
export const MENTORING_BROWSE_MENTORS_LABEL = '멘토 둘러보기';
export const MENTORING_VIEW_MENTOR_PROFILE_LABEL = '멘토 프로필 보기';
export const MENTORING_REAPPLY_SAME_METHOD_LABEL = '같은 방식으로 다시 신청';
export const MENTORING_OPEN_NOTIFICATIONS_LABEL = '알림함 보기';
export const MENTORING_REVIEW_MANAGEMENT_LABEL = '후기 관리로 이동';
export const MENTORING_SESSION_GUIDE_LABEL = '진행 채널 · 장소';

export const MY_MENTORING_METHOD_LABEL_MAP: Record<MyMentoringMethod, string> =
  {
    ONLINE: '심층상담',
    OFFLINE: '대면상담',
    CALL: '간편상담',
  };

export const MY_MENTORING_STATUS_META: Record<
  MyMentoringStatus,
  { label: string; color: MyMentoringBadgeColor }
> = {
  REQUESTED: { label: '멘토 확인 대기', color: 'orange' },
  PENDING: { label: '일정 조율 중', color: 'orange' },
  CONFIRMED: { label: '일정 확정', color: 'green' },
  COMPLETED: { label: '상담 완료', color: 'blue' },
  NO_SHOW: { label: '노쇼 처리', color: 'red' },
  CANCELLED: { label: '일정 취소', color: 'red' },
  REJECTED: { label: '신청 거절', color: 'red' },
};

export const getMyMentoringReapplyHref = (
  mentoring: Pick<MyMentoringItem, 'method' | 'mentorId'>,
) => {
  const type =
    mentoring.method === 'ONLINE'
      ? 'deep'
      : mentoring.method === 'OFFLINE'
        ? 'offline'
        : 'simple';

  return `/mentoring/${mentoring.mentorId}/apply?type=${type}`;
};

export const getMyMentoringMentorProfileHref = (
  mentoring: Pick<MyMentoringItem, 'mentorId'>,
) => {
  return `/mentoring/${mentoring.mentorId}`;
};

export const getMyMentoringPrimaryActionMeta = (
  mentoring: Pick<
    MyMentoringItem,
    'status' | 'refundStatus' | 'mentorId' | 'method'
  >,
) => {
  if (
    mentoring.status === 'REQUESTED' ||
    mentoring.status === 'PENDING' ||
    mentoring.status === 'CONFIRMED'
  ) {
    return {
      label: MENTORING_OPEN_NOTIFICATIONS_LABEL,
      href: '/notification',
    };
  }

  if (mentoring.status === 'COMPLETED') {
    return {
      label: MENTORING_REVIEW_MANAGEMENT_LABEL,
      href: '/my-study-review',
    };
  }

  if (mentoring.status === 'NO_SHOW' || mentoring.status === 'CANCELLED') {
    if (mentoring.refundStatus === 'PENDING') {
      return {
        label: MENTORING_OPEN_NOTIFICATIONS_LABEL,
        href: '/notification',
      };
    }

    return {
      label: MENTORING_REAPPLY_SAME_METHOD_LABEL,
      href: getMyMentoringReapplyHref(mentoring),
    };
  }

  return {
    label: MENTORING_BROWSE_MENTORS_LABEL,
    href: '/mentoring',
  };
};

export const getMyMentoringSecondaryActionMeta = (
  mentoring: Pick<
    MyMentoringItem,
    'status' | 'refundStatus' | 'mentorId' | 'method'
  >,
) => {
  if (
    mentoring.status === 'REQUESTED' ||
    mentoring.status === 'PENDING' ||
    mentoring.status === 'CONFIRMED'
  ) {
    return {
      label: MENTORING_VIEW_MENTOR_PROFILE_LABEL,
      href: getMyMentoringMentorProfileHref(mentoring),
    };
  }

  if (mentoring.status === 'COMPLETED') {
    return {
      label: MENTORING_REAPPLY_SAME_METHOD_LABEL,
      href: getMyMentoringReapplyHref(mentoring),
    };
  }

  if (mentoring.status === 'NO_SHOW' || mentoring.status === 'CANCELLED') {
    return {
      label: MENTORING_BROWSE_MENTORS_LABEL,
      href: '/mentoring',
    };
  }

  return {
    label: MENTORING_VIEW_MENTOR_PROFILE_LABEL,
    href: getMyMentoringMentorProfileHref(mentoring),
  };
};
