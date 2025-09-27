'use client';

import { useState } from 'react';
import { SingleDropdown } from '@/shared/ui/dropdown';
import FormField from '@/shared/ui/form/form-field';
import { BaseInput } from '@/shared/ui/input';
import { ToggleGroup } from '@/shared/ui/toggle';
import {
  EXPERIENCE_LEVEL_OPTIONS,
  METHOD_OPTIONS,
  REGULAR_MEETING_OPTIONS,
  TYPE_OPTIONS,
} from '../../const/group-const';
import { OpenGroupFormValues } from '../../model/open-group-form.schema';

const ROLE_OPTIONS = [
  { label: '백엔드', value: 'backend' },
  { label: '프론트엔드', value: 'frontend' },
  { label: '기획', value: 'planner' },
  { label: 'UX/UI 디자이너', value: 'uxui-designer' },
];

const typeOptions = TYPE_OPTIONS.map((v) => ({ label: v, value: v }));
const expOptions = EXPERIENCE_LEVEL_OPTIONS.map((v) => ({
  label: v,
  value: v,
}));
const methodOptions = METHOD_OPTIONS.map((v) => ({ label: v, value: v }));
const meetingOptions = REGULAR_MEETING_OPTIONS.map((v) => ({
  label: v,
  value: v,
}));

export default function Step1GroupStudy() {
  const [method, setMethod] = useState<string | undefined>(undefined);

  return (
    <>
      <div className="font-designer-20b text-text-default">기본 정보 설정</div>
      <FormField<OpenGroupFormValues, 'type'>
        name="type"
        label="스터디 유형"
        helper="어떤 방식으로 진행되는 스터디인지 선택해주세요."
        direction="vertical"
        scale="medium"
        required
      >
        {/* todo: 여기 radio 변경 */}
        <SingleDropdown options={typeOptions} placeholder="선택해주세요" />
      </FormField>

      <FormField<OpenGroupFormValues, 'targetRole', string[]>
        name="targetRole"
        label="모집 대상"
        helper="함께하고 싶은 대상(직무·관심사 등)을 선택해주세요. (복수 선택 가능)"
        direction="vertical"
        scale="medium"
        required
      >
        <ToggleGroup options={ROLE_OPTIONS} />
      </FormField>

      <FormField<OpenGroupFormValues, 'maxMembers'>
        name="maxMembers"
        label="모집 인원"
        // todo: 여기 description 변경되면 수정 필요
        helper="모집 인원을 입력해 주세요."
        direction="vertical"
        scale="medium"
        required
      >
        <BaseInput type="number" min={1} placeholder="5" />
      </FormField>

      <FormField<OpenGroupFormValues, 'experienceLevel'>
        name="experienceLevel"
        label="경력 여부"
        helper="함께할 구성원의 경력 레벨을 선택해 주세요."
        direction="vertical"
        scale="medium"
        required
      >
        <ToggleGroup options={expOptions} multiple={false} emptyValue="" />
      </FormField>

      <FormField<OpenGroupFormValues, 'method'>
        name="method"
        label="진행 방식"
        helper="스터디가 진행되는 방식을 선택해주세요. (예: 온라인, 오프라인 등)"
        direction="vertical"
        scale="medium"
        required
      >
        <div className="flex flex-row gap-200">
          <SingleDropdown
            options={methodOptions}
            value={method}
            onChange={setMethod}
            placeholder="선택해주세요"
          />
          <BaseInput placeholder="위치를 입력하세요." disabled={!method} />
        </div>
      </FormField>

      <FormField<OpenGroupFormValues, 'regularMeeting'>
        name="regularMeeting"
        label="정기 모임"
        helper="정기적으로 모일 빈도를 선택해주세요."
        direction="vertical"
        scale="medium"
        required
      >
        {/* todo: 여기 radio 변경 */}
        <SingleDropdown options={meetingOptions} placeholder="선택해주세요" />
      </FormField>

      <FormField<OpenGroupFormValues, 'startDate'>
        name="startDate"
        label="진행 기간"
        helper="스터디가 운영될 기간을 입력해주세요."
        direction="vertical"
        scale="medium"
        required
      >
        <div className="flex flex-row items-center justify-center gap-200">
          <BaseInput type="date" />
          <div className="font-designer-14r text-icon-subtle">~</div>
          <BaseInput type="date" />
        </div>
      </FormField>
    </>
  );
}
