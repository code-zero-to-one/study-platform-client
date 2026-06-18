'use client';

import { useFormState, useWatch } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { getMentorScheduleDraftErrors } from '@/features/mentoring/model/mentor-settings';
import { useMentorRegistrationSelectionState } from '@/features/mentoring/model/registration/use-mentor-registration-selection-state';
import { useMentorRegistrationStepFlow } from '@/features/mentoring/model/registration/use-mentor-registration-step-flow';
import ExposureGuide from '@/features/mentoring/ui/registration/mentor-registration-exposure-guide';
import { MENTOR_REGISTRATION_STEPS } from '@/features/mentoring/ui/registration/mentor-registration-form.constants';
import SaveBar from '@/features/mentoring/ui/registration/mentor-registration-save-bar';
import StepContent from '@/features/mentoring/ui/registration/mentor-registration-step-content';
import RegistrationStepFooter from '@/features/mentoring/ui/registration/mentor-registration-step-footer';
import RegistrationStepNavigator from '@/features/mentoring/ui/registration/mentor-registration-step-navigator';
import {
  type MentorRegistrationFormProps,
  MENTOR_REGISTRATION_STEP_IDS,
} from '@/types/mentoring/registration-view';
import { createEmptyMentorScheduleDrafts } from '@/types/schemas/mentor-registration-schema';

export default function MentorRegistrationForm({
  form,
  options,
  persistedPredefinedCoreKeywords = [],
  onCancel,
  onSubmit,
  isSaving = false,
  initialStepId,
  externalSaveBlockingMessage,
  onStepChange,
  onScheduleDraftStateChange,
}: MentorRegistrationFormProps) {
  const { control, setValue, trigger, handleSubmit, getValues } = form;
  const { isSubmitting } = useFormState({ control });

  const dirtyValidationOptions = {
    shouldValidate: true,
    shouldDirty: true,
  } as const;

  const jobGroup = useWatch({
    control,
    name: 'jobGroup',
    defaultValue: '',
  });
  const jobTitle = useWatch({
    control,
    name: 'jobTitle',
    defaultValue: '',
  });
  const careerYears = useWatch({
    control,
    name: 'careerYears',
    defaultValue: '',
  });
  const profileKeywords =
    useWatch({
      control,
      name: 'skillTags',
      defaultValue: [],
    }) ?? [];

  const {
    jobGroupOptions,
    jobTitleOptions,
    careerOptions,
    visibleCoreKeywordOptions,
    maxSelectableCoreKeywordCount,
    mentorPositionErrorMessage,
    skillTagErrorMessage,
    selectionValidationMessages,
    hasSelectedSkillTags,
    isMentorInformationSelectionReady,
    normalizeProfileKeywordSelection,
  } = useMentorRegistrationSelectionState({
    options,
    persistedPredefinedCoreKeywords,
    jobGroup,
    jobTitle,
    careerYears,
    profileKeywords,
    setValue,
  });

  const isSelectionValid = selectionValidationMessages.length === 0;
  const isFormInteractionDisabled = isSaving || isSubmitting;
  const getIsScheduleDraftValid = () => {
    const values = getValues();
    const hasScheduleRequiredMethodEnabled =
      values.simpleEnabled === true ||
      values.deepEnabled === true ||
      values.offlineEnabled === true;

    if (!hasScheduleRequiredMethodEnabled) {
      return true;
    }

    const currentScheduleDrafts =
      values.scheduleDrafts ?? createEmptyMentorScheduleDrafts();
    const messages = Array.from(
      new Set(
        Object.values(
          getMentorScheduleDraftErrors(currentScheduleDrafts),
        ).filter((message) => message.trim().length > 0),
      ),
    );

    return messages.length === 0;
  };

  const {
    currentStep,
    currentStepIndex,
    moveToStep,
    moveToPreviousStep,
    moveToNextStep,
    handleSelectStep,
    routeToFirstInvalidStep,
  } = useMentorRegistrationStepFlow({
    trigger,
    initialStepId,
    onStepChange,
    getIsScheduleDraftValid,
    getIsSelectionValid: () => isSelectionValid,
  });

  const handleValidSubmit = (values: Parameters<typeof onSubmit>[0]) => {
    if (externalSaveBlockingMessage?.trim()) {
      return;
    }

    if (!isSelectionValid) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);

      return;
    }

    if (!getIsScheduleDraftValid()) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.schedule);

      return;
    }

    if (isFormInteractionDisabled) {
      return;
    }

    onSubmit(values);
  };

  const stepFooter = (
    <RegistrationStepFooter
      currentStepIndex={currentStepIndex}
      totalSteps={MENTOR_REGISTRATION_STEPS.length}
      onPrevious={moveToPreviousStep}
      onNext={(): void => {
        moveToNextStep().catch((): undefined => undefined);
      }}
    />
  );

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit, routeToFirstInvalidStep)}
      className="space-y-225 pb-500"
    >
      <fieldset
        disabled={isFormInteractionDisabled}
        className={cn(
          'm-0 min-w-0 space-y-225 border-0 p-0',
          isFormInteractionDisabled && 'pointer-events-none',
        )}
      >
        <ExposureGuide
          form={form}
          hasSelectedSkillTags={hasSelectedSkillTags}
          isMentorInformationSelectionReady={isMentorInformationSelectionReady}
        />
        <RegistrationStepNavigator
          steps={MENTOR_REGISTRATION_STEPS}
          currentStepId={currentStep.id}
          onSelectStep={handleSelectStep}
        />
        <div className="min-h-[420px]">
          <StepContent
            currentStepId={currentStep.id}
            form={form}
            stepFooter={stepFooter}
            dirtyValidationOptions={dirtyValidationOptions}
            jobGroup={jobGroup}
            jobGroupOptions={jobGroupOptions}
            jobTitleOptions={jobTitleOptions}
            careerOptions={careerOptions}
            mentorPositionErrorMessage={mentorPositionErrorMessage}
            visibleCoreKeywordOptions={visibleCoreKeywordOptions}
            maxSelectableCoreKeywordCount={maxSelectableCoreKeywordCount}
            normalizeProfileKeywordSelection={normalizeProfileKeywordSelection}
            skillTagErrorMessage={skillTagErrorMessage}
            onScheduleDraftStateChange={(state) =>
              onScheduleDraftStateChange?.(state)
            }
          />
        </div>
        <SaveBar
          form={form}
          externalSaveBlockingMessage={externalSaveBlockingMessage}
          isSaving={isSaving}
          onCancel={onCancel}
          isSelectionValid={isSelectionValid}
          selectionValidationMessages={selectionValidationMessages}
          hasSelectedSkillTags={hasSelectedSkillTags}
          isMentorInformationSelectionReady={isMentorInformationSelectionReady}
        />
      </fieldset>
    </form>
  );
}
