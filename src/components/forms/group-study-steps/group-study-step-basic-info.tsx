'use client';

import { addDays } from 'date-fns';
import {
  Controller,
  useController,
  useFormContext,
  useWatch,
} from 'react-hook-form';

import { SingleDropdown } from '@/components/common/ui/dropdown';
import FormField from '@/components/common/ui/form/form-field';
import { BaseInput } from '@/components/common/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/common/ui/radio';
import { GroupItems } from '@/components/common/ui/toggle';
import {
  useClassification,
  useMode,
} from '@/components/forms/group-study-form';
import {
  STUDY_TYPES,
  ROLE_OPTIONS_UI,
  EXPERIENCE_LEVEL_OPTIONS_UI,
  STUDY_METHODS,
  STUDY_METHOD_LABELS,
  STUDY_TYPE_LABELS,
  REGULAR_MEETINGS,
  REGULAR_MEETING_LABELS,
} from '@/config/group-study-const';
import {
  useScrollToNextField,
  SCROLL_FIELD_ATTR,
} from '@/hooks/use-scroll-to-next-field';
import { TargetRole } from '@/types/api/group-study.types';
import { GroupStudyFormValues } from '@/types/schemas/group-study-form.schema';
import { formatKoreaYMD, getKoreaDate } from '@/utils/time';

const methodOptions = STUDY_METHODS.map((v) => ({
  label: STUDY_METHOD_LABELS[v],
  value: v,
}));

const memberOptions = Array.from({ length: 20 }, (_, i) => {
  const value = (i + 1).toString();

  return { label: `${value}명`, value };
});

export default function GroupStudyStepBasicInfo() {
  const { control, formState, watch } = useFormContext<GroupStudyFormValues>();
  const classification = useClassification();
  const mode = useMode();
  const isPremiumStudy = classification === 'PREMIUM_STUDY';

  const { field: typeField } = useController({
    name: 'type',
    control,
  });
  const { field: regularMeetingField } = useController({
    name: 'regularMeeting',
    control,
  });

  const methodValue = useWatch({
    name: 'method',
    control,
  });

  const startDateMin =
    mode === 'create'
      ? formatKoreaYMD(addDays(getKoreaDate(), 1))
      : formatKoreaYMD(getKoreaDate());

  const scrollToNext = useScrollToNextField();

  const filteredStudyTypes =
    classification === 'GROUP_STUDY'
      ? STUDY_TYPES.filter((type) => type !== 'MENTORING')
      : STUDY_TYPES;

  return (
    <>
      <div className="font-designer-20b text-text-default">기본 정보 설정</div>
      <FormField<GroupStudyFormValues, 'type'>
        name="type"
        label="스터디 유형"
        helper="어떤 방식으로 진행되는 스터디인지 선택해주세요."
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <RadioGroup
          className="flex flex-wrap gap-300"
          value={typeField.value}
          onValueChange={(v) => {
            typeField.onChange(v);
            scrollToNext('type');
          }}
        >
          {filteredStudyTypes.map((type) => (
            <div key={type} className="flex items-center gap-100">
              <RadioGroupItem value={type} id={`study-type-${type}`} />
              <label
                htmlFor={`study-type-${type}`}
                className="font-designer-14m text-text-default"
              >
                {STUDY_TYPE_LABELS[type as keyof typeof STUDY_TYPE_LABELS]}
              </label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
      <FormField<GroupStudyFormValues, 'targetRoles', TargetRole[]>
        name="targetRoles"
        label="모집 대상"
        helper="함께하고 싶은 대상(직무·관심사 등)을 선택해주세요. (복수 선택 가능)"
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <GroupItems options={ROLE_OPTIONS_UI} />
      </FormField>
      <FormField<GroupStudyFormValues, 'maxMembersCount'>
        name="maxMembersCount"
        label="모집 인원"
        helper="모집할 최대 참여 인원을 선택해주세요."
        direction="vertical"
        size="medium"
        required
        scrollable
        onAfterChange={() => scrollToNext('maxMembersCount')}
      >
        <SingleDropdown options={memberOptions} placeholder="선택해주세요" />
      </FormField>
      <FormField<GroupStudyFormValues, 'experienceLevels', string[]>
        name="experienceLevels"
        label="경력 여부"
        helper="스터디 참여에 필요한 경력 조건을 선택해주세요.(복수 선택 가능)"
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <GroupItems options={EXPERIENCE_LEVEL_OPTIONS_UI} />
      </FormField>
      <div
        {...{ [SCROLL_FIELD_ATTR]: 'method' }}
        className="flex flex-col gap-100"
      >
        <div className="flex items-center gap-75">
          <span className="font-designer-16b text-text-default">진행 방식</span>
          <span className="font-designer-13r text-text-error">필수</span>
        </div>
        <p className="font-designer-14r text-text-subtle">
          스터디가 진행되는 방식을 선택해주세요.
        </p>

        <div className="mt-100 flex flex-col gap-200 sm:flex-row sm:items-center">
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <SingleDropdown
                options={methodOptions}
                value={field.value}
                onChange={(v) => {
                  field.onChange(v);
                  scrollToNext('method');
                }}
                placeholder="선택해주세요"
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <BaseInput
                value={field.value}
                onChange={field.onChange}
                placeholder="위치를 입력하세요."
                disabled={!methodValue || methodValue === 'ONLINE'}
              />
            )}
          />
        </div>

        {(formState.errors.method || formState.errors.location) && (
          <p className="font-designer-14r text-text-error" role="alert">
            {formState.errors.method?.message ||
              formState.errors.location?.message}
          </p>
        )}
      </div>
      <FormField<GroupStudyFormValues, 'regularMeeting'>
        name="regularMeeting"
        label="정기 모임"
        helper="정기적으로 모일 빈도를 선택해주세요."
        direction="vertical"
        size="medium"
        required
        scrollable
      >
        <RadioGroup
          className="flex flex-wrap gap-300"
          value={regularMeetingField.value}
          onValueChange={(v) => {
            regularMeetingField.onChange(v);
            scrollToNext('regularMeeting');
          }}
        >
          {REGULAR_MEETINGS.map((type) => (
            <div key={type} className="flex items-center gap-100">
              <RadioGroupItem value={type} id={`regular-meeting-${type}`} />
              <label
                htmlFor={`regular-meeting-${type}`}
                className="font-designer-14m text-text-default"
              >
                {REGULAR_MEETING_LABELS[type]}
              </label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
      <div
        {...{ [SCROLL_FIELD_ATTR]: 'dates' }}
        className="flex flex-col gap-100"
      >
        <div className="flex items-center gap-75">
          <span className="font-designer-16b text-text-default">진행 기간</span>
          <span className="font-designer-13r text-text-error">필수</span>
        </div>
        <p className="font-designer-14r text-text-subtle">
          스터디 진행 시작일과 종료일을 선택해주세요.
        </p>

        <div className="mt-100 flex flex-row items-center gap-200">
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <BaseInput
                type="date"
                value={field.value}
                onChange={field.onChange}
                min={startDateMin}
                max={watch('endDate') || undefined}
              />
            )}
          />
          <span className="font-designer-14r text-text-subtle">~</span>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <BaseInput
                type="date"
                value={field.value}
                onChange={field.onChange}
                min={
                  watch('startDate') ||
                  formatKoreaYMD(addDays(getKoreaDate(), 1))
                }
              />
            )}
          />
        </div>

        {(formState.errors.startDate || formState.errors.endDate) && (
          <p className="font-designer-14r text-text-error" role="alert">
            {formState.errors.startDate?.message ||
              formState.errors.endDate?.message}
          </p>
        )}
      </div>
      {isPremiumStudy && (
        <FormField<GroupStudyFormValues, 'price'>
          name="price"
          label="참가비"
          direction="vertical"
          size="medium"
          scrollable
        >
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <BaseInput
                type="number"
                step={10000}
                min={10000}
                placeholder="10,000"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </FormField>
      )}
    </>
  );
}
