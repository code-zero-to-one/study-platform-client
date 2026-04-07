'use client';

import { CircleCheck, MessageCircle } from 'lucide-react';
import { useController } from 'react-hook-form';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import MentorMarkdownEditor from '@/features/mentoring/ui/registration/markdown/mentor-markdown-editor';
import FieldRequirementBadge from '@/features/mentoring/ui/registration/mentor-field-requirement-badge';
import InterviewQuestionsTextarea from '@/features/mentoring/ui/registration/mentor-interview-questions-textarea';
import type { MentorRegistrationDescriptionStepProps } from './mentor-registration-step-content.types';

export default function MentorRegistrationDescriptionStep({
  form,
  stepFooter,
}: MentorRegistrationDescriptionStepProps) {
  const {
    control,
    formState: { errors },
  } = form;
  const { field: mentorDescriptionField } = useController({
    name: 'detailedDescription',
    control,
    defaultValue: '',
  });
  const { field: interviewQuestionsField } = useController({
    name: 'interviewQuestions',
    control,
    defaultValue: [],
  });
  const interviewQuestionError =
    (errors.interviewQuestions?.message as string | undefined) ??
    (errors.interviewQuestions?.[0]?.message as string | undefined);

  return (
    <div data-form-preview-section="description">
      <FormSectionCard
        title={
          <span className="inline-flex items-center gap-75">
            <MessageCircle className="text-text-brand h-18 w-18" />
            멘토 소개
            <FieldRequirementBadge state="applicationRequired" />
          </span>
        }
        description="마크다운으로 소개를 작성하면 멘토 상세페이지 본문이 공개됩니다."
      >
        <MentorMarkdownEditor
          value={mentorDescriptionField.value ?? ''}
          onChange={mentorDescriptionField.onChange}
          placeholder="멘토 소개, 전문 분야, 상담 범위를 자유롭게 작성해주세요."
        />
        <FieldErrorText message={errors.detailedDescription?.message} />
        <section className="border-border-subtle space-y-100 border-t pt-200">
          <div>
            <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
              <CircleCheck className="text-text-subtle h-14 w-14" />
              상담 전 준비사항
              <FieldRequirementBadge state="optional" />
            </p>
            <p className="font-designer-12r text-text-subtle">
              멘티가 상담 전에 준비하거나 전달해야 할 내용이 있다면 한 줄에
              하나씩 작성해주세요.
            </p>
          </div>
          <InterviewQuestionsTextarea
            value={interviewQuestionsField.value}
            onChange={interviewQuestionsField.onChange}
          />
          <p className="font-designer-12r text-text-subtle mt-75">
            최대 8개까지 작성할 수 있습니다.
          </p>
          <FieldErrorText message={interviewQuestionError} />
        </section>
        {stepFooter}
      </FormSectionCard>
    </div>
  );
}
