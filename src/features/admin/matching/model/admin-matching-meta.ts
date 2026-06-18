import {
  AutoRunMatchingRequestDtoTargetWeekEnum,
  AutoRunMatchingRequestDtoTemplateTypeEnum,
  AdminMatchingCreateRequestStatusEnum,
  AdminMatchingCreateRequestTypeEnum,
  MatchingSystemStatusResponseStatusEnum,
} from '@/api/openapi/models';
import type {
  AdminMatchingRequestStatus,
  AdminMatchingRequestType,
  AdminMatchingScheduledDayOfWeek,
  AdminMatchingSchedulerConfig,
  AdminMatchingSystemStatus,
  AdminMatchingTargetWeek,
  AdminMatchingTemplateType,
} from '@/types/matching/admin-domain';

type BadgeColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'orange'
  | 'gray'
  | 'purple'
  | 'primary';

export const ADMIN_MATCHING_SYSTEM_STATUS_META: Record<
  AdminMatchingSystemStatus,
  {
    label: string;
    color: BadgeColor;
    description: string;
  }
> = {
  [MatchingSystemStatusResponseStatusEnum.Recruiting]: {
    label: '모집 중',
    color: 'blue',
    description: '참여자 신청과 다음 스터디 구성을 준비하는 상태입니다.',
  },
  [MatchingSystemStatusResponseStatusEnum.Studying]: {
    label: '스터디 진행 중',
    color: 'green',
    description:
      '현재 스터디 사이클이 진행 중이며 종료 후 다시 모집 상태로 전환됩니다.',
  },
};

export const UNKNOWN_ADMIN_MATCHING_SYSTEM_STATUS_META = {
  label: '확인 필요',
  color: 'gray' as const,
  description: '현재 시스템 상태를 아직 불러오지 못했습니다.',
};

export const ADMIN_MATCHING_SCHEDULER_ENABLED_META = {
  enabled: {
    label: '활성화',
    color: 'green' as const,
    description: '저장된 설정으로 다음 주 자동 매칭 스케줄러가 실행됩니다.',
  },
  disabled: {
    label: '비활성화',
    color: 'gray' as const,
    description:
      '런타임 스케줄러는 멈춰 있지만 마지막 설정값은 그대로 유지됩니다.',
  },
  unknown: {
    label: '확인 필요',
    color: 'gray' as const,
    description: '스케줄러 설정을 아직 불러오지 못했습니다.',
  },
};

export const getAdminMatchingSchedulerMeta = (
  schedulerConfig?: AdminMatchingSchedulerConfig,
) => {
  if (!schedulerConfig) {
    return ADMIN_MATCHING_SCHEDULER_ENABLED_META.unknown;
  }

  return schedulerConfig.enabled
    ? ADMIN_MATCHING_SCHEDULER_ENABLED_META.enabled
    : ADMIN_MATCHING_SCHEDULER_ENABLED_META.disabled;
};

export const ADMIN_MATCHING_REQUEST_STATUS_META: Record<
  AdminMatchingRequestStatus,
  {
    label: string;
    color: BadgeColor;
  }
> = {
  [AdminMatchingCreateRequestStatusEnum.Pending]: {
    label: '대기',
    color: 'gray',
  },
  [AdminMatchingCreateRequestStatusEnum.ResAcpt]: {
    label: '수락 응답',
    color: 'green',
  },
  [AdminMatchingCreateRequestStatusEnum.ResAuto]: {
    label: '자동 응답',
    color: 'blue',
  },
  [AdminMatchingCreateRequestStatusEnum.ResRej]: {
    label: '거절 응답',
    color: 'red',
  },
  [AdminMatchingCreateRequestStatusEnum.Auto]: {
    label: '자동 매칭',
    color: 'purple',
  },
  [AdminMatchingCreateRequestStatusEnum.Done]: {
    label: '완료',
    color: 'green',
  },
  [AdminMatchingCreateRequestStatusEnum.Cancel]: {
    label: '취소',
    color: 'orange',
  },
};

export const ADMIN_MATCHING_TYPE_META: Record<
  AdminMatchingRequestType,
  {
    label: string;
    color: BadgeColor;
  }
> = {
  [AdminMatchingCreateRequestTypeEnum.Auto]: {
    label: '자동',
    color: 'blue',
  },
  [AdminMatchingCreateRequestTypeEnum.Manual]: {
    label: '수동',
    color: 'orange',
  },
};

export const ADMIN_MATCHING_TARGET_WEEK_OPTIONS: Array<{
  value: AdminMatchingTargetWeek;
  label: string;
}> = [
  {
    value: AutoRunMatchingRequestDtoTargetWeekEnum.Current,
    label: '이번 주',
  },
  {
    value: AutoRunMatchingRequestDtoTargetWeekEnum.Next,
    label: '다음 주',
  },
];

export const ADMIN_MATCHING_TEMPLATE_OPTIONS: Array<{
  value: AdminMatchingTemplateType;
  label: string;
}> = [
  {
    value: AutoRunMatchingRequestDtoTemplateTypeEnum.Study,
    label: '학습 우선',
  },
  {
    value: AutoRunMatchingRequestDtoTemplateTypeEnum.Time,
    label: '시간 우선',
  },
  {
    value: AutoRunMatchingRequestDtoTemplateTypeEnum.Random,
    label: '랜덤',
  },
];

export const ADMIN_MATCHING_SCHEDULED_DAY_META: Record<
  AdminMatchingScheduledDayOfWeek,
  {
    label: string;
  }
> = {
  SATURDAY: {
    label: '토요일',
  },
  SUNDAY: {
    label: '일요일',
  },
};

export const ADMIN_MATCHING_SCHEDULED_DAY_OPTIONS: Array<{
  value: AdminMatchingScheduledDayOfWeek;
  label: string;
}> = Object.entries(ADMIN_MATCHING_SCHEDULED_DAY_META).map(([value, meta]) => ({
  value: value as AdminMatchingScheduledDayOfWeek,
  label: meta.label,
}));

export const ADMIN_MATCHING_TYPE_OPTIONS: Array<{
  value: AdminMatchingRequestType;
  label: string;
}> = [
  {
    value: AdminMatchingCreateRequestTypeEnum.Manual,
    label: 'MANUAL',
  },
  {
    value: AdminMatchingCreateRequestTypeEnum.Auto,
    label: 'AUTO',
  },
];

export const ADMIN_MATCHING_STATUS_OPTIONS: Array<{
  value: AdminMatchingRequestStatus;
  label: string;
}> = Object.entries(ADMIN_MATCHING_REQUEST_STATUS_META).map(
  ([value, meta]) => ({
    value: value as AdminMatchingRequestStatus,
    label: meta.label,
  }),
);
