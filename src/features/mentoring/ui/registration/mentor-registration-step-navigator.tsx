'use client';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import type { MentorRegistrationVisibleStepId } from '@/types/mentoring/registration-view';
import type { MentorRegistrationStepMeta } from './mentor-registration-form.constants';

interface RegistrationStepNavigatorProps {
  steps: MentorRegistrationStepMeta[];
  currentStepId: MentorRegistrationVisibleStepId;
  onSelectStep: (stepId: MentorRegistrationVisibleStepId) => void;
}

export default function RegistrationStepNavigator({
  steps,
  currentStepId,
  onSelectStep,
}: RegistrationStepNavigatorProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-200 border px-150 py-150 sm:px-200 sm:py-175">
      <div className="mb-125">
        <p className="font-designer-13r text-text-subtle">
          {currentStepIndex + 1} / {steps.length} 단계
        </p>
      </div>
      <div className="flex gap-75 overflow-x-auto pb-25">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isCompleted = index < currentStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              className={cn(
                'rounded-150 min-w-[132px] border px-125 py-100 text-left transition-colors',
                isActive
                  ? 'border-border-brand bg-fill-brand-subtle-default'
                  : 'border-border-subtle bg-background-default hover:border-border-default hover:bg-background-alternative',
              )}
              onClick={() => onSelectStep(step.id)}
            >
              <p
                className={cn(
                  'font-designer-12b mb-25',
                  isActive || isCompleted
                    ? 'text-text-brand'
                    : 'text-text-subtle',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="font-designer-13b text-text-default whitespace-nowrap">
                {step.title}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
