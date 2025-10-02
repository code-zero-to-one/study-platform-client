'use client';

import FormField from '@/shared/ui/form/form-field';
import { TextAreaInput } from '@/shared/ui/input';
import { OpenGroupFormValues } from '../../model/open-group-form.schema';

export default function Step3OpenGroupStudy() {
  // todo: 그룹 폼 필드 변경해야 함
  return (
    <>
      <div className="font-designer-20b text-text-default">
        지원 & 규칙 설정
      </div>
      <FormField<OpenGroupFormValues, 'interviewPost'>
        name="interviewPost"
        label="스터디 지원 시 작성할 질문"
        helper="스터디 지원자가 신청할 때 답변해야 하는 질문들을 작성하세요. (예: 지원 동기, 관련 경험, 기대하는 점 등)"
        direction="vertical"
        size="medium"
      >
        <TextAreaInput placeholder="지원 동기를 입력하세요." maxLength={1000} />
      </FormField>

      <div className="rounded-150 bg-background-alternative flex flex-col gap-300 px-400 py-300">
        <div className="font-designer-20b text-text-default">
          스터디 리더님, 개설 규칙을 준수해주세요.
        </div>
        <ul className="font-designer-16m text-text-subtle list-inside list-disc space-y-100">
          <li>모집 공고의 정보는 사실에 기반해 작성해야 합니다.</li>
          <li>진행 기간과 모임 빈도를 명확히 안내해야 합니다.</li>
          <li>스터디 개설 후 최소 1회 이상 정기 모임을 진행해야 합니다.</li>
          <li>스터디원과의 약속을 존중하고 성실히 운영해야 합니다.</li>
          <li>
            타인의 개인정보 및 자료를 무단으로 공유하거나 외부 유출해서는 안
            됩니다.
          </li>
          <li>플랫폼의 운영 정책 및 커뮤니티 가이드를 준수해야 합니다.</li>
        </ul>
      </div>
    </>
  );
}
