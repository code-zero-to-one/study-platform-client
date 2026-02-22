import { type MentorScreeningStatus } from '@/stores/useMentorScreeningStore';

export const MENTOR_SCREENING_STATUS_META: Record<
  MentorScreeningStatus,
  {
    label: string;
    color: 'orange' | 'purple' | 'green' | 'red';
  }
> = {
  PENDING: {
    label: '심사 대기',
    color: 'orange',
  },
  IN_REVIEW: {
    label: '검토중',
    color: 'purple',
  },
  APPROVED: {
    label: '승인',
    color: 'green',
  },
  REJECTED: {
    label: '반려',
    color: 'red',
  },
};
