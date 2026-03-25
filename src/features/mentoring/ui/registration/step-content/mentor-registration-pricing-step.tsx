'use client';

import { Phone, RotateCcw, Star } from 'lucide-react';
import { Controller, useWatch } from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import ChipButton from '@/components/common/ui/chip/chip-button';
import SingleDropdown from '@/components/common/ui/dropdown/single';
import FieldErrorText from '@/components/common/ui/form/field-error-text';
import FormSectionCard from '@/components/common/ui/form/form-section-card';
import { BaseInput } from '@/components/common/ui/input';
import { CONSULTING_DURATION_DROPDOWN_OPTIONS } from '@/features/mentoring/model/mentor-setting-options';
import FieldRequirementBadge from '@/features/mentoring/ui/registration/mentor-field-requirement-badge';
import { METHOD_FIELDS } from '@/features/mentoring/ui/registration/mentor-registration-form.constants';
import {
  MENTOR_REGISTRATION_METHOD_ICON_MAP,
  MENTOR_REGISTRATION_PRICE_INPUT,
} from './mentor-registration-pricing-step.constants';
import type { MentorRegistrationPricingStepProps } from './mentor-registration-step-content.types';

export default function MentorRegistrationPricingStep({
  form,
  stepFooter,
  dirtyValidationOptions,
}: MentorRegistrationPricingStepProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = form;
  const noteEnabled = useWatch({
    control,
    name: 'noteEnabled',
  });
  const simpleEnabled = useWatch({
    control,
    name: 'simpleEnabled',
  });
  const deepEnabled = useWatch({
    control,
    name: 'deepEnabled',
  });
  const offlineEnabled = useWatch({
    control,
    name: 'offlineEnabled',
  });
  const methodEnabledState = {
    noteEnabled: noteEnabled === true,
    simpleEnabled: simpleEnabled === true,
    deepEnabled: deepEnabled === true,
    offlineEnabled: offlineEnabled === true,
  } as const;

  return (
    <div data-form-preview-section="methods">
      <FormSectionCard
        title={
          <span className="inline-flex items-center gap-75">
            <Phone className="text-text-brand h-18 w-18" />
            가격 / 시간
            <FieldRequirementBadge state="applicationRequired" />
          </span>
        }
        description="상담 방식과 가격을 먼저 정하면 다음 단계에서 스케줄이 필요한지 바로 판단할 수 있습니다."
      >
        <div className="rounded-125 border-border-warning bg-background-accent-yellow-subtle mb-200 border px-150 py-125">
          <p className="font-designer-13b text-text-default mb-50 flex items-center gap-75">
            <Phone className="text-text-warning h-14 w-14" />첫 멘토링은
            간편상담으로 시작해보세요.
          </p>
          <p className="font-designer-13r text-text-subtle leading-relaxed">
            쪽지/간편 포맷은 멘티의 시작 허들을 낮출 수 있습니다. 신청서에서
            질문/고민/자료를 먼저 받아 빠르게 답변할 수 있도록 운영해보세요.
          </p>
        </div>

        <div className="mt-200 grid grid-cols-1 gap-150 lg:grid-cols-2">
          {METHOD_FIELDS.map((field) => {
            const enabled = methodEnabledState[field.enabledField];
            const priceErrorMessage = errors[field.priceField]?.message as
              | string
              | undefined;
            const durationErrorMessage = field.durationField
              ? (errors[field.durationField]?.message as string | undefined)
              : undefined;
            const MethodIcon =
              MENTOR_REGISTRATION_METHOD_ICON_MAP[field.enabledField];

            return (
              <article
                key={field.enabledField}
                className={cn(
                  'rounded-100 border-border-default border p-150',
                  enabled
                    ? 'bg-background-default'
                    : 'bg-background-alternative opacity-80',
                )}
              >
                <div className="mb-125 grid grid-cols-fluid-120 items-start gap-150">
                  <div className="min-w-0 flex-1">
                    <p className="font-designer-16b text-text-default flex items-center gap-75">
                      <span className="text-text-brand">
                        <MethodIcon className="h-16 w-16" />
                      </span>
                      {field.label}
                      <FieldRequirementBadge state="optional" />
                    </p>
                    <p className="font-designer-13r text-text-subtle mt-25">
                      {field.description}
                    </p>
                    <p className="font-designer-12r text-text-subtle mt-50 leading-relaxed">
                      {field.policySummary}
                    </p>
                  </div>
                  <ChipButton
                    type="button"
                    onClick={() =>
                      setValue(field.enabledField, !enabled, {
                        ...dirtyValidationOptions,
                      })
                    }
                    variant="state"
                    active={enabled}
                    className="justify-self-end whitespace-nowrap"
                  >
                    {enabled ? '활성' : '비활성'}
                  </ChipButton>
                </div>

                <div>
                  <p className="font-designer-13r text-text-subtle mb-50 flex items-center gap-50">
                    <Star className="h-12 w-12" />
                    회당 가격 (원)
                  </p>
                  <BaseInput
                    type="number"
                    min={MENTOR_REGISTRATION_PRICE_INPUT.min}
                    max={MENTOR_REGISTRATION_PRICE_INPUT.max}
                    step={MENTOR_REGISTRATION_PRICE_INPUT.step}
                    disabled={!enabled}
                    className={MENTOR_REGISTRATION_PRICE_INPUT.className}
                    {...register(field.priceField)}
                    placeholder="가격(원)"
                  />
                  <FieldErrorText message={priceErrorMessage} />
                </div>

                {field.durationField && (
                  <div className="mt-125">
                    <p className="font-designer-13r text-text-subtle mb-50 flex items-center gap-50">
                      <RotateCcw className="h-12 w-12" />
                      상담 시간
                    </p>
                    <Controller
                      name={field.durationField}
                      control={control}
                      render={({ field: durationField }) => (
                        <SingleDropdown
                          options={
                            field.durationOptions ??
                            CONSULTING_DURATION_DROPDOWN_OPTIONS
                          }
                          value={String(durationField.value)}
                          onChange={(value) =>
                            durationField.onChange(Number(value ?? '60'))
                          }
                          placeholder="상담 시간"
                        />
                      )}
                    />
                    <FieldErrorText message={durationErrorMessage} />
                  </div>
                )}

                {field.enabledField === 'simpleEnabled' && (
                  <p className="font-designer-12r text-text-subtle mt-100">
                    간편상담은 15분 고정으로 운영됩니다.
                  </p>
                )}
              </article>
            );
          })}
        </div>
        <FieldErrorText message={errors.noteEnabled?.message} />
        {stepFooter}
      </FormSectionCard>
    </div>
  );
}
