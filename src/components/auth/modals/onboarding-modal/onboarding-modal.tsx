'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useOnboardingStore } from '@/stores/use-onboarding-store';
import type {
  ClassOnboardingCareer,
  ClassOnboardingInterest,
  ClassOnboardingJob,
  VibeCodingExperienceLevel,
} from '@/types/api/class-onboarding.types';
import { Step1Nickname } from './steps/step-1-nickname';
import { Step2Job } from './steps/step-2-job';
import { Step3Goals } from './steps/step-3-goals';
import { Step4Completion } from './steps/step-4-completion';

type Step = 1 | 2 | 3 | 4;

interface OnboardingData {
  nickname: string;
  profileImageUrl?: string;
  profileImageFile?: File;
  vibeCodingExperienceLevel?: VibeCodingExperienceLevel;
  jobs: ClassOnboardingJob[];
  jobEtcText?: string;
  career?: ClassOnboardingCareer;
  interests: ClassOnboardingInterest[];
  interestEtcText?: string;
  privacyConsent: boolean;
  termsConsent: boolean;
  marketingConsent: boolean;
}

const initialData: OnboardingData = {
  nickname: '',
  jobs: [],
  interests: [],
  privacyConsent: false,
  termsConsent: false,
  marketingConsent: false,
};

export function OnboardingModal() {
  const { isOpen, close } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>(initialData);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setData(initialData);
    }
  }, [isOpen]);

  const updateData = (field: keyof OnboardingData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as Step);
  };

  if (!mounted || !isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Nickname
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onSubmittingChange={setIsSubmitting}
          />
        );
      case 2:
        return (
          <Step2Job
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onSubmittingChange={setIsSubmitting}
          />
        );
      case 3:
        return (
          <Step3Goals
            data={data}
            updateData={updateData}
            onNext={handleNext}
            onSubmittingChange={setIsSubmitting}
          />
        );
      case 4:
        return <Step4Completion nickname={data.nickname} />;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={isSubmitting ? undefined : close}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div className="relative flex max-h-modal w-full max-w-7500 flex-col overflow-hidden rounded-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-500 pt-400 pb-300">
          {/* Back button */}
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-100 p-100 text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="이전"
            >
              <X className="h-300 w-300 rotate-135" />
            </button>
          ) : (
            <div className="size-500" />
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-100">
            {([1, 2, 3, 4] as Step[]).map((step) => (
              <div
                key={step}
                className={cn(
                  'rounded-full bg-gray-300 transition-all duration-300',
                  step === currentStep ? 'h-125 w-350 bg-rose-500' : 'size-125',
                )}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="rounded-100 p-100 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="닫기"
          >
            <X className="h-300 w-300" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-500 pb-500">
          <div
            key={currentStep}
            className="animate-in slide-in-from-right-4 fade-in fill-mode-forwards flex flex-col duration-300"
          >
            {renderStep()}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
