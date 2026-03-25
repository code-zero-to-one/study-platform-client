import { useEffect, useState } from 'react';
import type { UseFormTrigger } from 'react-hook-form';
import { collectFirstErrorFieldPath } from '@/features/mentoring/model/registration/mentor-registration-form-errors';
import {
  MENTOR_REGISTRATION_STEPS,
  STEP_FIELD_PATHS,
  resolveStepIdFromFieldPath,
} from '@/features/mentoring/ui/registration/mentor-registration-form.constants';
import {
  MENTOR_REGISTRATION_STEP_IDS,
  type MentorRegistrationPersistedStepId,
  type MentorRegistrationStepId,
  normalizeMentorRegistrationStepId,
} from '@/types/mentoring/registration-view';
import { type MentorRegistrationFormInputValues } from '@/types/schemas/mentor-registration-schema';

interface UseMentorRegistrationStepFlowParams {
  trigger: UseFormTrigger<MentorRegistrationFormInputValues>;
  initialStepId?: MentorRegistrationPersistedStepId;
  onStepChange?: (stepId: MentorRegistrationStepId) => void;
  getIsScheduleDraftValid: () => boolean;
  getIsSelectionValid: () => boolean;
}

export const useMentorRegistrationStepFlow = ({
  trigger,
  initialStepId,
  onStepChange,
  getIsScheduleDraftValid,
  getIsSelectionValid,
}: UseMentorRegistrationStepFlowParams) => {
  const [currentStepId, setCurrentStepId] = useState<MentorRegistrationStepId>(
    initialStepId
      ? normalizeMentorRegistrationStepId(initialStepId)
      : MENTOR_REGISTRATION_STEPS[0].id,
  );

  useEffect(() => {
    const normalizedInitialStepId = initialStepId
      ? normalizeMentorRegistrationStepId(initialStepId)
      : undefined;

    if (!normalizedInitialStepId || normalizedInitialStepId === currentStepId) {
      return;
    }

    setCurrentStepId(normalizedInitialStepId);
  }, [currentStepId, initialStepId]);

  const moveToStep = (stepId: MentorRegistrationStepId) => {
    const normalizedStepId = normalizeMentorRegistrationStepId(stepId);

    setCurrentStepId(normalizedStepId);
    onStepChange?.(normalizedStepId);
  };

  const currentStepIndex = Math.max(
    0,
    MENTOR_REGISTRATION_STEPS.findIndex((step) => step.id === currentStepId),
  );
  const currentStep = MENTOR_REGISTRATION_STEPS[currentStepIndex];

  const moveToPreviousStep = () => {
    if (currentStepIndex === 0) {
      return;
    }

    moveToStep(MENTOR_REGISTRATION_STEPS[currentStepIndex - 1].id);
  };

  const validateStepAtIndex = async (
    stepIndex: number,
    shouldFocus: boolean,
  ): Promise<boolean> => {
    const step = MENTOR_REGISTRATION_STEPS[stepIndex];
    if (!step) {
      return true;
    }

    if (
      step.id === MENTOR_REGISTRATION_STEP_IDS.schedule &&
      !getIsScheduleDraftValid()
    ) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.schedule);

      return false;
    }

    if (
      step.id === MENTOR_REGISTRATION_STEP_IDS.mentorInformation &&
      !getIsSelectionValid()
    ) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);

      return false;
    }

    const fieldPaths = STEP_FIELD_PATHS[step.id];

    if (fieldPaths.length === 0) {
      return true;
    }

    const isValid = await trigger(fieldPaths, { shouldFocus });

    if (!isValid) {
      moveToStep(step.id);
    }

    return isValid;
  };

  const moveToStepIfStepsValid = async (targetStepIndex: number) => {
    if (targetStepIndex <= currentStepIndex) {
      moveToStep(MENTOR_REGISTRATION_STEPS[targetStepIndex].id);

      return;
    }

    for (let stepIndex = 0; stepIndex < targetStepIndex; stepIndex += 1) {
      const isStepValid = await validateStepAtIndex(stepIndex, true);

      if (!isStepValid) {
        return;
      }
    }

    moveToStep(MENTOR_REGISTRATION_STEPS[targetStepIndex].id);
  };

  const moveToNextStep = async () => {
    if (currentStepIndex >= MENTOR_REGISTRATION_STEPS.length - 1) {
      return;
    }

    await moveToStepIfStepsValid(currentStepIndex + 1);
  };

  const handleSelectStep = async (stepId: MentorRegistrationStepId) => {
    const targetStepIndex = MENTOR_REGISTRATION_STEPS.findIndex(
      (step) => step.id === stepId,
    );

    if (targetStepIndex < 0) {
      return;
    }

    await moveToStepIfStepsValid(targetStepIndex);
  };

  const routeToFirstInvalidStep = (nextErrors: unknown) => {
    if (!getIsScheduleDraftValid()) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.schedule);

      return;
    }

    if (!getIsSelectionValid()) {
      moveToStep(MENTOR_REGISTRATION_STEP_IDS.mentorInformation);

      return;
    }

    const invalidFieldPath = collectFirstErrorFieldPath(nextErrors);
    const invalidStepId = resolveStepIdFromFieldPath(invalidFieldPath);

    if (!invalidStepId) {
      return;
    }

    moveToStep(invalidStepId);
  };

  return {
    currentStepId,
    currentStepIndex,
    currentStep,
    moveToStep,
    moveToPreviousStep,
    moveToNextStep,
    handleSelectStep,
    routeToFirstInvalidStep,
  };
};
