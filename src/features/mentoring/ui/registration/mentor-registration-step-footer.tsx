'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/common/ui/button';

interface RegistrationStepFooterProps {
  currentStepIndex: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function RegistrationStepFooter({
  currentStepIndex,
  totalSteps,
  onPrevious,
  onNext,
}: RegistrationStepFooterProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="border-border-subtle mt-200 flex justify-end gap-100 border-t pt-200">
      <Button
        type="button"
        color="secondary"
        size="medium"
        disabled={isFirstStep}
        onClick={onPrevious}
      >
        <ChevronLeft className="mr-50 h-14 w-14" />
        이전
      </Button>
      {!isLastStep && (
        <Button type="button" color="primary" size="medium" onClick={onNext}>
          다음
          <ChevronRight className="ml-50 h-14 w-14" />
        </Button>
      )}
    </div>
  );
}
