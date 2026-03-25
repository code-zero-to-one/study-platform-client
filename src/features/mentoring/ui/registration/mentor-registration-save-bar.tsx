'use client';

import { useMemo } from 'react';
import { useFormState, useWatch } from 'react-hook-form';
import Button from '@/components/common/ui/button';
import {
  MENTOR_PUBLIC_EXPOSURE_IDS,
  type MentorRequiredStepCompletion,
  getMentorPublicExposureReadyState,
  isMentorScheduleStepComplete,
} from '@/features/mentoring/model/mentor-public-readiness-policy';
import { getMentorScheduleDraftErrors } from '@/features/mentoring/model/mentor-settings';
import { collectErrorMessages } from '@/features/mentoring/model/registration/mentor-registration-form-errors';
import { normalizeMentorMarkdownContent } from '@/types/mentoring/markdown';
import {
  MENTOR_REGISTRATION_STEP_IDS,
  type MentorRegistrationFormProps,
} from '@/types/mentoring/registration-view';
import { WEEKDAY_KEYS } from '@/types/mentoring/settings';
import { createEmptyMentorScheduleDrafts } from '@/types/schemas/mentor-registration-schema';

interface MentorRegistrationSaveBarProps {
  form: MentorRegistrationFormProps['form'];
  externalSaveBlockingMessage?: string;
  isSaving?: boolean;
  onCancel: () => void;
  isSelectionValid: boolean;
  selectionValidationMessages: string[];
  hasSelectedSkillTags: boolean;
  isMentorInformationSelectionReady: boolean;
}

export default function MentorRegistrationSaveBar({
  form,
  externalSaveBlockingMessage,
  isSaving = false,
  onCancel,
  isSelectionValid,
  selectionValidationMessages,
  hasSelectedSkillTags,
  isMentorInformationSelectionReady,
}: MentorRegistrationSaveBarProps) {
  const { control } = form;
  const { errors, isSubmitting, isValid } = useFormState({ control });
  const mentoringTitle = useWatch({
    control,
    name: 'mentoringTitle',
    defaultValue: '',
  });
  const appealLine = useWatch({
    control,
    name: 'appealLine',
    defaultValue: '',
  });
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
  const detailedDescription = useWatch({
    control,
    name: 'detailedDescription',
    defaultValue: '',
  });
  const listVisible =
    useWatch({
      control,
      name: 'listVisible',
    }) === true;
  const noteEnabled = useWatch({
    control,
    name: 'noteEnabled',
  });
  const notePrice = useWatch({
    control,
    name: 'notePrice',
  });
  const simpleEnabled = useWatch({
    control,
    name: 'simpleEnabled',
  });
  const simplePrice = useWatch({
    control,
    name: 'simplePrice',
  });
  const deepEnabled = useWatch({
    control,
    name: 'deepEnabled',
  });
  const deepPrice = useWatch({
    control,
    name: 'deepPrice',
  });
  const offlineEnabled = useWatch({
    control,
    name: 'offlineEnabled',
  });
  const offlinePrice = useWatch({
    control,
    name: 'offlinePrice',
  });
  const schedule = useWatch({
    control,
    name: 'schedule',
  });
  const scheduleDrafts = useWatch({
    control,
    name: 'scheduleDrafts',
    defaultValue: createEmptyMentorScheduleDrafts(),
  });

  const normalizedExternalSaveBlockingMessage =
    externalSaveBlockingMessage?.trim();
  const currentScheduleDrafts =
    scheduleDrafts ?? createEmptyMentorScheduleDrafts();
  const hasAnyEnabledMethod =
    noteEnabled === true ||
    simpleEnabled === true ||
    deepEnabled === true ||
    offlineEnabled === true;
  const hasScheduleRequiredMethodEnabled =
    simpleEnabled === true || deepEnabled === true || offlineEnabled === true;
  const hasAnyScheduleSlots = WEEKDAY_KEYS.some(
    (day) => (schedule?.weekly?.[day] ?? []).length > 0,
  );
  const requiredStepCompletion = {
    [MENTOR_REGISTRATION_STEP_IDS.basicInformation]:
      mentoringTitle.trim().length > 0 && appealLine.trim().length > 0,
    [MENTOR_REGISTRATION_STEP_IDS.mentorInformation]:
      jobGroup.trim().length > 0 &&
      jobTitle.trim().length > 0 &&
      careerYears.trim().length > 0 &&
      hasSelectedSkillTags &&
      isMentorInformationSelectionReady,
    [MENTOR_REGISTRATION_STEP_IDS.mentorDescription]:
      normalizeMentorMarkdownContent(detailedDescription).length > 0,
    [MENTOR_REGISTRATION_STEP_IDS.pricingAndTime]:
      (noteEnabled === true &&
        typeof notePrice === 'number' &&
        notePrice > 0) ||
      (simpleEnabled === true &&
        typeof simplePrice === 'number' &&
        simplePrice > 0) ||
      (deepEnabled === true &&
        typeof deepPrice === 'number' &&
        deepPrice > 0) ||
      (offlineEnabled === true &&
        typeof offlinePrice === 'number' &&
        offlinePrice > 0),
    [MENTOR_REGISTRATION_STEP_IDS.schedule]: isMentorScheduleStepComplete({
      hasEnabledMethod: hasAnyEnabledMethod,
      hasScheduleRequiredMethodEnabled,
      hasAnyScheduleSlots,
    }),
    [MENTOR_REGISTRATION_STEP_IDS.settlement]: false,
  } as const satisfies MentorRequiredStepCompletion;
  const exposureReadyState = getMentorPublicExposureReadyState(
    requiredStepCompletion,
  );
  const isListExposureReady =
    exposureReadyState[MENTOR_PUBLIC_EXPOSURE_IDS.listExposure];
  const scheduleDraftErrors = useMemo(
    () => getMentorScheduleDraftErrors(currentScheduleDrafts),
    [currentScheduleDrafts],
  );
  const rawScheduleDraftMessages = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(scheduleDraftErrors).filter(
            (message) => message.trim().length > 0,
          ),
        ),
      ),
    [scheduleDraftErrors],
  );
  const scheduleDraftMessages = useMemo(
    () => (hasScheduleRequiredMethodEnabled ? rawScheduleDraftMessages : []),
    [hasScheduleRequiredMethodEnabled, rawScheduleDraftMessages],
  );
  const isScheduleDraftValid = scheduleDraftMessages.length === 0;
  const isFormInteractionDisabled = isSaving || isSubmitting;
  const isSaveBlockedByValidation =
    Boolean(normalizedExternalSaveBlockingMessage) ||
    !isSelectionValid ||
    !isValid ||
    !isScheduleDraftValid;
  const isSaveDisabled = isSaveBlockedByValidation || isFormInteractionDisabled;
  const saveDisabledReasons = useMemo(() => {
    if (isFormInteractionDisabled) {
      return [];
    }

    if (normalizedExternalSaveBlockingMessage) {
      return [normalizedExternalSaveBlockingMessage];
    }

    if (!isSelectionValid) {
      return selectionValidationMessages.slice(0, 3);
    }

    if (!isScheduleDraftValid) {
      return scheduleDraftMessages.slice(0, 3);
    }

    const messages = Array.from(new Set(collectErrorMessages(errors))).slice(
      0,
      3,
    );

    if (messages.length > 0) {
      return messages;
    }

    return ['필수 항목을 다시 확인해주세요.'];
  }, [
    errors,
    isFormInteractionDisabled,
    isScheduleDraftValid,
    isSelectionValid,
    normalizedExternalSaveBlockingMessage,
    scheduleDraftMessages,
    selectionValidationMessages,
  ]);
  const visibleSaveDisabledReasons = saveDisabledReasons.filter(
    (reason) => reason.trim().length > 0,
  );
  const saveHelperText = isSaveBlockedByValidation
    ? normalizedExternalSaveBlockingMessage
      ? normalizedExternalSaveBlockingMessage
      : !isSelectionValid
        ? '옵션이 바뀌어 다시 선택이 필요한 항목이 있습니다.'
        : !isListExposureReady
          ? '기본정보와 멘토정보를 입력하면 저장 버튼이 활성화되고, 저장 후 멘토링 목록에 준비중으로 노출됩니다.'
          : !listVisible
            ? '현재 목록 비노출 상태입니다. 저장은 가능하지만, 목록에 공개하려면 목록 노출을 켜야 합니다.'
            : '현재 단계까지 저장할 수 있습니다.'
    : !isListExposureReady
      ? '저장 후 공개 흐름은 상단 안내를 확인해주세요.'
      : listVisible
        ? '지금 저장하면 멘토링 목록에 준비중으로 먼저 노출됩니다.'
        : '지금 저장하면 비노출 상태로 저장됩니다. 목록에 보이게 하려면 목록 노출을 켜주세요.';

  return (
    <div className="bg-background-default/95 border-border-subtle supports-[backdrop-filter]:bg-background-default/85 sticky bottom-0 z-20 border-t px-150 py-125 backdrop-blur">
      <div className="flex flex-col gap-100">
        <div className="flex flex-col gap-100 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-designer-12r text-text-subtle">{saveHelperText}</p>
          <div className="flex w-full gap-100 sm:w-auto">
            <Button
              type="button"
              color="secondary"
              size="large"
              className="flex-1 sm:flex-none"
              onClick={onCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              color="primary"
              size="large"
              className="flex-1 sm:flex-none"
              disabled={isSaveDisabled}
            >
              {isSaving || isSubmitting ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </div>
        {isSaveBlockedByValidation && visibleSaveDisabledReasons.length > 0 && (
          <div className="rounded-100 border-border-warning bg-background-accent-yellow-subtle border px-125 py-100">
            <div className="flex flex-col gap-25">
              {visibleSaveDisabledReasons.map((reason) => (
                <p key={reason} className="font-designer-12r text-text-subtle">
                  • {reason}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
