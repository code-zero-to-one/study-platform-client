'use client';

import { RotateCcw } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import { getMentorScheduleDraftErrors } from '@/features/mentoring/model/mentor-settings';
import FieldRequirementBadge from '@/features/mentoring/ui/registration/mentor-field-requirement-badge';
import { DEFAULT_SCHEDULE } from '@/features/mentoring/ui/registration/mentor-registration-form.constants';
import WeeklyScheduleGrid from '@/features/mentoring/ui/settings/weekly-schedule-grid';
import { WEEKDAY_KEYS } from '@/types/mentoring/settings';
import { createEmptyMentorScheduleDrafts } from '@/types/schemas/mentor-registration-schema';
import type { MentorRegistrationScheduleStepProps } from './mentor-registration-step-content.types';

const areSameScheduleDrafts = (
  left: ReturnType<typeof createEmptyMentorScheduleDrafts>,
  right: ReturnType<typeof createEmptyMentorScheduleDrafts>,
) => {
  return WEEKDAY_KEYS.every((day) => {
    if (left[day].length !== right[day].length) {
      return false;
    }

    return left[day].every((draft, index) => draft === right[day][index]);
  });
};

export default function MentorRegistrationScheduleStep({
  form,
  stepFooter,
  onScheduleDraftStateChange,
}: MentorRegistrationScheduleStepProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = form;
  const { field: scheduleField } = useController({
    name: 'schedule',
    control,
    defaultValue: DEFAULT_SCHEDULE,
  });
  const scheduleDrafts = useWatch({
    control,
    name: 'scheduleDrafts',
    defaultValue: createEmptyMentorScheduleDrafts(),
  });
  const noteEnabled = useWatch({
    control,
    name: 'noteEnabled',
  });
  const simpleEnabled = useWatch({
    control,
    name: 'simpleEnabled',
  });
  const deepEnabled = useWatch({
    control,
    name: 'deepEnabled',
  });
  const offlineEnabled = useWatch({
    control,
    name: 'offlineEnabled',
  });
  const currentScheduleDrafts =
    scheduleDrafts ?? createEmptyMentorScheduleDrafts();
  const scheduleValue = scheduleField.value ?? DEFAULT_SCHEDULE;
  const scheduleDraftErrors = getMentorScheduleDraftErrors(
    currentScheduleDrafts,
  );
  const scheduleDraftMessages = Array.from(
    new Set(
      Object.values(scheduleDraftErrors).filter(
        (message) => message.trim().length > 0,
      ),
    ),
  );
  const hasAnyEnabledMethod =
    noteEnabled === true ||
    simpleEnabled === true ||
    deepEnabled === true ||
    offlineEnabled === true;
  const isScheduleDraftValid = scheduleDraftMessages.length === 0;
  const handleScheduleDraftChange = (
    nextState: Parameters<
      MentorRegistrationScheduleStepProps['onScheduleDraftStateChange']
    >[0],
  ) => {
    if (!areSameScheduleDrafts(currentScheduleDrafts, nextState.drafts)) {
      setValue('scheduleDrafts', nextState.drafts, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }

    onScheduleDraftStateChange(nextState);
  };

  return (
    <div data-form-preview-section="methods">
      <FormSectionCard
        title={
          <span className="inline-flex items-center gap-75">
            <RotateCcw className="text-text-brand h-18 w-18" />
            스케줄 설정
            <FieldRequirementBadge state="applicationRequired" />
          </span>
        }
        description="가격/시간에서 간편상담, 심층상담, 대면상담을 켠 경우에만 상담 가능한 요일/시간(30분 단위)을 선택해주세요. 쪽지만 활성화하면 스케줄 없이 저장할 수 있습니다."
      >
        <WeeklyScheduleGrid
          value={scheduleValue ?? DEFAULT_SCHEDULE}
          onChange={scheduleField.onChange}
          initialTextDrafts={currentScheduleDrafts}
          onDraftStateChange={handleScheduleDraftChange}
        />
        {(hasAnyEnabledMethod || !isScheduleDraftValid) && (
          <FieldErrorText
            message={
              scheduleDraftMessages[0] ??
              (errors.schedule?.message as string | undefined)
            }
          />
        )}
        {stepFooter}
      </FormSectionCard>
    </div>
  );
}
