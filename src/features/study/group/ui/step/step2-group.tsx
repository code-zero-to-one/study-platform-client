'use client';

import FormField from '@/shared/ui/form/form-field';
import { BaseInput, TextAreaInput } from '@/shared/ui/input';
import { OpenGroupFormValues } from '../../model/open-group-form.schema';

export default function Step2GroupStudy() {
  // todo: 그룹 폼 필드 변경해야 함
  return (
    <>
      <div className="font-designer-20b text-text-default">
        스터디 소개 작성
      </div>
      <FormField<OpenGroupFormValues, 'type'>
        name="type"
        label="썸네일"
        direction="vertical"
        required
      >
        {/* todo: 여기 파일 업로드 변경 */}
        <BaseInput placeholder="제목을 입력하세요." />
      </FormField>
      <FormField<OpenGroupFormValues, 'type'>
        name="type"
        label="스터디 제목"
        direction="vertical"
        required
      >
        <BaseInput placeholder="제목을 입력하세요." />
      </FormField>

      <FormField<OpenGroupFormValues, 'type'>
        name="type"
        label="스터디 한 줄 소개"
        direction="vertical"
        required
      >
        <BaseInput placeholder="목록에 노출될 스터디 요약을 입력하세요." />
      </FormField>

      <FormField<OpenGroupFormValues, 'type'>
        name="type"
        label="스터디 소개"
        direction="vertical"
        required
      >
        <TextAreaInput placeholder="소개를 입력하세요." maxLength={500} />
      </FormField>
    </>
  );
}
