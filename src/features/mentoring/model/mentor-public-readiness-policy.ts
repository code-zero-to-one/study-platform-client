import { MENTOR_REGISTRATION_STEP_IDS } from '@/types/mentoring/registration-view';
import type { MentorRegistrationVisibleStepId } from '@/types/mentoring/registration-view';

export const MENTOR_APPLICATION_REQUIRED_STEP_META = {
  [MENTOR_REGISTRATION_STEP_IDS.basicInformation]: {
    title: '기본정보',
    description:
      '멘토링명과 한 줄 어필을 입력해야 목록 노출 기준이 충족됩니다.',
  },
  [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]: {
    title: '멘토정보',
    description:
      '멘토 포지션과 핵심 키워드를 입력해야 목록 공개 기준이 완성됩니다.',
  },
  [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]: {
    title: '멘토소개',
    description:
      '멘토 소개를 입력해야 멘토 상세페이지 본문이 정상적으로 공개됩니다.',
  },
  [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]: {
    title: '가격/시간',
    description:
      '상담 방식과 가격 정보를 먼저 정해야 이후 스케줄 필요 여부가 결정됩니다.',
  },
  [MENTOR_REGISTRATION_STEP_IDS.schedule]: {
    title: '스케줄설정',
    description:
      '간편/심층/대면 상담을 열려면 상담 가능한 시간을 최소 1개 이상 등록해야 합니다.\n쪽지상담만 열면 스케줄 설정을 하지 않아도 됩니다.',
  },
  [MENTOR_REGISTRATION_STEP_IDS.settlement]: {
    title: '정산정보 (추후 제공)',
    description:
      '정산정보와 신청 기능은 추후 제공 예정입니다. 현재는 신청 공개가 열리지 않습니다.',
  },
} as const satisfies Record<
  MentorRegistrationVisibleStepId,
  {
    title: string;
    description: string;
  }
>;

export type MentorApplicationRequiredStepId =
  keyof typeof MENTOR_APPLICATION_REQUIRED_STEP_META;

export interface MentorApplicationRequiredStep {
  id: MentorApplicationRequiredStepId;
  title: string;
  description: string;
  done: boolean;
}

export type MentorRequiredStepCompletion = Record<
  MentorApplicationRequiredStepId,
  boolean
>;

export const MENTOR_APPLICATION_REQUIRED_STEP_ORDER: MentorApplicationRequiredStepId[] =
  [
    MENTOR_REGISTRATION_STEP_IDS.basicInformation,
    MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
    MENTOR_REGISTRATION_STEP_IDS.schedule,
    MENTOR_REGISTRATION_STEP_IDS.settlement,
  ];

export const MENTOR_PUBLIC_EXPOSURE_IDS = {
  listExposure: 'listExposure',
  detailExposure: 'detailExposure',
  applicationReady: 'applicationReady',
} as const;

export type MentorPublicExposureId =
  (typeof MENTOR_PUBLIC_EXPOSURE_IDS)[keyof typeof MENTOR_PUBLIC_EXPOSURE_IDS];

export interface MentorPublicExposurePolicy {
  title: string;
  description: string;
  requiredStepIds: readonly MentorApplicationRequiredStepId[];
}

export const MENTOR_PUBLIC_EXPOSURE_POLICY = {
  [MENTOR_PUBLIC_EXPOSURE_IDS.listExposure]: {
    title: '목록 공개',
    description:
      '기본정보와 멘토정보의 필수 작성을 모두 완료하면 목록 공개가 가능합니다.',
    requiredStepIds: [
      MENTOR_REGISTRATION_STEP_IDS.basicInformation,
      MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    ],
  },
  [MENTOR_PUBLIC_EXPOSURE_IDS.detailExposure]: {
    title: '상세 공개',
    description:
      '기본정보, 멘토정보, 멘토 소개의 필수 작성을 모두 완료하면 상세 공개가 가능합니다.',
    requiredStepIds: [
      MENTOR_REGISTRATION_STEP_IDS.basicInformation,
      MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
      MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    ],
  },
  [MENTOR_PUBLIC_EXPOSURE_IDS.applicationReady]: {
    title: '신청 준비',
    description:
      '기본정보, 멘토정보, 멘토소개, 가격/시간, 스케줄설정, 정산정보의 필수 작성을 모두 완료하면 신청 준비가 가능합니다.',
    requiredStepIds: MENTOR_APPLICATION_REQUIRED_STEP_ORDER,
  },
} as const satisfies Record<MentorPublicExposureId, MentorPublicExposurePolicy>;

export const MENTOR_PUBLIC_EXPOSURE_ORDER: MentorPublicExposureId[] = [
  MENTOR_PUBLIC_EXPOSURE_IDS.listExposure,
  MENTOR_PUBLIC_EXPOSURE_IDS.detailExposure,
  MENTOR_PUBLIC_EXPOSURE_IDS.applicationReady,
];

export type MentorPublicExposureReadyState = Record<
  MentorPublicExposureId,
  boolean
>;

interface MentorScheduleStepCompletionOptions {
  hasEnabledMethod: boolean;
  hasScheduleRequiredMethodEnabled: boolean;
  hasAnyScheduleSlots: boolean;
}

export const isMentorScheduleStepComplete = ({
  hasEnabledMethod,
  hasScheduleRequiredMethodEnabled,
  hasAnyScheduleSlots,
}: MentorScheduleStepCompletionOptions) => {
  if (!hasEnabledMethod) {
    return false;
  }

  if (!hasScheduleRequiredMethodEnabled) {
    return true;
  }

  return hasAnyScheduleSlots;
};

export const isMentorPublicExposureReady = (
  completion: MentorRequiredStepCompletion,
  exposureId: MentorPublicExposureId,
) => {
  return MENTOR_PUBLIC_EXPOSURE_POLICY[exposureId].requiredStepIds.every(
    (stepId) => completion[stepId],
  );
};

export const getMentorPublicExposureReadyState = (
  completion: MentorRequiredStepCompletion,
): MentorPublicExposureReadyState => {
  return {
    [MENTOR_PUBLIC_EXPOSURE_IDS.listExposure]: isMentorPublicExposureReady(
      completion,
      MENTOR_PUBLIC_EXPOSURE_IDS.listExposure,
    ),
    [MENTOR_PUBLIC_EXPOSURE_IDS.detailExposure]: isMentorPublicExposureReady(
      completion,
      MENTOR_PUBLIC_EXPOSURE_IDS.detailExposure,
    ),
    [MENTOR_PUBLIC_EXPOSURE_IDS.applicationReady]: isMentorPublicExposureReady(
      completion,
      MENTOR_PUBLIC_EXPOSURE_IDS.applicationReady,
    ),
  };
};
