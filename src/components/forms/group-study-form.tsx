import { zodResolver } from '@hookform/resolvers/zod';
import { createContext, useContext, useMemo, useState } from 'react';
import {
  FormProvider,
  type UseFormReturn,
  useForm,
  useWatch,
} from 'react-hook-form';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Button from '@/components/common/ui/button';
import { Modal } from '@/components/common/ui/modal';

import GroupStudyStepBasicInfo from '@/components/forms/group-study-steps/group-study-step-basic-info';
import GroupStudyStepIntroduction from '@/components/forms/group-study-steps/group-study-step-introduction';
import { useToastStore } from '@/stores/use-toast-store';
import {
  GroupStudyFormSchema,
  type GroupStudyFormValues,
  type StudyClassification,
} from '@/types/schemas/group-study-form.schema';
import GroupStudyStepApplication from './group-study-steps/group-study-step-application';

const ClassificationContext = createContext<StudyClassification>('GROUP_STUDY');
export const useClassification = () => useContext(ClassificationContext);

const ModeContext = createContext<'create' | 'edit'>('create');
export const useMode = () => useContext(ModeContext);

interface GroupStudyFormProps {
  defaultValues?: GroupStudyFormValues;
  methods?: UseFormReturn<GroupStudyFormValues>;
  onSubmit: (values: GroupStudyFormValues) => void;
  mode?: 'create' | 'edit';
}

const STEP_FIELDS: Record<1 | 2 | 3, (keyof GroupStudyFormValues)[]> = {
  1: [
    'studyLeaderParticipation',
    'type',
    'targetRoles',
    'maxMembersCount',
    'experienceLevels',
    'method',
    'location',
    'regularMeeting',
    'startDate',
    'endDate',
    'price',
  ],
  2: ['thumbnailExtension', 'title', 'description', 'summary'],
  3: ['interviewPost'],
};

export default function GroupStudyForm({
  defaultValues,
  methods: externalMethods,
  onSubmit,
  mode = 'create',
}: GroupStudyFormProps) {
  const showToast = useToastStore((state) => state.showToast);
  const internalMethods = useForm<GroupStudyFormValues>({
    resolver: zodResolver(GroupStudyFormSchema),
    mode: 'onChange',
    defaultValues,
  });

  const methods = externalMethods ?? internalMethods;

  const { handleSubmit, trigger, formState, control } = methods;
  const classification = useWatch({ name: 'classification', control });

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const currentStepFields = STEP_FIELDS[step];
  const currentStepValues = useWatch({ name: currentStepFields, control });

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const ok = await trigger(fields, {
      shouldFocus: false,
    });
    if (!ok) {
      showToast('스터디 개설 정보를 확인해주세요.', 'error');

      return;
    }

    if (step < 3) setStep((step + 1) as 1 | 2 | 3);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const isNextButtonDisabled = useMemo(() => {
    return currentStepFields.some((field, index) => {
      const value = currentStepValues[index];
      const error = formState.errors[field];

      // 에러가 있으면 비활성화
      if (error) return true;

      // 필수 필드가 비어있으면 비활성화
      if (field === 'studyLeaderParticipation') {
        return typeof value !== 'boolean';
      }
      if (field === 'price') {
        // PREMIUM_STUDY일 때만 price 필수
        if (classification === 'PREMIUM_STUDY') {
          return !value || (typeof value === 'string' && value.trim() === '');
        }

        return false;
      }
      if (field === 'targetRoles' || field === 'experienceLevels') {
        return !value || (Array.isArray(value) && value.length === 0);
      }
      if (
        field === 'maxMembersCount' ||
        field === 'startDate' ||
        field === 'endDate' ||
        field === 'title' ||
        field === 'summary' ||
        field === 'description'
      ) {
        return typeof value !== 'string' || value.trim() === '';
      }
      if (field === 'thumbnailExtension') {
        return !value || value === 'DEFAULT';
      }
      if (field === 'interviewPost') {
        return (
          !value ||
          !Array.isArray(value) ||
          value.length === 0 ||
          value.some((q) => typeof q !== 'string' || q.trim() === '')
        );
      }

      return false;
    });
  }, [currentStepFields, currentStepValues, formState.errors, classification]);

  return (
    <ModeContext.Provider value={mode}>
      <ClassificationContext.Provider value={classification}>
        <Modal.Body className="flex flex-col gap-150">
          <Stepper step={step} />
          <FormProvider {...methods}>
            <form
              id="open-group-form"
              className="flex flex-col gap-400"
              onSubmit={handleSubmit(onSubmit)}
            >
              {step === 1 && <GroupStudyStepBasicInfo />}
              {step === 2 && <GroupStudyStepIntroduction />}
              {step === 3 && <GroupStudyStepApplication />}
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
                disabled={isNextButtonDisabled}
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
      </ClassificationContext.Provider>
    </ModeContext.Provider>
  );
}

const STEP_LABELS: Record<1 | 2 | 3, string> = {
  1: '기본 정보',
  2: '스터디 소개',
  3: '지원 & 규칙 설정',
};

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const renderStep = (n: 1 | 2 | 3) => {
    const isActive = step === n;
    const isCompleted = step > n;

    return (
      <div key={n} className="flex items-center gap-75">
        <div
          aria-current={isActive ? 'step' : undefined}
          className={cn(
            'font-designer-13b flex h-300 w-300 shrink-0 items-center justify-center rounded-full',
            isActive && 'bg-background-brand-default text-text-inverse',
            isCompleted && 'bg-background-brand-subtle text-text-brand',
            !isActive &&
              !isCompleted &&
              'bg-background-disabled text-text-disabled',
          )}
        >
          {n}
        </div>
        <span
          className={cn(
            'font-designer-13m whitespace-nowrap',
            isActive && 'text-text-default',
            isCompleted && 'text-text-subtle',
            !isActive && !isCompleted && 'text-text-disabled',
          )}
        >
          {STEP_LABELS[n]}
        </span>
        {n < 3 && (
          <div className="bg-border-default mx-75 h-px flex-1 min-w-50" />
        )}
      </div>
    );
  };

  return (
    <nav aria-label="스터디 개설 단계" className="flex w-full items-center">
      {([1, 2, 3] as const).map((n) => renderStep(n))}
    </nav>
  );
}
