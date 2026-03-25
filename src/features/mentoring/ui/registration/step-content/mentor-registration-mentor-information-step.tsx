'use client';

import { Star, Users } from 'lucide-react';
import { Controller } from 'react-hook-form';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import SelectableTagsInput from '@/components/common/ui/form/multi-item-selector';
import MentorCareerEntriesEditor from '@/features/mentoring/ui/registration/mentor-career-entries-editor';
import FieldRequirementBadge from '@/features/mentoring/ui/registration/mentor-field-requirement-badge';
import { MENTOR_SKILL_TAG_MAX_LENGTH } from '@/types/schemas/mentor-registration-schema';
import type { MentorRegistrationMentorInformationStepProps } from './mentor-registration-step-content.types';

export default function MentorRegistrationMentorInformationStep({
  form,
  stepFooter,
  jobGroup,
  jobGroupOptions,
  jobTitleOptions,
  careerOptions,
  mentorPositionErrorMessage,
  visibleCoreKeywordOptions,
  maxSelectableCoreKeywordCount,
  normalizeProfileKeywordSelection,
  skillTagErrorMessage,
}: MentorRegistrationMentorInformationStepProps) {
  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div data-form-preview-section="headline">
      <FormSectionCard
        className="h-full"
        title={
          <span className="inline-flex items-center gap-75">
            <Users className="text-text-brand h-18 w-18" />
            멘토정보
          </span>
        }
        description="멘토 포지션, 핵심 키워드, 주요 이력을 설정합니다."
        bodyClassName="space-y-200"
      >
        <section className="space-y-100">
          <div>
            <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
              <Users className="text-text-subtle h-14 w-14" />
              멘토 포지션
              <FieldRequirementBadge state="required" />
            </p>
            <p className="font-designer-12r text-text-subtle">
              직군, 직무, 경력 조합으로 탐색 필터에 노출됩니다.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-150 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-3">
            <Controller
              name="jobGroup"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={jobGroupOptions}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder="멘토 직군"
                />
              )}
            />
            <Controller
              name="jobTitle"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={jobTitleOptions}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder={jobGroup ? '멘토 직무' : '먼저 멘토 직군 선택'}
                  disabled={!jobGroup}
                />
              )}
            />
            <Controller
              name="careerYears"
              control={control}
              render={({ field }) => (
                <SingleDropdown
                  options={careerOptions}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? '')}
                  placeholder="멘토 경력"
                />
              )}
            />
          </div>
          <FieldErrorText
            message={
              errors.jobGroup?.message ??
              errors.jobTitle?.message ??
              errors.careerYears?.message ??
              mentorPositionErrorMessage
            }
          />
        </section>

        <section className="border-border-subtle space-y-100 border-t pt-200">
          <div>
            <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
              <Star className="text-text-subtle h-14 w-14" />
              핵심 키워드
              <FieldRequirementBadge state="required" />
            </p>
            <p className="font-designer-12r text-text-subtle">
              등록 화면에는 운영 키워드만 노출됩니다. 직접 추가한 키워드는 현재
              멘토 프로필에 저장되어 공개 화면에만 노출되고, 다른 멘토의 등록
              옵션으로 바로 추가되지는 않습니다.
            </p>
          </div>
          <Controller
            name="skillTags"
            control={control}
            render={({ field }) => (
              <SelectableTagsInput
                value={field.value}
                onChange={(nextProfileKeywords) =>
                  field.onChange(
                    normalizeProfileKeywordSelection(nextProfileKeywords),
                  )
                }
                maxSelectable={maxSelectableCoreKeywordCount}
                maxCustomLength={MENTOR_SKILL_TAG_MAX_LENGTH}
                options={visibleCoreKeywordOptions}
                allowCustom
              />
            )}
          />
          <FieldErrorText
            message={errors.skillTags?.message ?? skillTagErrorMessage}
          />
        </section>

        <MentorCareerEntriesEditor form={form} />
        {stepFooter}
      </FormSectionCard>
    </div>
  );
}
