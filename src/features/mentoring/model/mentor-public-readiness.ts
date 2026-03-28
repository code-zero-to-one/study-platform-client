import {
  getEnabledMentoringMethods,
  getMentorSettings,
} from '@/features/mentoring/model/mentor-profile-utils';
import {
  MENTOR_APPLICATION_REQUIRED_STEP_META,
  MENTOR_APPLICATION_REQUIRED_STEP_ORDER,
  MENTOR_PUBLIC_EXPOSURE_IDS,
  type MentorApplicationRequiredStep,
  type MentorRequiredStepCompletion,
  getMentorPublicExposureReadyState,
  isMentorScheduleStepComplete,
} from '@/features/mentoring/model/mentor-public-readiness-policy';
import { hasAnyWeeklyScheduleSlots } from '@/features/mentoring/model/mentor-settings';
import type { MentorProfile } from '@/types/mentoring/domain';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import { MENTOR_REGISTRATION_STEP_IDS } from '@/types/mentoring/registration-view';
import type { MentorRegistrationWelcomeChecklistItem } from '@/types/mentoring/registration-view';

export const MENTOR_PUBLIC_READINESS_STAGES = {
  detailPreparing: 'DETAIL_PREPARING',
  applyPreparing: 'APPLY_PREPARING',
  applyReady: 'APPLY_READY',
} as const;

export type MentorPublicReadinessStage =
  (typeof MENTOR_PUBLIC_READINESS_STAGES)[keyof typeof MENTOR_PUBLIC_READINESS_STAGES];

export const MENTOR_APPLY_UNSUPPORTED_MESSAGE =
  '아직 실제 멘토링은 미지원합니다.';

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

const MENTOR_PUBLIC_READINESS_META = {
  [MENTOR_PUBLIC_READINESS_STAGES.detailPreparing]: {
    badgeLabel: '준비중',
    ctaLabel: '멘토 준비중',
    detailOverlayTitle: '멘토 준비중',
    detailOverlayDescription:
      '멘토가 상세 공개에 필요한 기본정보, 멘토정보, 멘토소개를 준비 중입니다.',
    applyUnavailableTitle: '멘토 준비중',
    applyUnavailableMessage:
      '멘토가 목록 공개와 상세 공개, 신청 준비 조건을 채우는 중입니다.',
  },
  [MENTOR_PUBLIC_READINESS_STAGES.applyPreparing]: {
    badgeLabel: '준비중',
    ctaLabel: '멘토 준비중',
    detailOverlayTitle: '',
    detailOverlayDescription: '',
    applyUnavailableTitle: '멘토 준비중',
    applyUnavailableMessage:
      '멘토가 신청 준비에 필요한 가격/시간, 스케줄, 정산정보를 준비 중입니다.',
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

const hasBookableScheduleSetup = (mentor: MentorProfile) => {
  const settings = getMentorSettings(mentor);
  const enabledMethods = getEnabledMentoringMethods(mentor);

  return isMentorScheduleStepComplete({
    hasEnabledMethod: enabledMethods.length > 0,
    hasScheduleRequiredMethodEnabled: enabledMethods.some(
      (method) => mentor.methods[method]?.requiresSchedule === true,
    ),
    hasAnyScheduleSlots: hasAnyWeeklyScheduleSlots(settings.schedule),
  });
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
  } as const satisfies MentorRequiredStepCompletion;
};

const getRequiredStepCompletionFromServerPublicReadiness = (
  mentor: MentorProfile,
) => {
  const serverPublicReadiness = mentor.publicReadiness;

  if (!serverPublicReadiness) {
    return undefined;
  }

  return {
    [MENTOR_REGISTRATION_STEP_IDS.basicInformation]:
      serverPublicReadiness.steps.basicInformation,
    [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]:
      serverPublicReadiness.steps.mentorInformation,
    [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]:
      serverPublicReadiness.steps.mentorDescription,
    [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]:
      serverPublicReadiness.steps.pricingAndTime,
    [MENTOR_REGISTRATION_STEP_IDS.schedule]:
      serverPublicReadiness.steps.schedule,
    [MENTOR_REGISTRATION_STEP_IDS.settlement]:
      serverPublicReadiness.steps.settlement,
  } as const satisfies MentorRequiredStepCompletion;
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

const toMentorRequiredSteps = (
  completion: MentorRequiredStepCompletion,
): MentorApplicationRequiredStep[] => {
  return MENTOR_APPLICATION_REQUIRED_STEP_ORDER.map((stepId) => ({
    id: stepId,
    title: MENTOR_APPLICATION_REQUIRED_STEP_META[stepId].title,
    description: MENTOR_APPLICATION_REQUIRED_STEP_META[stepId].description,
    done: completion[stepId],
  }));
};

export const getMentorRequiredSteps = (
  mentor: MentorProfile,
  options: MentorRequiredStepCompletionOptions = {},
): MentorApplicationRequiredStep[] => {
  const completion = getRequiredStepCompletion(mentor, options);

  return toMentorRequiredSteps(completion);
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
  const serverPublicReadiness = mentor.publicReadiness;
  const hasApplicationReadyInformation =
    serverPublicReadiness?.applicationReady ??
    (serverStage === MENTOR_PUBLIC_READINESS_STAGES.applyReady ||
      (serverStage === undefined && mentor.applicationReady === true));
  const completion =
    getRequiredStepCompletionFromServerPublicReadiness(mentor) ??
    getRequiredStepCompletion(mentor, {
      settlementAccountReady: hasApplicationReadyInformation,
    });
  const requiredSteps = toMentorRequiredSteps(completion);
  const completedRequiredStepCount = requiredSteps.filter(
    (step) => step.done,
  ).length;
  const publicExposureReadyState = serverPublicReadiness
    ? {
        [MENTOR_PUBLIC_EXPOSURE_IDS.listExposure]:
          serverPublicReadiness.listReady,
        [MENTOR_PUBLIC_EXPOSURE_IDS.detailExposure]:
          serverPublicReadiness.detailReady,
        [MENTOR_PUBLIC_EXPOSURE_IDS.applicationReady]:
          serverPublicReadiness.applicationReady,
      }
    : getMentorPublicExposureReadyState(completion);
  const hasDetailReadyInformation =
    serverPublicReadiness?.detailReady ??
    publicExposureReadyState[MENTOR_PUBLIC_EXPOSURE_IDS.detailExposure];
  const stage =
    serverStage ??
    (hasApplicationReadyInformation
      ? MENTOR_PUBLIC_READINESS_STAGES.applyReady
      : hasDetailReadyInformation
        ? MENTOR_PUBLIC_READINESS_STAGES.applyPreparing
        : MENTOR_PUBLIC_READINESS_STAGES.detailPreparing);
  const meta = MENTOR_PUBLIC_READINESS_META[stage];
  const isDetailReady =
    serverPublicReadiness?.detailReady ??
    stage !== MENTOR_PUBLIC_READINESS_STAGES.detailPreparing;
  const isApplicationReady =
    serverPublicReadiness?.applicationReady ??
    stage === MENTOR_PUBLIC_READINESS_STAGES.applyReady;

  return {
    stage,
    badgeLabel: meta.badgeLabel,
    ctaLabel: meta.ctaLabel,
    detailOverlayTitle: meta.detailOverlayTitle,
    detailOverlayDescription: meta.detailOverlayDescription,
    applyUnavailableTitle: meta.applyUnavailableTitle,
    applyUnavailableMessage: meta.applyUnavailableMessage,
    isDetailReady,
    isApplicationReady,
    shouldShowPreparingBadge: !isApplicationReady,
    requiredSteps,
    completedRequiredStepCount,
    totalRequiredStepCount: requiredSteps.length,
  };
};
