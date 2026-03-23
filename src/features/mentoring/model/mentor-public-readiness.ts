import {
  getEnabledMentoringMethods,
  getMentorSettings,
} from '@/features/mentoring/model/mentor-profile-utils';
import { hasAnyWeeklyScheduleSlots } from '@/features/mentoring/model/mentor-settings';
import type { MentorProfile } from '@/types/mentoring/domain';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import { MENTOR_REGISTRATION_STEP_IDS } from '@/types/mentoring/registration-view';
import type {
  MentorRegistrationVisibleStepId,
  MentorRegistrationWelcomeChecklistItem,
} from '@/types/mentoring/registration-view';

export const MENTOR_PUBLIC_READINESS_STAGES = {
  detailPreparing: 'DETAIL_PREPARING',
  applyPreparing: 'APPLY_PREPARING',
  applyReady: 'APPLY_READY',
} as const;

export type MentorPublicReadinessStage =
  (typeof MENTOR_PUBLIC_READINESS_STAGES)[keyof typeof MENTOR_PUBLIC_READINESS_STAGES];

export const MENTOR_APPLY_UNSUPPORTED_MESSAGE =
  '아직 실제 멘토링은 미지원합니다.';

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
      '간편/심층/대면 상담을 열려면 상담 가능한 시간을 최소 1개 이상 등록해야 합니다.',
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

export interface MentorPublicReadiness {
  stage: MentorPublicReadinessStage;
  badgeLabel: string;
  ctaLabel: string;
  detailOverlayTitle: string;
  detailOverlayDescription: string;
  applyUnavailableTitle: string;
  applyUnavailableMessage: string;
  isDetailReady: boolean;
  isApplicationReady: boolean;
  shouldShowPreparingBadge: boolean;
  requiredSteps: MentorApplicationRequiredStep[];
  completedRequiredStepCount: number;
  totalRequiredStepCount: number;
}

interface MentorRequiredStepCompletionOptions {
  settlementAccountReady?: boolean;
}

const MENTOR_APPLICATION_REQUIRED_STEP_ORDER: MentorApplicationRequiredStepId[] =
  [
    MENTOR_REGISTRATION_STEP_IDS.basicInformation,
    MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
    MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
    MENTOR_REGISTRATION_STEP_IDS.pricingAndTime,
    MENTOR_REGISTRATION_STEP_IDS.schedule,
    MENTOR_REGISTRATION_STEP_IDS.settlement,
  ];

const MENTOR_DETAIL_REQUIRED_STEP_IDS: MentorApplicationRequiredStepId[] = [
  MENTOR_REGISTRATION_STEP_IDS.basicInformation,
  MENTOR_REGISTRATION_STEP_IDS.mentorInformation,
  MENTOR_REGISTRATION_STEP_IDS.mentorDescription,
];

const MENTOR_PUBLIC_READINESS_META = {
  [MENTOR_PUBLIC_READINESS_STAGES.detailPreparing]: {
    badgeLabel: '준비중',
    ctaLabel: '멘토 준비중',
    detailOverlayTitle: '멘토 준비중',
    detailOverlayDescription:
      '멘토가 상세 공개에 필요한 정보를 준비 중입니다. 멘토 소개 등록이 완료되면 상세 내용을 확인할 수 있어요.',
    applyUnavailableTitle: '멘토 준비중',
    applyUnavailableMessage: '멘토가 소개와 신청 공개 조건을 준비 중입니다.',
  },
  [MENTOR_PUBLIC_READINESS_STAGES.applyPreparing]: {
    badgeLabel: '준비중',
    ctaLabel: '멘토 준비중',
    detailOverlayTitle: '',
    detailOverlayDescription: '',
    applyUnavailableTitle: '멘토 준비중',
    applyUnavailableMessage:
      '멘토가 신청 공개에 필요한 상담 조건을 준비 중입니다.',
  },
  [MENTOR_PUBLIC_READINESS_STAGES.applyReady]: {
    badgeLabel: '',
    ctaLabel: '신청하기',
    detailOverlayTitle: '',
    detailOverlayDescription: '',
    applyUnavailableTitle: '',
    applyUnavailableMessage: '',
  },
} as const;

const hasRequiredBasicInformation = (mentor: MentorProfile) => {
  const settings = getMentorSettings(mentor);

  return (
    settings.mentoringTitle.trim().length > 0 &&
    settings.appealLine.trim().length > 0
  );
};

const hasRequiredMentorInformation = (mentor: MentorProfile) => {
  const settings = getMentorSettings(mentor);
  const hasCoreKeywords = settings.skillTags.some(
    (keyword) => keyword.trim().length > 0,
  );

  return (
    settings.jobGroup.trim().length > 0 &&
    settings.jobTitle.trim().length > 0 &&
    settings.careerYears.trim().length > 0 &&
    hasCoreKeywords
  );
};

const hasMentorDescription = (mentor: MentorProfile) => {
  const settings = getMentorSettings(mentor);

  return (
    normalizeMentorMarkdownContent(settings.detailedDescription).length > 0
  );
};

const hasBookableMethodSetup = (mentor: MentorProfile) => {
  const enabledMethods = getEnabledMentoringMethods(mentor);

  return enabledMethods.some((method) => mentor.methods[method]?.price > 0);
};

const hasScheduleRequiredMethodEnabled = (mentor: MentorProfile) => {
  const enabledMethods = getEnabledMentoringMethods(mentor);

  return enabledMethods.some(
    (method) => mentor.methods[method]?.requiresSchedule === true,
  );
};

const hasBookableScheduleSetup = (mentor: MentorProfile) => {
  const settings = getMentorSettings(mentor);

  if (!hasScheduleRequiredMethodEnabled(mentor)) {
    return true;
  }

  return hasAnyWeeklyScheduleSlots(settings.schedule);
};

const hasRegisteredSettlement = ({
  settlementAccountReady,
}: MentorRequiredStepCompletionOptions) => {
  return settlementAccountReady === true;
};

const getRequiredStepCompletion = (
  mentor: MentorProfile,
  options: MentorRequiredStepCompletionOptions = {},
) => {
  return {
    [MENTOR_REGISTRATION_STEP_IDS.basicInformation]:
      hasRequiredBasicInformation(mentor),
    [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]:
      hasRequiredMentorInformation(mentor),
    [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]:
      hasMentorDescription(mentor),
    [MENTOR_REGISTRATION_STEP_IDS.schedule]: hasBookableScheduleSetup(mentor),
    [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]:
      hasBookableMethodSetup(mentor),
    [MENTOR_REGISTRATION_STEP_IDS.settlement]: hasRegisteredSettlement(options),
  } as const satisfies Record<MentorApplicationRequiredStepId, boolean>;
};

const resolveServerPublicReadinessStage = (
  mentor: MentorProfile,
): MentorPublicReadinessStage | undefined => {
  if (
    mentor.publicReadinessStage ===
      MENTOR_PUBLIC_READINESS_STAGES.detailPreparing ||
    mentor.publicReadinessStage ===
      MENTOR_PUBLIC_READINESS_STAGES.applyPreparing ||
    mentor.publicReadinessStage === MENTOR_PUBLIC_READINESS_STAGES.applyReady
  ) {
    return mentor.publicReadinessStage;
  }

  return undefined;
};

const isDetailReadyFromRequiredSteps = (
  requiredSteps: MentorApplicationRequiredStep[],
) => {
  return requiredSteps
    .filter((step) => MENTOR_DETAIL_REQUIRED_STEP_IDS.includes(step.id))
    .every((step) => step.done);
};

export const getMentorRequiredSteps = (
  mentor: MentorProfile,
  options: MentorRequiredStepCompletionOptions = {},
): MentorApplicationRequiredStep[] => {
  const completion = getRequiredStepCompletion(mentor, options);

  return MENTOR_APPLICATION_REQUIRED_STEP_ORDER.map((stepId) => ({
    id: stepId,
    title: MENTOR_APPLICATION_REQUIRED_STEP_META[stepId].title,
    description: MENTOR_APPLICATION_REQUIRED_STEP_META[stepId].description,
    done: completion[stepId],
  }));
};

export const buildMentorRequiredStepChecklist = (
  mentor: MentorProfile,
  options: MentorRequiredStepCompletionOptions = {},
): MentorRegistrationWelcomeChecklistItem[] => {
  return getMentorRequiredSteps(mentor, options).map((step) => ({
    title: step.title,
    description: step.description,
    done: step.done,
  }));
};

export const getMentorPublicReadiness = (
  mentor: MentorProfile,
): MentorPublicReadiness => {
  const serverStage = resolveServerPublicReadinessStage(mentor);
  const hasApplicationReadyInformation =
    serverStage === MENTOR_PUBLIC_READINESS_STAGES.applyReady ||
    (serverStage === undefined && mentor.applicationReady === true);
  const requiredSteps = getMentorRequiredSteps(mentor, {
    settlementAccountReady: hasApplicationReadyInformation,
  });
  const completedRequiredStepCount = requiredSteps.filter(
    (step) => step.done,
  ).length;
  const hasDetailReadyInformation =
    isDetailReadyFromRequiredSteps(requiredSteps);
  const stage =
    serverStage ??
    (hasApplicationReadyInformation
      ? MENTOR_PUBLIC_READINESS_STAGES.applyReady
      : hasDetailReadyInformation
        ? MENTOR_PUBLIC_READINESS_STAGES.applyPreparing
        : MENTOR_PUBLIC_READINESS_STAGES.detailPreparing);
  const meta = MENTOR_PUBLIC_READINESS_META[stage];

  return {
    stage,
    badgeLabel: meta.badgeLabel,
    ctaLabel: meta.ctaLabel,
    detailOverlayTitle: meta.detailOverlayTitle,
    detailOverlayDescription: meta.detailOverlayDescription,
    applyUnavailableTitle: meta.applyUnavailableTitle,
    applyUnavailableMessage: meta.applyUnavailableMessage,
    isDetailReady: stage !== MENTOR_PUBLIC_READINESS_STAGES.detailPreparing,
    isApplicationReady: stage === MENTOR_PUBLIC_READINESS_STAGES.applyReady,
    shouldShowPreparingBadge:
      stage !== MENTOR_PUBLIC_READINESS_STAGES.applyReady,
    requiredSteps,
    completedRequiredStepCount,
    totalRequiredStepCount: requiredSteps.length,
  };
};
