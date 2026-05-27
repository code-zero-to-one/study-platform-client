'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useClassOnboardingStep3Mutation } from '@/hooks/queries/class-onboarding/use-class-onboarding-mutation';
import {
  INTEREST_OPTIONS,
  type ClassOnboardingInterest,
} from '@/types/api/class-onboarding.types';

interface Step3Data {
  interests: ClassOnboardingInterest[];
  interestEtcText?: string;
}

interface Step3GoalsProps {
  data: Step3Data;
  updateData: (field: keyof Step3Data, value: unknown) => void;
  onNext: () => void;
  onSubmittingChange: (v: boolean) => void;
}

export function Step3Goals({
  data,
  updateData,
  onNext,
  onSubmittingChange,
}: Step3GoalsProps) {
  const { mutate: saveStep3, isPending } = useClassOnboardingStep3Mutation();

  const interests = data.interests;
  const isOtherSelected = interests.includes('OTHER');
  const canProceed =
    interests.length >= 1 &&
    (!isOtherSelected || !!data.interestEtcText?.trim());

  const toggleInterest = (value: ClassOnboardingInterest) => {
    if (interests.includes(value)) {
      updateData(
        'interests',
        interests.filter((i) => i !== value),
      );
      if (value === 'OTHER') updateData('interestEtcText', '');
    } else if (interests.length < 2) {
      updateData('interests', [...interests, value]);
    }
  };

  const handleNext = () => {
    if (!canProceed || isPending) return;
    onSubmittingChange(true);
    saveStep3(
      {
        interests,
        ...(isOtherSelected && data.interestEtcText?.trim()
          ? { interestEtcText: data.interestEtcText.trim() }
          : {}),
      },
      {
        onSuccess: () => {
          onSubmittingChange(false);
          onNext();
        },
        onError: () => {
          onSubmittingChange(false);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-400">
      <div className="flex flex-col gap-150">
        <p className="font-designer-18b text-gray-800">
          어떤 걸 만들어 보고 싶으세요?
        </p>
        <p className="font-designer-14r text-gray-500">
          신규 코스 기획에 활용될 예정입니다(최대 2개 선택).
        </p>
      </div>

      <div className="flex flex-col gap-160">
        {INTEREST_OPTIONS.map((option) => {
          const selected = interests.includes(option.value);
          const isDisabled = !selected && interests.length >= 2;
          const isOtc = option.value === 'OTHER';

          return (
            <div key={option.value} className="flex flex-col gap-150">
              <button
                type="button"
                onClick={() => toggleInterest(option.value)}
                disabled={isDisabled}
                className={cn(
                  'h-700 rounded-150 border px-188 text-left transition-all duration-200',
                  selected
                    ? 'border-rose-500 font-designer-16b text-rose-500'
                    : isDisabled
                      ? 'cursor-not-allowed border-gray-200 font-designer-16r text-gray-300'
                      : 'border-gray-300 font-designer-16r text-gray-500 hover:border-rose-300',
                )}
              >
                {option.label}
              </button>
              {isOtc && isOtherSelected && (
                <textarea
                  value={data.interestEtcText ?? ''}
                  onChange={(e) =>
                    updateData('interestEtcText', e.target.value)
                  }
                  placeholder="내용을 입력해주세요."
                  rows={3}
                  className="resize-none rounded-150 border border-rose-500 px-188 py-200 font-designer-14r text-gray-800 outline-none placeholder:text-gray-500"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!canProceed || isPending}
        className={cn(
          'h-700 w-full rounded-100 font-designer-16b transition-colors',
          canProceed && !isPending
            ? 'bg-rose-500 text-white hover:bg-rose-600'
            : 'cursor-not-allowed bg-gray-200 text-gray-400',
        )}
      >
        다음
      </button>
    </div>
  );
}
