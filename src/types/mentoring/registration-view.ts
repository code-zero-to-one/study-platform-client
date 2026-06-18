import { type UseFormReturn } from 'react-hook-form';
import { type MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import {
  type MentorScheduleTextDrafts,
  type WeekdayKey,
} from '@/types/mentoring/settings';
import {
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

export type MentorRegistrationPreviewHighlightSection =
  | 'headline'
  | 'description'
  | 'interview'
  | 'methods';

export const MENTOR_REGISTRATION_STEP_IDS = {
  basicInformation: 'basicInformation',
  mentorInformation: 'mentorInformation',
  mentorDescription: 'mentorDescription',
  pricingAndTime: 'pricingAndTime',
  schedule: 'schedule',
  settlement: 'settlement',
} as const;

export type MentorRegistrationStepId =
  (typeof MENTOR_REGISTRATION_STEP_IDS)[keyof typeof MENTOR_REGISTRATION_STEP_IDS];

export type MentorRegistrationVisibleStepId = MentorRegistrationStepId;

const LEGACY_MENTOR_REGISTRATION_STEP_IDS = {
  interviewQuestions: 'interviewQuestions',
} as const;

export type LegacyMentorRegistrationStepId =
  (typeof LEGACY_MENTOR_REGISTRATION_STEP_IDS)[keyof typeof LEGACY_MENTOR_REGISTRATION_STEP_IDS];

export type MentorRegistrationPersistedStepId =
  | MentorRegistrationStepId
  | LegacyMentorRegistrationStepId;

export const isMentorRegistrationStepId = (
  value: unknown,
): value is MentorRegistrationStepId => {
  return (
    typeof value === 'string' &&
    Object.values(MENTOR_REGISTRATION_STEP_IDS).includes(
      value as MentorRegistrationStepId,
    )
  );
};

export const isMentorRegistrationPersistedStepId = (
  value: unknown,
): value is MentorRegistrationPersistedStepId => {
  return (
    isMentorRegistrationStepId(value) ||
    value === LEGACY_MENTOR_REGISTRATION_STEP_IDS.interviewQuestions
  );
};

export const normalizeMentorRegistrationStepId = (
  stepId: MentorRegistrationPersistedStepId,
): MentorRegistrationStepId => {
  if (stepId === LEGACY_MENTOR_REGISTRATION_STEP_IDS.interviewQuestions) {
    return MENTOR_REGISTRATION_STEP_IDS.mentorDescription;
  }

  return stepId;
};

export type MentorRegistrationScheduleDraftErrors = Record<WeekdayKey, string>;

export interface MentorRegistrationScheduleDraftState {
  drafts: MentorScheduleTextDrafts;
  errors: MentorRegistrationScheduleDraftErrors;
}

export type MentorRegistrationGuardState =
  | 'ready'
  | 'loading'
  | 'mySettingsError'
  | 'optionsError'
  | 'loginRequired'
  | 'permissionRequired'
  | 'verificationLoading'
  | 'verificationError'
  | 'verificationRequired';

export interface MentorRegistrationGuardCardProps {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

export interface MentorRegistrationWelcomeChecklistItem {
  title: string;
  description: string;
  done: boolean;
}

export interface MentorSettlementAccountInput {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface MentorSettlementAccountSummary
  extends MentorSettlementAccountInput {
  createdAt?: string;
}

export interface MentorRegistrationWelcomeOnboardingState {
  mentorId: number;
  title: string;
  description: string;
  isApplicationReady: boolean;
  checklist: MentorRegistrationWelcomeChecklistItem[];
}

export interface MentorRegistrationEntryOnboardingValues {
  jobGroup: string;
  jobTitle: string;
  careerYears: string;
  appealLine: string;
}

export interface MentorRegistrationPersistedPredefinedCoreKeyword {
  code: string;
  label: string;
}

export type MentorRegistrationMethodEnabledField =
  | 'noteEnabled'
  | 'simpleEnabled'
  | 'deepEnabled'
  | 'offlineEnabled';

export type MentorRegistrationMethodPriceField =
  | 'notePrice'
  | 'simplePrice'
  | 'deepPrice'
  | 'offlinePrice';

export type MentorRegistrationMethodDurationField =
  | 'deepDurationMinutes'
  | 'offlineDurationMinutes';

export interface MentorRegistrationMethodField {
  enabledField: MentorRegistrationMethodEnabledField;
  priceField: MentorRegistrationMethodPriceField;
  label: string;
  description: string;
  policySummary: string;
  durationField?: MentorRegistrationMethodDurationField;
  durationOptions?: { value: string; label: string }[];
}

export interface MentorRegistrationFormProps {
  form: UseFormReturn<
    MentorRegistrationFormInputValues,
    unknown,
    MentorRegistrationFormValues
  >;
  options: MentorRegistrationOptions;
  persistedPredefinedCoreKeywords?: ReadonlyArray<MentorRegistrationPersistedPredefinedCoreKeyword>;
  onCancel: () => void;
  onSubmit: (values: MentorRegistrationFormValues) => void;
  isSaving?: boolean;
  initialStepId?: MentorRegistrationStepId;
  initialScheduleDrafts?: MentorScheduleTextDrafts;
  externalSaveBlockingMessage?: string;
  onStepChange?: (stepId: MentorRegistrationStepId) => void;
  onScheduleDraftStateChange?: (
    state: MentorRegistrationScheduleDraftState,
  ) => void;
}

export interface MentorSettlementRegisterModalProps {
  open: boolean;
  initialValue: MentorSettlementAccountSummary | undefined;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: MentorSettlementAccountInput) => Promise<void>;
  isSubmitting?: boolean;
}
