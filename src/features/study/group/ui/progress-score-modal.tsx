'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '@/shared/ui/button';
import FormField from '@/shared/ui/form/form-field';
import { TextAreaInput } from '@/shared/ui/input';
import { Modal } from '@/shared/ui/modal';
import { GroupItems } from '@/shared/ui/toggle';
import { Grade, UpdateProgressScoreRequest } from '../api/group-study-types';
import {
  ProgressScoreFormSchema,
  ProgressScoreFormValues,
} from '../model/progress-score-form.schema';
import { useProgressGradesQuery } from '../model/use-progress-grades-query';
import { useUpdateProgressScoreMutation } from '../model/use-update-progress-score';

interface ProgressScoreModalModalProps
  extends Pick<UpdateProgressScoreRequest, 'targetMemberId' | 'groupStudyId'> {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function ProgressScoreModal({
  isOpen,
  setIsOpen,
  groupStudyId,
  targetMemberId,
}: ProgressScoreModalModalProps) {
  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Portal>
        <Modal.Overlay />
        <Modal.Content className="w-[840px]">
          <Modal.Header className="border-border-default flex justify-between border-b">
            <Modal.Title className="font-designer-20b text-text-strong">
              진행점수 부여하기
            </Modal.Title>
            <Modal.Close onClick={() => setIsOpen(false)}>
              <XIcon />
            </Modal.Close>
          </Modal.Header>

          <ProgressScoreForm
            groupStudyId={groupStudyId}
            onClose={() => setIsOpen(false)}
            targetMemberId={targetMemberId}
          />
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}

interface ProgressScoreFormProps
  extends Pick<UpdateProgressScoreRequest, 'groupStudyId' | 'targetMemberId'> {
  onClose: () => void;
}

function ProgressScoreForm({
  groupStudyId,
  targetMemberId,
  onClose,
}: ProgressScoreFormProps) {
  const { data } = useProgressGradesQuery();

  const EMPTY_GRADE_ID = 0; // ! gradeId가 0인 경우는 선택되지 않은 상태를 의미

  const methods = useForm<ProgressScoreFormValues>({
    resolver: zodResolver(ProgressScoreFormSchema),
    defaultValues: {
      gradeId: EMPTY_GRADE_ID,
      reason: '',
    },
    mode: 'onChange',
  });
  const { handleSubmit, formState } = methods;

  const { mutate: grantProgressScore } =
    useUpdateProgressScoreMutation(groupStudyId);

  const onSubmit = (values: ProgressScoreFormValues) => {
    grantProgressScore(
      { groupStudyId, targetMemberId, ...values },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const gradeOptions = (data?.grades ?? []).map((grade: Grade) => ({
    label: `${grade.code} : ${grade.name}${grade.score > 0 ? ` (+${grade.score})` : ''}`,
    value: grade.id,
  }));

  return (
    <FormProvider {...methods}>
      <Modal.Body className="flex flex-col gap-400 px-400 py-300">
        <form
          id="progress-score-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-400"
        >
          <FormField<ProgressScoreFormValues, 'gradeId'>
            name="gradeId"
            label="진행점수 부여"
            helper="진행점수를 선택해주세요."
            direction="vertical"
            size="medium"
            required
          >
            <GroupItems
              options={gradeOptions}
              multiple={false}
              emptyValue={EMPTY_GRADE_ID}
            />
          </FormField>
          <FormField<ProgressScoreFormValues, 'reason'>
            name="reason"
            label="사유"
            helper="진행점수 부여 사유를 작성해 주세요."
            direction="vertical"
            size="medium"
            counterMax={500}
          >
            <TextAreaInput
              placeholder="진행점수 부여 사유를 작성해 주세요."
              maxLength={500}
              className="h-[136px]"
            />
          </FormField>
        </form>
      </Modal.Body>
      <Modal.Footer className="flex justify-end gap-100">
        <Modal.Close asChild>
          <Button color="secondary" size="large" onClick={onClose}>
            취소
          </Button>
        </Modal.Close>
        <Button
          color="primary"
          size="large"
          type="submit"
          form="progress-score-form"
          disabled={!formState.isValid || formState.isSubmitting}
        >
          완료
        </Button>
      </Modal.Footer>
    </FormProvider>
  );
}
