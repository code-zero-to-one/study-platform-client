'use client';

import { Eye, MessageCircle, Star, UserRound } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import ChipButton from '@/components/common/ui/chip/chip-button';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import { BaseInput } from '@/components/common/ui/input';
import { MENTOR_APPEAL_LINE_PRESETS } from '@/features/mentoring/model/mentor-setting-options';
import FieldRequirementBadge from '@/features/mentoring/ui/registration/mentor-field-requirement-badge';
import {
  APPEAL_LINE_MAX_LENGTH,
  MENTORING_TITLE_MAX_LENGTH,
} from '@/types/schemas/mentor-registration-schema';
import type { MentorRegistrationBasicInformationStepProps } from './mentor-registration-step-content.types';

export default function MentorRegistrationBasicInformationStep({
  form,
  stepFooter,
  dirtyValidationOptions,
}: MentorRegistrationBasicInformationStepProps) {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = form;
  const listVisible =
    useWatch({
      control,
      name: 'listVisible',
    }) === true;

  return (
    <div data-form-preview-section="headline">
      <FormSectionCard
        className="h-full"
        title={
          <span className="inline-flex items-center gap-75">
            <UserRound className="text-text-brand h-18 w-18" />
            기본정보
          </span>
        }
        description="멘티가 목록과 상세에서 가장 먼저 확인하는 기본 소개입니다."
        bodyClassName="space-y-200"
      >
        <section className="space-y-100">
          <div>
            <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
              <Star className="text-text-subtle h-14 w-14" />
              멘토링 명
              <FieldRequirementBadge state="required" />
            </p>
            <p className="font-designer-12r text-text-subtle">
              멘토링 목록 카드 제목으로 노출됩니다.
            </p>
          </div>
          <BaseInput
            placeholder="예) 개발자 취업 / 면접 / 이직 / 커리어 멘토링"
            maxLength={MENTORING_TITLE_MAX_LENGTH}
            {...register('mentoringTitle')}
          />
          <FieldErrorText message={errors.mentoringTitle?.message} />
          <p className="font-designer-12r text-text-subtle">
            멘토링명은 최대 {MENTORING_TITLE_MAX_LENGTH}자까지 입력할 수
            있습니다.
          </p>
        </section>

        <section className="border-border-subtle space-y-100 border-t pt-200">
          <div>
            <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
              <MessageCircle className="text-text-subtle h-14 w-14" />한 줄 어필
              <FieldRequirementBadge state="required" />
            </p>
            <p className="font-designer-12r text-text-subtle">
              상세 헤더의 빨간 강조 문구로 실시간 반영됩니다.
            </p>
          </div>
          <BaseInput
            placeholder="예) 금융권 대기업 / 네카라쿠배 / 쿠팡"
            maxLength={APPEAL_LINE_MAX_LENGTH}
            {...register('appealLine')}
          />
          <FieldErrorText message={errors.appealLine?.message} />
          <div className="rounded-100 bg-background-alternative p-125">
            <div className="flex flex-wrap gap-100">
              {MENTOR_APPEAL_LINE_PRESETS.map((preset) => (
                <ChipButton
                  key={preset}
                  type="button"
                  variant="preset"
                  onClick={() =>
                    setValue('appealLine', preset, dirtyValidationOptions)
                  }
                >
                  {preset}
                </ChipButton>
              ))}
            </div>
          </div>
          <p className="font-designer-12r text-text-subtle">
            멘토링 목록 카드와 상세 헤더에서 강조 노출됩니다.
          </p>
        </section>

        <section className="border-border-subtle space-y-100 border-t pt-200">
          <div className="flex items-start justify-between gap-100">
            <div>
              <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
                <Eye className="text-text-subtle h-14 w-14" />
                멘토링 목록 노출
                <FieldRequirementBadge state="optional" />
              </p>
              <p className="font-designer-12r text-text-subtle">
                비노출로 설정하면 멘토링 목록/상세에서 보이지 않습니다.
              </p>
            </div>
            <label className="font-designer-13r text-text-subtle inline-flex items-center gap-75">
              <input
                type="checkbox"
                className="border-border-default rounded-50 accent-fill-brand-default-default size-200 border"
                {...register('listVisible')}
              />
              노출
            </label>
          </div>
          <p className="font-designer-12r text-text-subtle">
            {listVisible
              ? '현재 멘토링 목록에 노출됩니다.'
              : '현재 멘토링 목록 비노출 상태입니다.'}
          </p>
        </section>
        {stepFooter}
      </FormSectionCard>
    </div>
  );
}
