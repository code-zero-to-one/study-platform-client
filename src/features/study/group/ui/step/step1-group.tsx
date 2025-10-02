'use client';

import {
  Controller,
  useController,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { SingleDropdown } from '@/shared/ui/dropdown';
import FormField from '@/shared/ui/form/form-field';
import { BaseInput } from '@/shared/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio';
import { GroupItems } from '@/shared/ui/toggle';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  STUDY_TYPES,
  MEETING_OPTIONS,
  METHOD_OPTIONS,
} from '../../const/group-const';
import { OpenGroupFormValues } from '../../model/open-group-form.schema';

const ROLE_OPTIONS = [
  { label: '백엔드', value: 'backend' },
  { label: '프론트엔드', value: 'frontend' },
  { label: '기획', value: 'planner' },
  { label: 'UX/UI 디자이너', value: 'uxui-designer' },
];

const expOptions = EXPERIENCE_LEVEL_OPTIONS.map((v) => ({
  label: v,
  value: v,
}));

const methodOptions = METHOD_OPTIONS.map((v) => ({ label: v, value: v }));

const memberOptions = Array.from({ length: 20 }, (_, i) => {
  const value = (i + 1).toString();

  return { label: `${value}명`, value };
});

export default function Step1OpenGroupStudy() {
  const { control, formState } = useFormContext<OpenGroupFormValues>();
  const { field: typeField } = useController({
    name: 'type',
    control,
  });
  const { field: regularMeetingField } = useController({
    name: 'regularMeeting',
    control,
  });
  const methodValue = useWatch({
    control,
    name: 'method',
  });

  return (
    <>
      <div className="font-designer-20b text-text-default">기본 정보 설정</div>
      <FormField<OpenGroupFormValues, 'type'>
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
          {STUDY_TYPES.map((type, index) => (
            <div key={type} className="flex items-center gap-100">
              <RadioGroupItem value={type} id={`option${index}`} />
              <label
                htmlFor={`option${index}`}
                className="font-designer-14m text-text-default"
              >
                {type}
              </label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
      <FormField<OpenGroupFormValues, 'targetRole', string[]>
        name="targetRole"
        label="모집 대상"
        helper="함께하고 싶은 대상(직무·관심사 등)을 선택해주세요. (복수 선택 가능)"
        direction="vertical"
        size="medium"
        required
      >
        <GroupItems options={ROLE_OPTIONS} />
      </FormField>
      <FormField<OpenGroupFormValues, 'maxMembersCount'>
        name="maxMembersCount"
        label="모집 인원"
        helper="모집할 최대 참여 인원을 선택해주세요."
        direction="vertical"
        size="medium"
        required
      >
        <SingleDropdown options={memberOptions} placeholder="선택해주세요" />
      </FormField>
      <FormField<OpenGroupFormValues, 'experienceLevels', string[]>
        name="experienceLevels"
        label="경력 여부"
        helper="스터디 참여에 필요한 경력 조건을 선택해주세요.(복수 선택 가능)"
        direction="vertical"
        size="medium"
        required
      >
        <GroupItems options={expOptions} />
      </FormField>
      <div className="flex flex-col gap-75">
        <div className="flex w-full flex-col gap-75">
          <div className="flex w-full items-center gap-75">
            <label className="font-designer-16b text-text-default">
              진행 방식
            </label>
            <div className="font-designer-13r text-text-error">필수</div>
          </div>
          <div className="font-designer-14r text-text-subtle mb-100">
            스터디가 진행되는 방식을 선택해주세요.
          </div>

          <div className="flex flex-row items-center gap-200">
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
                  disabled={!methodValue || methodValue === '온라인'}
                />
              )}
            />
          </div>

          {(formState.errors.method || formState.errors.location) && (
            <div className="font-designer-14r text-text-error" role="alert">
              {formState.errors.method?.message ||
                formState.errors.location?.message}
            </div>
          )}
        </div>
      </div>
      <FormField<OpenGroupFormValues, 'regularMeeting'>
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
          {MEETING_OPTIONS.map((type, index) => (
            <div key={type} className="flex items-center gap-100">
              <RadioGroupItem value={type} id={`option${index}`} />
              <label
                htmlFor={`option${index}`}
                className="font-designer-14m text-text-default"
              >
                {type}
              </label>
            </div>
          ))}
        </RadioGroup>
      </FormField>
      <div className="flex flex-col gap-75">
        <div className="flex w-full flex-col gap-75">
          <div className="flex w-full items-center gap-75">
            <label className="font-designer-16b text-text-default">
              진행 기간
            </label>
            <div className="font-designer-13r text-text-error">필수</div>
          </div>
          <div className="font-designer-14r text-text-subtle mb-100">
            스터디 진행 시작일과 종료일을 선택해주세요.
          </div>

          <div className="flex flex-row items-center gap-200">
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <BaseInput
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="font-designer-14r text-text-subtle">~</div>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <BaseInput
                  type="date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          {(formState.errors.startDate || formState.errors.endDate) && (
            <div className="font-designer-14r text-text-error" role="alert">
              {formState.errors.startDate?.message ||
                formState.errors.endDate?.message}
            </div>
          )}
        </div>
      </div>
      {/* API에는 있는데 디자인에는 없음. 뭐지??? */}
      {/* <FormField<OpenGroupFormValues, 'price'>
        name="price"
        label="참가비"
        helper="참가비가 있다면 입력해주세요. (0원 가능)"
        direction="vertical"
        size="medium"
        required
      >
        <BaseInput type="number" min={0} placeholder="0" />
      </FormField> */}
    </>
  );
}
