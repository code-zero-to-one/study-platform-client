'use client';

import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Button from '@/shared/ui/button';
import FormField from '@/shared/ui/form/form-field';
import { BaseInput } from '@/shared/ui/input';
import { GroupStudyFormValues } from '../../model/group-study-form.schema';

export default function Step3OpenGroupStudy() {
  const { setValue, getValues } = useFormContext<GroupStudyFormValues>();

  const initQuestions = getValues('interviewPost');

  const [questions, setQuestions] = useState<string[]>(initQuestions);

  useEffect(() => {
    setValue(
      'interviewPost',
      questions.map((q) => q.trim()),
      { shouldValidate: true },
    );
  }, [questions]);

  const handleAdd = () => setQuestions((prev) => [...prev, '']);
  const handleRemove = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  const handleChange = (index: number, value: string) =>
    setQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));

  return (
    <>
      <div className="font-designer-20b text-text-default">
        지원 & 규칙 설정
      </div>
      <FormField<GroupStudyFormValues, 'interviewPost', string[]>
        name="interviewPost"
        label="스터디원에게 보여줄 질문을 입력하세요"
        direction="vertical"
        helper="스터디 지원자가 신청 시 작성해야 할 질문을 설정하세요. (예: 지원 동기, 경험, 기대하는 점 등)"
        size="medium"
        required
      >
        <div className="flex flex-col gap-100">
          {questions.map((q, index) => (
            <div key={index} className="flex items-start gap-100">
              <BaseInput
                placeholder={index === 0 ? '지원동기를 작성해주세요' : ''}
                value={q}
                onChange={(e) => handleChange(index, e.target.value)}
              />
              {index > 0 && (
                <div
                  className="rounded-75 border-border-default font-designer-16m text-icon-default flex h-600 w-600 cursor-pointer items-center justify-center border p-150"
                  onClick={() => handleRemove(index)}
                >
                  X
                </div>
              )}
            </div>
          ))}
          <Button color="secondary" onClick={handleAdd} type="button">
            질문 추가하기
          </Button>
        </div>
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
