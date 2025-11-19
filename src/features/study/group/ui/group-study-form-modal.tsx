'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { sendGTMEvent } from '@next/third-parties/google';
import { useQueryClient } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/shared/ui/button';
import { Modal } from '@/shared/ui/modal';

import Step1OpenGroupStudy from './step/step1-group';
import Step2OpenGroupStudy from './step/step2-group';
import Step3OpenGroupStudy from './step/step3-group';
import { createGroupStudy } from '../api/creat-group-study';
import { GroupStudyDetailResponse } from '../api/group-study-types';

import {
  buildOpenGroupDefaultValues,
  GroupStudyFormSchema,
  GroupStudyFormValues,
  toOpenGroupRequest,
} from '../model/group-study-form.schema';
import { useGroupStudyDetailQuery } from '../model/use-study-query';

interface GroupStudyModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: () => void;
  mode: 'create' | 'edit';
  groupStudyId?: number;
}

export default function GroupStudyFormModal({
  trigger,
  mode,
  open: controlledOpen = false,
  groupStudyId,
  onOpenChange: onControlledOpen,
}: GroupStudyModalProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState<boolean>(false);
  // const { mutateAsync: createGroupStudy } = useCreateGroupStudyMutation();
  const { data: groupStudyInfo, isLoading } = useGroupStudyDetailQuery(
    groupStudyId!,
  );

  console.log('groupStudyInfo', groupStudyInfo);

  const refineStudyDetail = (value: any) => {
    if (isLoading) return;

    return {
      type: value.basicInfo.type,
      targetRoles: value.basicInfo.targetRoles,
      maxMembersCount: value.basicInfo.maxMembersCount.toString(),
      experienceLevels: value.basicInfo.experienceLevels,
      method: value.basicInfo.method,
      location: value.basicInfo.location,
      regularMeeting: value.basicInfo.regularMeeting,
      startDate: value.basicInfo.startDate,
      endDate: value.basicInfo.endDate,
      price: value.basicInfo.price.toString(),
      title: value.detailInfo.title,
      description: value.detailInfo.description,
      summary: value.detailInfo.summary,
      interviewPost: value.interviewPost.interviewPost,
      thumbnailExtension: value.detailInfo.thumbnailExtension,
    };
  };

  const uploadThumbnail = async (
    uploadUrl: string,
    file: File | null | undefined,
  ) => {
    if (!uploadUrl || !file) return;

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
  };

  const invalidateGroupStudyQueries = async () => {
    await qc.invalidateQueries({ queryKey: ['groupStudies'] });
    await qc.invalidateQueries({ queryKey: ['memberStudies'] });
  };

  const handleCreate = async (values: GroupStudyFormValues) => {
    try {
      const body = toOpenGroupRequest(values);
      const created = await createGroupStudy(body);

      await uploadThumbnail(
        created.content.thumbnailUploadUrl,
        values.thumbnailFile,
      );

      sendGTMEvent({
        event: 'group_study_create_success',
        group_study_id: String(created.content.groupStudyId),
      });
      alert('그룹 스터디 개설이 완료되었습니다!');

      await invalidateGroupStudyQueries();
    } catch (err) {
      alert('그룹 스터디 개설 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleEdit = async (values: GroupStudyFormValues) => {
    try {
      const body = toOpenGroupRequest(values);
      // const updated = await updateGroupStudy(body);

      // await uploadThumbnail(
      //   updated.content.thumbnailUploadUrl,
      //   values.thumbnailFile,
      // );

      alert('그룹 스터디 수정이 완료되었습니다!');

      await invalidateGroupStudyQueries();
    } catch (err) {
      alert('그룹 스터디 수정 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  const handleSubmitForm = async (values: GroupStudyFormValues) => {
    if (mode === 'create') {
      await handleCreate(values);
    } else {
      await handleEdit(values);
    }
  };

  // useEffect(() => {
  //   if (open) {
  //     sendGTMEvent({
  //       event: 'group_study_create_modal_open',
  //     });
  //   }
  // }, [open]);

  return (
    <Modal.Root
      open={mode === 'create' ? open : controlledOpen}
      onOpenChange={mode === 'create' ? () => setOpen(false) : onControlledOpen}
    >
      {trigger && <Modal.Trigger asChild>{trigger}</Modal.Trigger>}
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content size="large">
          <Modal.Header className="border-border-default flex items-center justify-between border-b">
            <Modal.Title className="font-designer-20b">
              {mode === 'create' ? '스터디 개설하기' : '스터디 수정하기'}
            </Modal.Title>
            <Modal.Close>
              <XIcon />
            </Modal.Close>
          </Modal.Header>
          <GroupStudyForm
            defaultValues={
              mode === 'create'
                ? buildOpenGroupDefaultValues()
                : refineStudyDetail(groupStudyInfo!)
            }
            onSubmit={handleSubmitForm}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface GroupStudyFormProps {
  defaultValues: GroupStudyFormValues;
  onSubmit: (values: GroupStudyFormValues) => void;
}

function GroupStudyForm({ defaultValues, onSubmit }: GroupStudyFormProps) {
  const methods = useForm<GroupStudyFormValues>({
    resolver: zodResolver(GroupStudyFormSchema),
    mode: 'onChange',
    defaultValues: defaultValues,
  });
  const { handleSubmit, trigger, formState } = methods;

  const [step, setStep] = useState<1 | 2 | 3>(1);

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
