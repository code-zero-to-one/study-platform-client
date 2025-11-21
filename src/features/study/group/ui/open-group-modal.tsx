'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

import {
  OpenGroupFormSchema,
  type OpenGroupFormValues,
  buildOpenGroupDefaultValues,
  toOpenGroupRequest,
} from '../model/open-group-form.schema';
import Step1OpenGroupStudy from './step/step1-group';
import Step2OpenGroupStudy from './step/step2-group';
import Step3OpenGroupStudy from './step/step3-group';
import { useCreateGroupStudyMutation } from '../const/use-group-study-mutation';

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

interface OpenGroupStudyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function OpenGroupStudyModal({
  trigger,
}: OpenGroupStudyModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      sendGTMEvent({
        event: 'group_study_create_modal_open',
      });
    }
  }, [open]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      {trigger && <Modal.Trigger asChild>{trigger}</Modal.Trigger>}
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-20b">
              그룹 개설하기
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <OpenGroupStudyForm onClose={() => setOpen(false)} />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

function OpenGroupStudyForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const { mutateAsync: createGroupStudy } = useCreateGroupStudyMutation();

  const methods = useForm<OpenGroupFormValues>({
    resolver: zodResolver(OpenGroupFormSchema),
    mode: 'onChange',
    defaultValues: buildOpenGroupDefaultValues(),
  });
  const { handleSubmit, trigger, formState } = methods;

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const STEP_FIELDS: Record<1 | 2 | 3, (keyof OpenGroupFormValues)[]> = {
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

  const goNext = async () => {
    const fields = STEP_FIELDS[step];
    const ok = await trigger(fields as any, { shouldFocus: true });
    if (!ok) {
      console.log('trigger failed. errors:', methods.formState.errors);

      return;
    }

    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const goPrev = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const onValidSubmit = async (values: OpenGroupFormValues) => {
    try {
      const body = toOpenGroupRequest(values);

      const created = await createGroupStudy(body);

      const uploadUrl: string = created.content.thumbnailUploadUrl;
      const file = methods.getValues('thumbnailFile');

      if (uploadUrl && file) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(uploadUrl, {
          method: 'PUT',
          body: formData,
        });

        if (!res.ok) {
          console.error('파일 업로드 실패:', res.status, res.statusText);
        } else {
          console.log('파일 업로드 성공!');
        }
      }
      sendGTMEvent({
        event: 'group_study_create_success',
        group_study_id: String(created.content.groupStudyId),
      });
      alert('그룹 스터디 개설이 완료되었습니다!');

      onClose();
      await qc.invalidateQueries({
        queryKey: ['groupStudies'],
      });
      await qc.invalidateQueries({
        queryKey: ['memberStudies'],
      });
    } catch (err) {
      sendGTMEvent({
        event: 'group_study_create_error',
      });
      alert('그룹 스터디 개설 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <>
      <Modal.Body className="flex flex-col gap-150">
        <Stepper step={step} />
        <FormProvider {...methods}>
          <form
            id="open-group-form"
            className="flex flex-col gap-400"
            onSubmit={handleSubmit(onValidSubmit)}
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
            <Button size="large" color="primary" type="button" onClick={goNext}>
              다음
            </Button>
          ) : (
            <Button
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
