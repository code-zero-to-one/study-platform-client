import type {
  MentorOperationStatus,
  MentorScreeningStatus,
} from '@/types/mentoring-admin';

export type MentorOperationDisplayStatus =
  | MentorOperationStatus
  | 'SCREENING_REQUIRED';

export const MENTOR_OPERATION_STATUS_META: Record<
  MentorOperationDisplayStatus,
  {
    label: string;
    description: string;
    color: 'gray' | 'green' | 'orange' | 'red';
  }
> = {
  SCREENING_REQUIRED: {
    label: '심사 승인 전',
    description: '심사 승인 전에는 운영 조치를 변경할 수 없습니다.',
    color: 'gray',
  },
  OPEN: {
    label: '신규 신청 가능',
    description: '신규 신청과 기존 상담을 모두 정상 운영합니다.',
    color: 'green',
  },
  REQUESTS_PAUSED: {
    label: '신규 신청 중지',
    description: '기존 확정 상담은 유지하고 신규 신청만 받지 않습니다.',
    color: 'orange',
  },
  SUSPENDED: {
    label: '운영 정지',
    description: '신규 신청을 막고 운영 이슈 확인이 필요합니다.',
    color: 'red',
  },
};

export const MENTOR_OPERATION_STATUS_OPTIONS: MentorOperationStatus[] = [
  'OPEN',
  'REQUESTS_PAUSED',
  'SUSPENDED',
];

export const canManageMentorOperationStatus = (
  screeningStatus: MentorScreeningStatus,
) => {
  return screeningStatus === 'APPROVED';
};

export const getMentorOperationDisplayStatus = ({
  screeningStatus,
  operationStatus,
}: {
  screeningStatus: MentorScreeningStatus;
  operationStatus: MentorOperationStatus;
}): MentorOperationDisplayStatus => {
  if (!canManageMentorOperationStatus(screeningStatus)) {
    return 'SCREENING_REQUIRED';
  }

  return operationStatus;
};
