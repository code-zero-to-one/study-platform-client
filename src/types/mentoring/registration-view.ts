import { type UseFormReturn } from 'react-hook-form';
import { type MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import { type MentorSettlementDraft } from '@/types/mentoring/settings';
import {
  type MentorRegistrationFormInputValues,
  type MentorRegistrationFormValues,
} from '@/types/schemas/mentor-registration-schema';

export type MentorRegistrationPreviewHighlightSection =
  | 'headline'
  | 'description'
  | 'interview'
  | 'methods'
  | 'notice';

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

export interface MentorRegistrationWelcomeOnboardingState {
  mentorId: number;
  displayName: string;
  listVisible: boolean;
  checklist: MentorRegistrationWelcomeChecklistItem[];
}

export interface MentorRegistrationEntryOnboardingValues {
  jobGroup: string;
  jobTitle: string;
  careerYears: string;
  appealLine: string;
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
  onCancel: () => void;
  onSubmit: (values: MentorRegistrationFormValues) => void;
}

export interface MentorSettlementRegisterModalProps {
  open: boolean;
  initialValue: MentorSettlementDraft | undefined;
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: MentorSettlementDraft) => void;
}
