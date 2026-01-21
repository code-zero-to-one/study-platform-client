'use client';

import {
  Controller,
  useController,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import Checkbox from '@/components/ui/checkbox';
import { SingleDropdown } from '@/components/ui/dropdown';
import FormField from '@/components/ui/form/form-field';
import { BaseInput } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio';
import { GroupItems } from '@/components/ui/toggle';
import { formatKoreaYMD } from '@/utils/time';
import { TargetRole } from '../../api/group-study-types';
import {
  STUDY_TYPES,
  ROLE_OPTIONS_UI,
  EXPERIENCE_LEVEL_OPTIONS_UI,
  STUDY_METHODS,
  STUDY_METHOD_LABELS,
  STUDY_TYPE_LABELS,
  REGULAR_MEETINGS,
  REGULAR_MEETING_LABELS,
} from '../../const/group-study-const';
import { GroupStudyFormValues } from '../../model/group-study-form.schema';
import { useClassification } from '../group-study-form';

const methodOptions = STUDY_METHODS.map((v) => ({
  label: STUDY_METHOD_LABELS[v],
  value: v,
}));

const memberOptions = Array.from({ length: 20 }, (_, i) => {
  const value = (i + 1).toString();

  return { label: `${value}명`, value };
});

export default function Step1OpenGroupStudy() {
  const { control, formState, watch } = useFormContext<GroupStudyFormValues>();
  const classification = useClassification();
  const isPremiumStudy = classification === 'PREMIUM_STUDY';

  const { field: typeField } = useController({
    name: 'type',
    control,
  });
  const { field: regularMeetingField } = useController({
    name: 'regularMeeting',
    control,
  });
  const { field: studyLeaderParticipationField } = useController({
    name: 'studyLeaderParticipation',
    control,
  });
  const methodValue = useWatch({
    name: 'method',
    control,
  });

  return (
    <>
      <div className="font-designer-20b text-text-default">기본 정보 설정</div>
      <FormField<GroupStudyFormValues, 'studyLeaderParticipation'>
        name="studyLeaderParticipation"
        label="리더 참여 여부"
        helper="스터디 리더가 직접 스터디에 참여하는지 선택해주세요."
        direction="vertical"
        size="medium"
        required
      >
        <div className="flex items-center gap-100">
          <Checkbox
            id="studyLeaderParticipation"
            checked={studyLeaderParticipationField.value}
            onToggle={() =>
              studyLeaderParticipationField.onChange(
                !studyLeaderParticipationField.value,
              )
            }
          />
          <label
            htmlFor="studyLeaderParticipation"
            className="font-designer-14m text-text-default cursor-pointer"
          >
            리더가 스터디에 참여합니다
          </label>
        </div>
      </FormField>
      <FormField<GroupStudyFormValues, 'type'>
        name="type"
        label="스터디 유형"
        helper="어떤 방식으로 진행되는 스터디인지 선택해주세요."
        direction="vertical"
        size="medium"
        required
      >
        <RadioGroup
          className="flex flex-row gap-300"
          value={typeField.value}
          onValueChange={typeField.onChange}
        >
          {STUDY_TYPES.map((type) => (
            <div key={type} className="flex items-center gap-100">
              <RadioGroupItem value={type} id={`study-type-${type}`} />
              <label
                htmlFor={`study-type-${type}`}
                className="font-designer-14m text-text-default"
              >
                {STUDY_TYPE_LABELS[type]}
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
      >
        <GroupItems options={EXPERIENCE_LEVEL_OPTIONS_UI} />
      </FormField>
      <div className="flex flex-col gap-100">
        <div className="flex items-center gap-75">
          <label className="font-designer-16b text-text-default">
            진행 방식
          </label>
          <span className="font-designer-13r text-text-error">필수</span>
        </div>
        <p className="font-designer-14r text-text-subtle">
          스터디가 진행되는 방식을 선택해주세요.
        </p>

        <div className="mt-100 flex flex-row items-center gap-200">
          <Controller
            name="method"
            control={control}
            render={({ field }) => (
              <SingleDropdown
                options={methodOptions}
                value={field.value}
                onChange={field.onChange}
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
      >
        <RadioGroup
          className="flex flex-row gap-300"
          value={regularMeetingField.value}
          onValueChange={regularMeetingField.onChange}
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
      <div className="flex flex-col gap-100">
        <div className="flex items-center gap-75">
          <label className="font-designer-16b text-text-default">
            진행 기간
          </label>
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
                min={formatKoreaYMD()}
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
                min={watch('startDate') || formatKoreaYMD()}
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
