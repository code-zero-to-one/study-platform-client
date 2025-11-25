import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';
import {
  GroupStudyFormSchema,
  GroupStudyFormValues,
} from '../model/group-study-form.schema';
import Step1OpenGroupStudy from './step/step1-group';
import Step2OpenGroupStudy from './step/step2-group';
import Step3OpenGroupStudy from './step/step3-group';

interface GroupStudyFormProps {
  defaultValues: GroupStudyFormValues;
  onSubmit: (values: GroupStudyFormValues) => void;
}

const STEP_FIELDS: Record<1 | 2 | 3, (keyof GroupStudyFormValues)[]> = {
  1: [
    'type',
    'targetRoles',
    'maxMembersCount',
    'experienceLevels',
    'method',
    'location',
    'regularMeeting',
    'startDate',
    'endDate',
  ],
  2: ['thumbnailExtension', 'title', 'description', 'summary'],
  3: ['interviewPost'],
};

export default function GroupStudyForm({
  defaultValues,
  onSubmit,
}: GroupStudyFormProps) {
  const methods = useForm<GroupStudyFormValues>({
    resolver: zodResolver(GroupStudyFormSchema),
    mode: 'onChange',
    defaultValues: defaultValues,
  });

  const { handleSubmit, trigger, formState } = methods;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const ok = await trigger(fields as any, { shouldFocus: false });
    if (!ok) {
      console.log('trigger failed. errors:', methods.formState.errors);

      return;
    }

    if (step < 3) setStep((step + 1) as 1 | 2 | 3);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  return (
    <>
      <Modal.Body className="flex flex-col gap-150">
        <Stepper step={step} />
        <FormProvider {...methods}>
          <form
            id="open-group-form"
            className="flex flex-col gap-400"
            onSubmit={handleSubmit(onSubmit)}
          >
            {step === 1 && <Step1OpenGroupStudy />}
            {step === 2 && <Step2OpenGroupStudy />}
            {step === 3 && <Step3OpenGroupStudy />}
          </form>
        </FormProvider>
      </Modal.Body>

      <Modal.Footer className="flex justify-between gap-100">
        <div>
          {step > 1 && (
            <Button
              color="secondary"
              size="large"
              onClick={goPrev}
              type="button"
            >
              이전
            </Button>
          )}
        </div>

        <div className="flex gap-100">
          <Modal.Close asChild>
            <Button color="secondary" size="large">
              취소
            </Button>
          </Modal.Close>

          {step < 3 ? (
            <Button
              key="next"
              size="large"
              color="primary"
              type="button"
              onClick={goNext}
            >
              다음
            </Button>
          ) : (
            <Button
              key="submit"
              size="large"
              color="primary"
              type="submit"
              form="open-group-form"
              disabled={!formState.isValid || formState.isSubmitting}
            >
              {formState.isSubmitting ? '제출 중…' : '제출'}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const dot = (n: 1 | 2 | 3) => {
    const active = step === n;

    return (
      <div
        key={n}
        aria-current={active ? 'step' : undefined}
        className={[
          'font-designer-13b flex h-300 w-300 items-center justify-center rounded-full',
          active
            ? 'bg-background-brand-default text-text-inverse'
            : 'bg-background-disabled text-text-disabled',
          'font-bold',
        ].join(' ')}
      >
        {n}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-75">
      {[1, 2, 3].map((n) => dot(n as 1 | 2 | 3))}
    </div>
  );
}
