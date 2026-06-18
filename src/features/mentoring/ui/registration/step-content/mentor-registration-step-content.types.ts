import type { ReactNode } from 'react';
import type { MentorRegistrationSelectionOption } from '@/features/mentoring/model/registration/use-mentor-registration-selection-state';
import type {
  MentorRegistrationFormProps,
  MentorRegistrationScheduleDraftState,
  MentorRegistrationStepId,
} from '@/types/mentoring/registration-view';

export interface MentorRegistrationDirtyValidationOptions {
  shouldValidate: true;
  shouldDirty: true;
}

export interface MentorRegistrationStepContentProps {
  currentStepId: MentorRegistrationStepId;
  form: MentorRegistrationFormProps['form'];
  stepFooter: ReactNode;
  dirtyValidationOptions: MentorRegistrationDirtyValidationOptions;
  jobGroup: string;
  jobGroupOptions: MentorRegistrationSelectionOption[];
  jobTitleOptions: MentorRegistrationSelectionOption[];
  careerOptions: MentorRegistrationSelectionOption[];
  mentorPositionErrorMessage?: string;
  visibleCoreKeywordOptions: MentorRegistrationSelectionOption[];
  maxSelectableCoreKeywordCount: number;
  normalizeProfileKeywordSelection: (keywords: string[]) => string[];
  skillTagErrorMessage?: string;
  onScheduleDraftStateChange: (
    state: MentorRegistrationScheduleDraftState,
  ) => void;
}

export type MentorRegistrationBasicInformationStepProps = Pick<
  MentorRegistrationStepContentProps,
  'form' | 'stepFooter' | 'dirtyValidationOptions'
>;

export type MentorRegistrationMentorInformationStepProps = Pick<
  MentorRegistrationStepContentProps,
  | 'form'
  | 'stepFooter'
  | 'jobGroup'
  | 'jobGroupOptions'
  | 'jobTitleOptions'
  | 'careerOptions'
  | 'mentorPositionErrorMessage'
  | 'visibleCoreKeywordOptions'
  | 'maxSelectableCoreKeywordCount'
  | 'normalizeProfileKeywordSelection'
  | 'skillTagErrorMessage'
>;

export type MentorRegistrationPricingStepProps = Pick<
  MentorRegistrationStepContentProps,
  'form' | 'stepFooter' | 'dirtyValidationOptions'
>;

export type MentorRegistrationDescriptionStepProps = Pick<
  MentorRegistrationStepContentProps,
  'form' | 'stepFooter'
>;

export type MentorRegistrationScheduleStepProps = Pick<
  MentorRegistrationStepContentProps,
  'form' | 'stepFooter' | 'onScheduleDraftStateChange'
>;

export type MentorRegistrationSettlementStepProps = Pick<
  MentorRegistrationStepContentProps,
  'stepFooter'
>;
