'use client';

import { ChevronLeft, MessageCircle, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MENTOR_APPEAL_LINE_PRESETS } from '@/features/mentoring/model/mentor-setting-options';
import { type MentorRegistrationOptions } from '@/types/mentoring/registration-options';
import { type MentorRegistrationEntryOnboardingValues } from '@/types/mentoring/registration-view';
import { cn } from '@/components/ui/(shadcn)/lib/utils';
import Button from '@/components/ui/button';
import ChipButton from '@/components/ui/chip/chip-button';
import { BaseInput } from '@/components/ui/input';

type EntryOnboardingStep = 1 | 2 | 3 | 4;

interface MentorRegistrationEntryOnboardingProps {
  initialValues: MentorRegistrationEntryOnboardingValues;
  options: MentorRegistrationOptions;
  onComplete: (values: MentorRegistrationEntryOnboardingValues) => void;
  onSkip: () => void;
}

const STEP_ORDERS: EntryOnboardingStep[] = [1, 2, 3, 4];

const resolveStartStep = (
  values: MentorRegistrationEntryOnboardingValues,
): EntryOnboardingStep => {
  if (!values.jobGroup) {
    return 1;
  }

  if (!values.jobTitle) {
    return 2;
  }

  if (!values.careerYears) {
    return 3;
  }

  return 4;
};

const getStepTitle = (step: EntryOnboardingStep) => {
  if (step === 1) {
    return '어떤 분야에서 멘토링하실 건가요?';
  }

  if (step === 2) {
    return '주요 직무를 선택해주세요.';
  }

  if (step === 3) {
    return '멘토 경력을 선택해주세요.';
  }

  return '멘티에게 보여줄 한 줄 어필을 남겨주세요.';
};

const getStepDescription = (step: EntryOnboardingStep) => {
  if (step === 1) {
    return '먼저 큰 분야를 고르면 직무를 빠르게 추천해드려요.';
  }

  if (step === 2) {
    return '멘티가 멘토를 탐색할 때 가장 먼저 보는 정보입니다.';
  }

  if (step === 3) {
    return '경력을 기준으로 멘티의 기대치를 맞출 수 있어요.';
  }

  return '예: 네카라쿠배, 금융권 대기업, 창업, 쿠팡';
};

const canProceed = (
  step: EntryOnboardingStep,
  values: MentorRegistrationEntryOnboardingValues,
) => {
  if (step === 1) {
    return values.jobGroup.length > 0;
  }

  if (step === 2) {
    return values.jobTitle.length > 0;
  }

  if (step === 3) {
    return values.careerYears.length > 0;
  }

  return values.appealLine.trim().length >= 2;
};

const toPreviousStep = (step: EntryOnboardingStep): EntryOnboardingStep => {
  if (step === 4) {
    return 3;
  }

  if (step === 3) {
    return 2;
  }

  return 1;
};

const toNextStep = (step: EntryOnboardingStep): EntryOnboardingStep => {
  if (step === 1) {
    return 2;
  }

  if (step === 2) {
    return 3;
  }

  return 4;
};

export default function MentorRegistrationEntryOnboarding({
  initialValues,
  options,
  onComplete,
  onSkip,
}: MentorRegistrationEntryOnboardingProps) {
  const [step, setStep] = useState<EntryOnboardingStep>(() => {
    return resolveStartStep(initialValues);
  });
  const [values, setValues] =
    useState<MentorRegistrationEntryOnboardingValues>(initialValues);
  const appealLineLength = values.appealLine.trim().length;
  const jobGroupOptions = useMemo(() => {
    return options.jobGroups.filter((option) => option.active);
  }, [options.jobGroups]);
  const careerOptions = useMemo(() => {
    return options.careers.filter((option) => option.active);
  }, [options.careers]);

  const jobTitleOptions = useMemo(() => {
    return options.jobTitles.filter((option) => {
      return option.active && option.jobGroupCode === values.jobGroup;
    });
  }, [options.jobTitles, values.jobGroup]);

  useEffect(() => {
    setValues(initialValues);
    setStep(resolveStartStep(initialValues));
  }, [initialValues]);

  useEffect(() => {
    if (!values.jobTitle) {
      return;
    }

    const jobTitleExists = jobTitleOptions.some(
      (option) => option.code === values.jobTitle,
    );

    if (!jobTitleExists) {
      setValues((prev) => ({
        ...prev,
        jobTitle: '',
      }));
      setStep(2);
    }
  }, [jobTitleOptions, values.jobTitle]);

  const complete = () => {
    if (!canProceed(4, values)) {
      return;
    }

    onComplete({
      ...values,
      appealLine: values.appealLine.trim(),
    });
  };

  return (
    <div className="mx-auto flex min-h-[90dvh] w-full max-w-[980px] items-center px-150 py-200 sm:px-300 xl:px-400">
      <section className="rounded-200 border-border-subtle bg-background-default w-full overflow-hidden border">
        <header className="from-fill-brand-subtle-default/70 to-background-default border-border-subtle border-b bg-linear-to-r px-200 py-200 sm:px-300 sm:py-250">
          <div className="mb-125 flex items-center justify-between gap-100">
            <div className="rounded-500 bg-background-default inline-flex items-center gap-75 px-100 py-50">
              <Sparkles className="text-text-brand h-14 w-14" />
              <span className="font-designer-12b text-text-brand">
                멘토 등록 시작
              </span>
            </div>
            <button
              type="button"
              className="font-designer-13b text-text-subtle hover:text-text-default"
              onClick={onSkip}
            >
              건너뛰고 직접 입력
            </button>
          </div>

          <div className="mb-75 flex items-center gap-100">
            <MessageCircle className="text-text-brand h-20 w-20" />
            <h1 className="font-designer-28b text-text-default">
              어떤 멘토로 활동하실 건가요?
            </h1>
          </div>
          <p className="font-designer-14r text-text-subtle mb-150">
            4단계만 선택하면 멘토 등록 폼이 자동으로 채워집니다.
          </p>

          <div className="grid grid-cols-4 gap-75">
            {STEP_ORDERS.map((order) => (
              <span
                key={order}
                className={cn(
                  'rounded-500 h-50',
                  order <= step
                    ? 'bg-fill-brand-default-default'
                    : 'bg-border-subtle',
                )}
              />
            ))}
          </div>
        </header>

        <div className="px-200 py-250 sm:px-300 sm:py-300">
          <p className="font-designer-12b text-text-brand mb-50">
            {step} / {STEP_ORDERS.length} 단계
          </p>
          <h2 className="font-designer-22b text-text-default mb-75">
            {getStepTitle(step)}
          </h2>
          <p className="font-designer-13r text-text-subtle mb-200">
            {getStepDescription(step)}
          </p>

          {step === 1 && (
            <div className="grid grid-cols-1 gap-100 sm:grid-cols-2 lg:grid-cols-4">
              {jobGroupOptions.map((group) => (
                <button
                  key={group.code}
                  type="button"
                  className={cn(
                    'font-designer-14b rounded-125 border px-125 py-150 text-left transition-colors',
                    values.jobGroup === group.code
                      ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                      : 'border-border-subtle bg-background-default text-text-default hover:border-border-brand',
                  )}
                  onClick={() => {
                    setValues((prev) => ({
                      ...prev,
                      jobGroup: group.code,
                      jobTitle: '',
                    }));
                    setStep(2);
                  }}
                >
                  {group.label}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-100 sm:grid-cols-2">
              {jobTitleOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  className={cn(
                    'font-designer-14m rounded-125 border px-125 py-125 text-left transition-colors',
                    values.jobTitle === option.code
                      ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                      : 'border-border-subtle bg-background-default text-text-default hover:border-border-brand',
                  )}
                  onClick={() => {
                    setValues((prev) => ({
                      ...prev,
                      jobTitle: option.code,
                    }));
                    setStep(3);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 gap-100 sm:grid-cols-2">
              {careerOptions.map((career) => (
                <button
                  key={career.code}
                  type="button"
                  className={cn(
                    'font-designer-14m rounded-125 border px-125 py-125 text-left transition-colors',
                    values.careerYears === career.code
                      ? 'border-border-brand bg-fill-brand-subtle-default text-text-brand'
                      : 'border-border-subtle bg-background-default text-text-default hover:border-border-brand',
                  )}
                  onClick={() => {
                    setValues((prev) => ({
                      ...prev,
                      careerYears: career.code,
                    }));
                    setStep(4);
                  }}
                >
                  {career.label}
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div>
              <BaseInput
                value={values.appealLine}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setValues((prev) => ({
                    ...prev,
                    appealLine: nextValue,
                  }));
                }}
                placeholder="한 줄로 강점을 알려주세요"
                maxLength={24}
              />
              <p className="font-designer-12r text-text-subtle mt-75">
                {appealLineLength}/24자
              </p>
              {appealLineLength > 0 && appealLineLength < 2 && (
                <p className="font-designer-12r text-text-error mt-50">
                  한 줄 어필은 2자 이상 입력해주세요.
                </p>
              )}
              <div className="mt-125 flex flex-wrap gap-75">
                {MENTOR_APPEAL_LINE_PRESETS.map((preset) => (
                  <ChipButton
                    key={preset}
                    type="button"
                    variant="preset"
                    onClick={() => {
                      setValues((prev) => ({
                        ...prev,
                        appealLine: preset,
                      }));
                    }}
                  >
                    {preset}
                  </ChipButton>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="border-border-subtle bg-background-alternative flex flex-col-reverse gap-100 border-t px-200 py-150 sm:flex-row sm:items-center sm:justify-between sm:px-300">
          <Button
            type="button"
            color="secondary"
            size="medium"
            className="w-full sm:w-auto"
            icon={<ChevronLeft className="h-14 w-14" />}
            onClick={() => setStep(toPreviousStep(step))}
            disabled={step === 1}
          >
            이전
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              color="primary"
              size="medium"
              className="w-full sm:w-auto"
              onClick={() => {
                if (!canProceed(step, values)) {
                  return;
                }

                setStep(toNextStep(step));
              }}
              disabled={!canProceed(step, values)}
            >
              다음
            </Button>
          ) : (
            <Button
              type="button"
              color="primary"
              size="medium"
              className="w-full sm:w-auto"
              onClick={complete}
              disabled={!canProceed(step, values)}
            >
              등록 폼으로 이동
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}
